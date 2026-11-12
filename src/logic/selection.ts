import type { Question } from '@/data/question-schema';

/**
 * The selection after tapping an option. A single-answer question keeps only the tapped
 * option. A multiple-response question toggles it, and ignores a new selection once as many
 * options are selected as the question has correct answers.
 */
export function toggleSelection(
  question: Pick<Question, 'type' | 'correct'>,
  selected: readonly string[],
  optionId: string,
): string[] {
  if (question.type === 'single') {
    return [optionId];
  }
  if (selected.includes(optionId)) {
    return selected.filter((id) => id !== optionId);
  }
  if (selected.length < question.correct.length) {
    return [...selected, optionId];
  }
  return [...selected];
}
