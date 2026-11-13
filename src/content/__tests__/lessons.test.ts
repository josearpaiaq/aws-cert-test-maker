import { DIAGRAMS } from '@/components/lessons/diagrams';
import { readingMinutes } from '@/content/lesson';
import { LESSONS } from '@/content/lessons';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import { parseLesson } from '@/logic/lesson-markdown';

const taskIds = CLF_C02.domains.flatMap((d) => d.taskStatements.map((t) => t.id));

describe.each(LESSONS.map((lesson) => [lesson.taskStatement, lesson] as const))(
  'lesson %s',
  (_id, lesson) => {
    const blocks = parseLesson(lesson.body);

    it('covers a real task statement of the exam', () => {
      expect(taskIds).toContain(lesson.taskStatement);
    });

    it('starts with a section heading and has substance', () => {
      expect(blocks[0]).toMatchObject({ type: 'heading', level: 2 });
      expect(readingMinutes(lesson)).toBeGreaterThanOrEqual(2);
    });

    it('only uses diagrams that exist', () => {
      for (const block of blocks) {
        if (block.type === 'diagram') expect(Object.keys(DIAGRAMS)).toContain(block.id);
      }
    });

    it('has table rows with as many cells as the header', () => {
      for (const block of blocks) {
        if (block.type !== 'table') continue;
        for (const row of block.rows) expect(row).toHaveLength(block.header.length);
      }
    });

    it('cites AWS sources over https', () => {
      expect(lesson.sources.length).toBeGreaterThan(0);
      for (const source of lesson.sources) {
        expect(source.url).toMatch(/^https:\/\/(docs\.aws\.amazon\.com|aws\.amazon\.com)\//);
      }
    });

    it('has questions to practise afterwards', () => {
      expect(getQuestionBank().some((q) => q.taskStatement === lesson.taskStatement)).toBe(true);
    });
  },
);

it('has at most one lesson per task statement', () => {
  const ids = LESSONS.map((lesson) => lesson.taskStatement);
  expect(new Set(ids).size).toBe(ids.length);
});
