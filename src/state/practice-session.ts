import { create } from 'zustand';

import type { Question } from '@/data/question-schema';
import { isCorrect } from '@/logic/scoring';

export type PracticeResult = {
  question: Question;
  selected: string[];
  isCorrect: boolean;
  confidence: 'low' | undefined;
};

type PracticeSessionState = {
  questions: Question[];
  index: number;
  /** Option ids selected for the current question. */
  selected: string[];
  /** The learner marked the current answer as a guess. */
  unsure: boolean;
  /** The current question has been checked and feedback is showing. */
  revealed: boolean;
  results: PracticeResult[];

  start: (questions: Question[]) => void;
  toggleOption: (optionId: string) => void;
  toggleUnsure: () => void;
  /** Checks the current answer. Returns the result, or null when there is nothing to check. */
  reveal: () => PracticeResult | null;
  /** Moves to the next question. After the last one, `index` equals `questions.length`. */
  next: () => void;
};

/**
 * The in-progress practice session. This is UI state only: answers are written to SQLite as
 * they are revealed, so nothing here needs to survive an app restart.
 */
export const usePracticeSession = create<PracticeSessionState>((set, get) => ({
  questions: [],
  index: 0,
  selected: [],
  unsure: false,
  revealed: false,
  results: [],

  start: (questions) =>
    set({ questions, index: 0, selected: [], unsure: false, revealed: false, results: [] }),

  toggleOption: (optionId) => {
    const { questions, index, selected, revealed } = get();
    const question = questions[index];
    if (!question || revealed) return;

    if (question.type === 'single') {
      set({ selected: [optionId] });
    } else if (selected.includes(optionId)) {
      set({ selected: selected.filter((id) => id !== optionId) });
    } else if (selected.length < question.correct.length) {
      set({ selected: [...selected, optionId] });
    }
  },

  toggleUnsure: () => {
    if (!get().revealed) set({ unsure: !get().unsure });
  },

  reveal: () => {
    const { questions, index, selected, unsure, revealed, results } = get();
    const question = questions[index];
    if (!question || revealed || !canCheck(question, selected)) return null;

    const result: PracticeResult = {
      question,
      selected,
      isCorrect: isCorrect(question, selected),
      confidence: unsure ? 'low' : undefined,
    };
    set({ revealed: true, results: [...results, result] });
    return result;
  },

  next: () => {
    const { questions, index, revealed } = get();
    if (!revealed || index >= questions.length) return;
    set({ index: index + 1, selected: [], unsure: false, revealed: false });
  },
}));

/** An answer can be checked once it has as many selections as the question has correct options. */
export function canCheck(question: Question, selected: readonly string[]) {
  return selected.length === question.correct.length;
}
