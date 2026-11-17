import type { Block, Span } from '@/logic/lesson-markdown';

/**
 * Turns a lesson into text meant to be heard: tables become sentences, callouts are announced,
 * and diagrams are replaced by their descriptions. This file has no runtime imports so the
 * audio generation script can load it directly with Node.
 */

const CALLOUT_LABEL = { tip: 'Tip', note: 'Note', exam: 'On the exam' } as const;

const text = (spans: Span[]) =>
  spans
    .map((span) => span.text)
    .join('')
    .trim();

/** Ends a phrase with a full stop unless it already ends a sentence. */
const sentence = (phrase: string) => (/[.!?]$/.test(phrase) ? phrase : `${phrase}.`);

/**
 * One spoken paragraph and where it sits in the lesson: `block` is the index of the rendered
 * block (-1 for the spoken title), and `item` the list item or table row inside it (-1 if none).
 */
export type SpeechSegment = { text: string; block: number; item: number };

/** The spoken version of a lesson, one segment per paragraph, list item or table row. */
export function lessonToSpeechSegments(
  lesson: { taskStatement: string; title: string },
  blocks: readonly Block[],
  diagramDescriptions: Readonly<Record<string, string>>,
): SpeechSegment[] {
  const segments: SpeechSegment[] = [
    { text: `Task ${lesson.taskStatement}. ${sentence(lesson.title)}`, block: -1, item: -1 },
  ];
  const add = (spoken: string, block: number, item = -1) => {
    if (spoken.length > 1) segments.push({ text: spoken, block, item });
  };

  blocks.forEach((block, index) => {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
        add(sentence(text(block.spans)), index);
        break;
      case 'list':
        block.items.forEach((item, itemIndex) => {
          add(
            sentence(`${block.ordered ? `${itemIndex + 1}. ` : ''}${text(item)}`),
            index,
            itemIndex,
          );
        });
        break;
      case 'table':
        block.rows.forEach((row, rowIndex) => {
          const details = row
            .slice(1)
            .map((cell, column) => `${text(block.header[column + 1] ?? [])}: ${text(cell)}`)
            .map(sentence);
          add([sentence(text(row[0] ?? [])), ...details].join(' '), index, rowIndex);
        });
        break;
      case 'callout':
        add(sentence(`${CALLOUT_LABEL[block.kind]}: ${text(block.spans)}`), index);
        break;
      case 'diagram': {
        const description = diagramDescriptions[block.id];
        if (description) add(sentence(description), index);
        break;
      }
    }
  });

  return segments;
}

/** The spoken version of a lesson as plain paragraphs. */
export function lessonToSpeech(
  lesson: { taskStatement: string; title: string },
  blocks: readonly Block[],
  diagramDescriptions: Readonly<Record<string, string>>,
): string[] {
  return lessonToSpeechSegments(lesson, blocks, diagramDescriptions).map((segment) => segment.text);
}

/**
 * Where each segment starts in a lesson's audio: [startMs, block, item]. Generated together
 * with the audio by scripts/generate-audio.mjs.
 */
export type SegmentTiming = readonly [startMs: number, block: number, item: number];

/** The segment being spoken at `positionMs`, or null before the first one starts. */
export function activeSegment(
  timings: readonly SegmentTiming[],
  positionMs: number,
): { block: number; item: number } | null {
  let low = 0;
  let high = timings.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (timings[middle][0] <= positionMs) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  if (found === -1) return null;
  return { block: timings[found][1], item: timings[found][2] };
}

/**
 * Groups paragraphs into chunks of at most `maxChars` characters, because speech services limit
 * the text per request. A single paragraph longer than the limit is split between sentences.
 */
export function chunkParagraphs(paragraphs: readonly string[], maxChars: number): string[] {
  const pieces = paragraphs.flatMap((paragraph) =>
    paragraph.length <= maxChars
      ? [paragraph]
      : (paragraph.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) ?? [paragraph]),
  );

  const chunks: string[] = [];
  let current = '';
  for (const piece of pieces.map((p) => p.trim()).filter(Boolean)) {
    if (current && current.length + piece.length + 2 > maxChars) {
      chunks.push(current);
      current = '';
    }
    current = current ? `${current}\n\n${piece}` : piece;
  }
  if (current) chunks.push(current);
  return chunks;
}
