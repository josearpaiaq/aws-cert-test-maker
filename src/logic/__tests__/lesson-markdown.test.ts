import { parseInline, parseLesson, plainText } from '@/logic/lesson-markdown';

describe('parseInline', () => {
  it('splits bold and plain text', () => {
    expect(parseInline('Use **S3** for objects')).toEqual([
      { text: 'Use ', bold: false },
      { text: 'S3', bold: true },
      { text: ' for objects', bold: false },
    ]);
  });

  it('keeps an unmatched marker as plain text', () => {
    expect(parseInline('a ** b')).toEqual([{ text: 'a ** b', bold: false }]);
  });

  it('returns nothing for empty text', () => {
    expect(parseInline('')).toEqual([]);
  });
});

describe('parseLesson', () => {
  it('parses headings at two levels', () => {
    expect(parseLesson('## Big\n### Small')).toEqual([
      { type: 'heading', level: 2, spans: [{ text: 'Big', bold: false }] },
      { type: 'heading', level: 3, spans: [{ text: 'Small', bold: false }] },
    ]);
  });

  it('joins consecutive lines into one paragraph and splits on blank lines', () => {
    const blocks = parseLesson('First line\nsame paragraph\n\nSecond');

    expect(blocks.map((b) => (b.type === 'paragraph' ? plainText(b.spans) : b.type))).toEqual([
      'First line same paragraph',
      'Second',
    ]);
  });

  it('parses bullet and numbered lists', () => {
    const [bullets, numbers] = parseLesson('- one\n- **two**\n\n1. first\n2. second');

    expect(bullets).toMatchObject({ type: 'list', ordered: false });
    expect(bullets.type === 'list' && bullets.items).toHaveLength(2);
    expect(numbers).toMatchObject({ type: 'list', ordered: true });
  });

  it('ends a paragraph when a list starts without a blank line', () => {
    expect(parseLesson('Intro\n- item').map((b) => b.type)).toEqual(['paragraph', 'list']);
  });

  it('parses a table with a header row', () => {
    const [table] = parseLesson(
      '| Class | Cost |\n|---|---|\n| Standard | High |\n| Glacier | Low |',
    );

    expect(table.type).toBe('table');
    if (table.type !== 'table') return;
    expect(table.header.map(plainText)).toEqual(['Class', 'Cost']);
    expect(table.rows.map((row) => row.map(plainText))).toEqual([
      ['Standard', 'High'],
      ['Glacier', 'Low'],
    ]);
  });

  it('treats a pipe line without a separator row as a paragraph', () => {
    expect(parseLesson('| not a table |')[0].type).toBe('paragraph');
  });

  it('parses multi-line callouts of each kind', () => {
    const blocks = parseLesson(
      '> [!TIP] Remember\n> this part\n\n> [!EXAM] Watch out\n\n> [!NOTE] Fyi',
    );

    expect(
      blocks.map((b) => (b.type === 'callout' ? [b.kind, plainText(b.spans)] : b.type)),
    ).toEqual([
      ['tip', 'Remember this part'],
      ['exam', 'Watch out'],
      ['note', 'Fyi'],
    ]);
  });

  it('parses a diagram marker', () => {
    expect(parseLesson('{{diagram:storage-types}}')).toEqual([
      { type: 'diagram', id: 'storage-types' },
    ]);
  });

  it('keeps unknown syntax as paragraph text instead of failing', () => {
    expect(parseLesson('#### too deep')).toEqual([
      { type: 'paragraph', spans: [{ text: '#### too deep', bold: false }] },
    ]);
  });
});
