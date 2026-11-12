import { create } from 'zustand';

import type { Question } from '@/data/question-schema';
import type { ExamAttempt, ExamResponses } from '@/db/repository';
import { toggleSelection } from '@/logic/selection';

type ExamSessionState = {
  attempt: ExamAttempt | null;
  questions: Question[];
  index: number;
  responses: ExamResponses;
  flagged: string[];

  /** Loads a stored attempt, opening it at the first unanswered question. */
  load: (attempt: ExamAttempt, questions: Question[]) => void;
  toggleOption: (optionId: string) => void;
  toggleFlag: () => void;
  goTo: (index: number) => void;
};

/**
 * The mock exam on screen. The database is the source of truth: the screen writes
 * `responses` and `flagged` back after every change, so this state can always be rebuilt
 * from the stored attempt after the app is killed.
 */
export const useExamSession = create<ExamSessionState>((set, get) => ({
  attempt: null,
  questions: [],
  index: 0,
  responses: {},
  flagged: [],

  load: (attempt, questions) => {
    const firstUnanswered = questions.findIndex((q) => !attempt.responses[q.id]?.length);
    set({
      attempt,
      questions,
      index: Math.max(0, firstUnanswered),
      responses: attempt.responses,
      flagged: attempt.flagged,
    });
  },

  toggleOption: (optionId) => {
    const { questions, index, responses } = get();
    const question = questions[index];
    if (!question) return;
    const selected = toggleSelection(question, responses[question.id] ?? [], optionId);
    set({ responses: { ...responses, [question.id]: selected } });
  },

  toggleFlag: () => {
    const { questions, index, flagged } = get();
    const question = questions[index];
    if (!question) return;
    set({
      flagged: flagged.includes(question.id)
        ? flagged.filter((id) => id !== question.id)
        : [...flagged, question.id],
    });
  },

  goTo: (index) => {
    if (index >= 0 && index < get().questions.length) set({ index });
  },
}));

/** How many of the exam's questions have at least one option selected. */
export function countAnswered(questions: readonly Question[], responses: ExamResponses): number {
  return questions.filter((q) => (responses[q.id]?.length ?? 0) > 0).length;
}
