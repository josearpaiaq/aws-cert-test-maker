#!/usr/bin/env node
// Generates the spoken version of every lesson with Amazon Polly and writes:
//   assets/audio/<voice>/<task>.mp3   one file per lesson and voice
//   assets/audio/timings.json         when each paragraph starts, for read-along highlighting
//   assets/audio/manifest.json        a hash of each file's text, so unchanged lessons are skipped
//   src/content/lesson-audio.ts       the require() map the app bundles
//
// Each paragraph (or list item, or table row) is synthesized as its own request, so its exact
// start time in the joined file is known. Paragraph audio is cached in dist/audio-cache, so an
// interrupted run can resume without paying for the same text twice.
//
// Requires the AWS CLI signed in with polly:SynthesizeSpeech, plus ffmpeg and ffprobe.
//
// Usage:
//   node scripts/generate-audio.mjs --dry-run            characters, requests and estimated cost
//   node scripts/generate-audio.mjs                      generate whatever is missing or changed
//   node scripts/generate-audio.mjs --lesson 3.6         one lesson
//   node scripts/generate-audio.mjs --voice ruth         one voice
//   node scripts/generate-audio.mjs --engine neural      cheaper engine (default: generative)
//   node scripts/generate-audio.mjs --concurrency 4      parallel Polly requests (default: 4)
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');
const LESSON_DIR = join(ROOT, 'src/content/lessons');
const AUDIO_DIR = join(ROOT, 'assets/audio');
const CACHE_DIR = join(ROOT, 'dist/audio-cache');
const MANIFEST = join(AUDIO_DIR, 'manifest.json');
const TIMINGS = join(AUDIO_DIR, 'timings.json');
const GENERATED = join(ROOT, 'src/content/lesson-audio.ts');

/** App voice id -> Amazon Polly voice. */
const VOICES = { ruth: 'Ruth', matthew: 'Matthew' };
/** USD per million characters, for the estimate only (https://aws.amazon.com/polly/pricing/). */
const PRICE_PER_MILLION = { generative: 30, neural: 16 };
/** Polly limits the text per request; longer paragraphs are split between sentences. */
const MAX_CHARS_PER_REQUEST = 2500;
/** Bump to force every lesson to be regenerated when the audio format changes. */
const FORMAT_VERSION = 'segments-v1';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const dryRun = flag('dry-run');
const engine = option('engine', 'generative');
const region = option('region', 'us-east-1');
const onlyLesson = option('lesson');
const onlyVoice = option('voice');
const concurrency = Number(option('concurrency', '4'));
if (!(engine in PRICE_PER_MILLION)) throw new Error(`Unknown engine "${engine}"`);
if (onlyVoice && !(onlyVoice in VOICES)) throw new Error(`Unknown voice "${onlyVoice}"`);

/** Runs a command (never through a shell) and resolves with its stdout. */
function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => (stdout += data));
    child.stderr.on('data', (data) => (stderr += data));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve(stdout) : reject(new Error(`${command} failed: ${stderr || stdout}`)),
    );
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha = (text) => createHash('sha256').update(text).digest('hex');

const load = (path) => import(pathToFileURL(join(ROOT, path)).href);
const { parseLesson } = await load('src/logic/lesson-markdown.ts');
const { lessonToSpeechSegments, chunkParagraphs } = await load('src/logic/lesson-speech.ts');
const { DIAGRAM_DESCRIPTIONS } = await load('src/content/diagram-descriptions.ts');

const lessons = [];
for (const file of readdirSync(LESSON_DIR)
  .filter((name) => /^\d.*\.ts$/.test(name))
  .sort()) {
  const module = await import(pathToFileURL(join(LESSON_DIR, file)).href);
  const lesson = Object.values(module).find((value) => value?.taskStatement && value?.body);
  if (!lesson) throw new Error(`${file} does not export a lesson`);
  lessons.push(lesson);
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const timings = existsSync(TIMINGS) ? JSON.parse(readFileSync(TIMINGS, 'utf8')) : {};

const jobs = [];
for (const lesson of lessons) {
  if (onlyLesson && lesson.taskStatement !== onlyLesson) continue;
  const segments = lessonToSpeechSegments(lesson, parseLesson(lesson.body), DIAGRAM_DESCRIPTIONS);
  for (const voice of Object.keys(VOICES)) {
    if (onlyVoice && voice !== onlyVoice) continue;
    const key = `${voice}/${lesson.taskStatement}`;
    const hash = sha(`${FORMAT_VERSION}:${engine}:${VOICES[voice]}:${JSON.stringify(segments)}`);
    const file = join(AUDIO_DIR, voice, `${lesson.taskStatement}.mp3`);
    if (manifest[key]?.hash === hash && existsSync(file) && timings[voice]?.[lesson.taskStatement])
      continue;
    // Each segment becomes one or more requests (long ones are split between sentences).
    const parts = segments.map((segment) => chunkParagraphs([segment.text], MAX_CHARS_PER_REQUEST));
    jobs.push({ key, voice, lesson, segments, parts, hash, file });
  }
}

const requests = jobs.flatMap((job) =>
  job.parts.flat().map((text) => ({
    voice: job.voice,
    text,
    cache: join(CACHE_DIR, job.voice, `${sha(`${engine}:${VOICES[job.voice]}:${text}`)}.mp3`),
  })),
);
const pending = requests.filter((request) => !existsSync(request.cache));
const billedChars = pending.reduce((sum, request) => sum + request.text.length, 0);
const cost = ((billedChars / 1_000_000) * PRICE_PER_MILLION[engine]).toFixed(2);
console.log(
  `${jobs.length} lesson file(s), ${requests.length} paragraph requests (${pending.length} not cached yet).`,
);
console.log(
  `${billedChars.toLocaleString()} characters to send, ${engine} engine, estimated $${cost}.`,
);
if (dryRun) process.exit(0);

// 1. Synthesize every uncached paragraph, a few at a time, retrying when Polly throttles.
let done = 0;
async function synthesize(request) {
  mkdirSync(join(CACHE_DIR, request.voice), { recursive: true });
  const partial = `${request.cache}.part`;
  for (let attempt = 1; ; attempt++) {
    try {
      await run('aws', [
        'polly',
        'synthesize-speech',
        '--region',
        region,
        '--engine',
        engine,
        '--voice-id',
        VOICES[request.voice],
        '--output-format',
        'mp3',
        '--text',
        request.text,
        partial,
      ]);
      renameSync(partial, request.cache);
      break;
    } catch (error) {
      if (attempt >= 6 || !/Throttl|TooManyRequests|ServiceFailure|timed out/i.test(String(error)))
        throw error;
      await sleep(1000 * 2 ** attempt);
    }
  }
  done += 1;
  if (done % 25 === 0 || done === pending.length)
    console.log(`  synthesized ${done}/${pending.length}`);
}
const queue = [...pending];
await Promise.all(
  Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length) await synthesize(queue.shift());
  }),
);

// 2. Join each lesson's paragraphs into one file and record where each paragraph starts.
const duration = async (path) =>
  Number(
    await run('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      path,
    ]),
  );

const scratch = mkdtempSync(join(tmpdir(), 'cloudprep-audio-'));
try {
  for (const [index, job] of jobs.entries()) {
    const files = [];
    const starts = [];
    let position = 0;
    for (const [segmentIndex, segment] of job.segments.entries()) {
      starts.push([Math.round(position * 1000), segment.block, segment.item]);
      for (const text of job.parts[segmentIndex]) {
        const cache = join(
          CACHE_DIR,
          job.voice,
          `${sha(`${engine}:${VOICES[job.voice]}:${text}`)}.mp3`,
        );
        files.push(cache);
        position += await duration(cache);
      }
    }
    const list = join(scratch, `${index}.txt`);
    writeFileSync(list, files.map((file) => `file '${file}'`).join('\n'));
    mkdirSync(join(AUDIO_DIR, job.voice), { recursive: true });
    // Re-encoding while joining keeps the paragraph boundaries exactly where they were measured.
    await run('ffmpeg', [
      '-y',
      '-v',
      'error',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      list,
      '-ac',
      '1',
      '-ar',
      '24000',
      '-b:a',
      '48k',
      job.file,
    ]);

    timings[job.voice] ??= {};
    timings[job.voice][job.lesson.taskStatement] = starts;
    manifest[job.key] = { hash: job.hash, engine, segments: job.segments.length };
    writeFileSync(TIMINGS, `${JSON.stringify(timings)}\n`);
    writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(
      `[${index + 1}/${jobs.length}] ${job.key} joined (${job.segments.length} paragraphs)`,
    );
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

// 3. Rebuild the require() map from the files that exist, so the app only lists real audio.
const entries = Object.keys(VOICES).map((voice) => {
  const lines = lessons
    .filter((lesson) => existsSync(join(AUDIO_DIR, voice, `${lesson.taskStatement}.mp3`)))
    .map(
      (lesson) =>
        `    '${lesson.taskStatement}': require('../../assets/audio/${voice}/${lesson.taskStatement}.mp3'),`,
    );
  return `  ${voice}: {\n${lines.join('\n')}${lines.length ? '\n' : ''}  },`;
});
writeFileSync(
  GENERATED,
  `// Generated by scripts/generate-audio.mjs. Do not edit by hand.
import type { SegmentTiming } from '@/logic/lesson-speech';

import timingsJson from '../../assets/audio/timings.json';

export type VoiceId = ${Object.keys(VOICES)
    .map((v) => `'${v}'`)
    .join(' | ')};

/** Display names of the narrator voices (Amazon Polly, AI-generated). */
export const VOICE_NAMES: Record<VoiceId, string> = { ${Object.entries(VOICES)
    .map(([id, name]) => `${id}: '${name}'`)
    .join(', ')} };

/** Bundled audio per voice and lesson (task statement). A missing entry means no audio yet. */
export const LESSON_AUDIO: Record<VoiceId, Record<string, number>> = {
${entries.join('\n')}
};

/** When each paragraph starts in each lesson's audio, per voice and lesson. */
export const LESSON_TIMINGS = timingsJson as unknown as Record<
  VoiceId,
  Record<string, readonly SegmentTiming[]>
>;
`,
);
console.log('Updated src/content/lesson-audio.ts');
