export type LessonSource = { title: string; url: string };

/**
 * One lesson per exam task statement. The body uses the Markdown subset described in
 * src/logic/lesson-markdown.ts. Lessons are original writing based on the linked AWS pages.
 */
export type Lesson = {
  /** The task statement it covers, e.g. "3.6". Also the lesson's id. */
  taskStatement: string;
  title: string;
  /** One sentence shown in the lesson list. */
  summary: string;
  body: string;
  sources: LessonSource[];
  /** True until the content has been reviewed. */
  draft: boolean;
};

const WORDS_PER_MINUTE = 200;

export function readingMinutes(lesson: Pick<Lesson, 'body'>): number {
  const words = lesson.body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
