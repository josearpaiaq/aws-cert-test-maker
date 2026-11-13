/**
 * A small Markdown subset for lessons, parsed into blocks that the app renders with its own
 * components. Supported:
 *
 *   ## Heading / ### Subheading
 *   Paragraphs (separated by a blank line), with **bold** inline
 *   - bullet lists and 1. numbered lists
 *   | tables | with | a header row | followed by |---|---|---| a separator row
 *   > [!TIP] / > [!NOTE] / > [!EXAM] callouts (one or more `>` lines)
 *   {{diagram:some-id}} on its own line
 *
 * Anything else is treated as paragraph text, so a typo never crashes the app.
 */

export type Span = { text: string; bold: boolean };
export type CalloutKind = 'tip' | 'note' | 'exam';

export type Block =
  | { type: 'heading'; level: 2 | 3; spans: Span[] }
  | { type: 'paragraph'; spans: Span[] }
  | { type: 'list'; ordered: boolean; items: Span[][] }
  | { type: 'table'; header: Span[][]; rows: Span[][][] }
  | { type: 'callout'; kind: CalloutKind; spans: Span[] }
  | { type: 'diagram'; id: string };

/** Splits text on **bold** markers. An unmatched marker is kept as plain text. */
export function parseInline(text: string): Span[] {
  const spans: Span[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) spans.push({ text: text.slice(last, start), bold: false });
    spans.push({ text: match[1], bold: true });
    last = start + match[0].length;
  }
  if (last < text.length) spans.push({ text: text.slice(last), bold: false });
  return spans;
}

const CALLOUT = /^>\s*\[!(TIP|NOTE|EXAM)\]\s*(.*)$/i;
const DIAGRAM = /^\{\{diagram:([a-z0-9-]+)\}\}$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+\.\s+(.*)$/;
const TABLE_SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

function cells(row: string): Span[][] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => parseInline(cell.trim()));
}

export function parseLesson(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === '') {
      i++;
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length === 2 ? 2 : 3,
        spans: parseInline(heading[2]),
      });
      i++;
      continue;
    }

    const diagram = DIAGRAM.exec(line);
    if (diagram) {
      blocks.push({ type: 'diagram', id: diagram[1] });
      i++;
      continue;
    }

    const callout = CALLOUT.exec(line);
    if (callout) {
      const parts = [callout[2]];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        parts.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'callout',
        kind: callout[1].toLowerCase() as CalloutKind,
        spans: parseInline(parts.filter(Boolean).join(' ')),
      });
      continue;
    }

    if (line.startsWith('|') && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1].trim())) {
      const header = cells(line);
      const rows: Span[][][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const marker = ordered ? NUMBERED : BULLET;
      const items: Span[][] = [];
      while (i < lines.length) {
        const item = marker.exec(lines[i].trim());
        if (!item) break;
        items.push(parseInline(item[1]));
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // Paragraph: this line plus following lines until a blank line or another block starts.
    // The first line is always consumed, so text that merely looks like another block (such as
    // a lone `| pipe |` line) can never stall the parser.
    const parts: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        next === '' ||
        /^#{2,3}\s/.test(next) ||
        DIAGRAM.test(next) ||
        CALLOUT.test(next) ||
        BULLET.test(next) ||
        NUMBERED.test(next) ||
        next.startsWith('|')
      ) {
        break;
      }
      parts.push(next);
      i++;
    }
    blocks.push({ type: 'paragraph', spans: parseInline(parts.join(' ')) });
  }

  return blocks;
}

/** The plain text of some spans, for accessibility labels and search. */
export function plainText(spans: Span[]): string {
  return spans.map((span) => span.text).join('');
}
