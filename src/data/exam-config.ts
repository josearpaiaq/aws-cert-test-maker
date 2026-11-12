export type TaskStatement = {
  /** e.g. "3.3" — the domain number, then the statement number. */
  id: string;
  title: string;
};

export type ExamDomain = {
  id: number;
  name: string;
  /** Share of scored content, as a fraction. Domain weights sum to 1. */
  weight: number;
  taskStatements: readonly TaskStatement[];
};

export type ExamConfig = {
  id: string;
  name: string;
  totalQuestions: number;
  scoredQuestions: number;
  unscoredQuestions: number;
  durationMinutes: number;
  scaledScore: { min: number; max: number; passing: number };
  domains: readonly ExamDomain[];
};
