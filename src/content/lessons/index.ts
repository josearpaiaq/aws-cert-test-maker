import type { Lesson } from '@/content/lesson';
import { sharedResponsibility } from '@/content/lessons/2.1-shared-responsibility';
import { storage } from '@/content/lessons/3.6-storage';

/** Every written lesson. Task statements without one show as "coming soon". */
export const LESSONS: readonly Lesson[] = [sharedResponsibility, storage];

export function getLesson(taskStatement: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.taskStatement === taskStatement);
}
