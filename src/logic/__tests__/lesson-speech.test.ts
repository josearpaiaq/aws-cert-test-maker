import { parseLesson } from '@/logic/lesson-markdown';
import {
  activeSegment,
  chunkParagraphs,
  lessonToSpeech,
  lessonToSpeechSegments,
} from '@/logic/lesson-speech';

const lesson = { taskStatement: '3.6', title: 'AWS storage services' };
const speak = (markdown: string, diagrams: Record<string, string> = {}) =>
  lessonToSpeech(lesson, parseLesson(markdown), diagrams);

describe('lessonToSpeech', () => {
  it('opens with the task number and title', () => {
    expect(speak('')[0]).toBe('Task 3.6. AWS storage services.');
  });

  it('reads headings and paragraphs as sentences, without Markdown symbols', () => {
    expect(speak('## Block storage\n\nUse **EBS** for volumes').slice(1)).toEqual([
      'Block storage.',
      'Use EBS for volumes.',
    ]);
  });

  it('does not add a second full stop', () => {
    expect(speak('Already ends.')[1]).toBe('Already ends.');
  });

  it('reads list items one by one, numbering ordered lists', () => {
    expect(speak('- first\n- second').slice(1)).toEqual(['first.', 'second.']);
    expect(speak('1. Who patches it? **You.**')[1]).toBe('1. Who patches it? You.');
  });

  it('turns each table row into sentences that name the columns', () => {
    const spoken = speak(
      '| Class | Use it when | Speed |\n|---|---|---|\n| S3 Standard | Accessed often | Milliseconds |',
    );

    expect(spoken[1]).toBe('S3 Standard. Use it when: Accessed often. Speed: Milliseconds.');
  });

  it('announces callouts by kind', () => {
    expect(speak('> [!EXAM] Watch the keywords')[1]).toBe('On the exam: Watch the keywords.');
    expect(speak('> [!TIP] Remember this')[1]).toBe('Tip: Remember this.');
  });

  it('speaks a diagram description and skips unknown diagrams', () => {
    expect(speak('{{diagram:flow}}', { flow: 'Objects move to cheaper storage' })[1]).toBe(
      'Objects move to cheaper storage.',
    );
    expect(speak('{{diagram:missing}}')).toHaveLength(1);
  });
});

describe('chunkParagraphs', () => {
  it('keeps everything in one chunk when it fits', () => {
    expect(chunkParagraphs(['One.', 'Two.'], 100)).toEqual(['One.\n\nTwo.']);
  });

  it('starts a new chunk before the limit is exceeded', () => {
    const chunks = chunkParagraphs(['a'.repeat(60), 'b'.repeat(60), 'c'.repeat(60)], 130);

    expect(chunks).toHaveLength(2);
    expect(chunks.every((chunk) => chunk.length <= 130)).toBe(true);
  });

  it('splits one over-long paragraph between sentences', () => {
    const long = 'First sentence here. Second sentence here. Third sentence here.';

    const chunks = chunkParagraphs([long], 45);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 45)).toBe(true);
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(long);
  });

  it('loses no text', () => {
    const paragraphs = Array.from({ length: 40 }, (_, i) => `Paragraph number ${i}.`);

    expect(chunkParagraphs(paragraphs, 200).join('\n\n')).toBe(paragraphs.join('\n\n'));
  });

  it('returns nothing for no paragraphs', () => {
    expect(chunkParagraphs([], 100)).toEqual([]);
  });
});

describe('lessonToSpeechSegments', () => {
  it('links each spoken segment to its block, and list items and table rows to their index', () => {
    const blocks = parseLesson(
      '## Heading\n\nIntro text\n\n- one\n- two\n\n| A | B |\n|---|---|\n| r1 | x |\n| r2 | y |',
    );

    const segments = lessonToSpeechSegments(lesson, blocks, {});

    expect(segments.map(({ block, item }) => [block, item])).toEqual([
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, 0],
      [2, 1],
      [3, 0],
      [3, 1],
    ]);
  });

  it('skips diagrams without a description but keeps later block indexes right', () => {
    const segments = lessonToSpeechSegments(lesson, parseLesson('{{diagram:x}}\n\nAfter'), {});

    expect(segments.at(-1)).toMatchObject({ text: 'After.', block: 1 });
  });
});

describe('activeSegment', () => {
  const timings = [
    [0, -1, -1],
    [2000, 0, -1],
    [5000, 2, 1],
  ] as const;

  it('returns the segment whose start is the latest one not after the position', () => {
    expect(activeSegment(timings, 0)).toEqual({ block: -1, item: -1 });
    expect(activeSegment(timings, 4999)).toEqual({ block: 0, item: -1 });
    expect(activeSegment(timings, 5000)).toEqual({ block: 2, item: 1 });
    expect(activeSegment(timings, 99999)).toEqual({ block: 2, item: 1 });
  });

  it('returns null before the first segment and for no timings', () => {
    expect(activeSegment([[100, 0, -1]], 50)).toBeNull();
    expect(activeSegment([], 10)).toBeNull();
  });
});
