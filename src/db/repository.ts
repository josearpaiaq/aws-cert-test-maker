import { z } from 'zod';

import type { Database, SqlParam } from '@/db/database';

export type AnswerMode = 'practice' | 'review' | 'exam';
export type Confidence = 'low' | 'high';

export type NewAnswer = {
  examId: string;
  questionId: string;
  domain: number;
  mode: AnswerMode;
  selected: string[];
  isCorrect: boolean;
  confidence?: Confidence;
  examAttemptId?: number;
  answeredAt: number;
};

export type Answer = NewAnswer & { id: number };

export type ReviewSchedule = {
  examId: string;
  questionId: string;
  dueAt: number;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt: number;
};

/** Selected option ids per question id. */
export type ExamResponses = Record<string, string[]>;

export type ExamAttempt = {
  id: number;
  examId: string;
  status: 'in_progress' | 'submitted';
  startedAt: number;
  endsAt: number;
  submittedAt: number | null;
  questionIds: string[];
  responses: ExamResponses;
  flagged: string[];
  correctCount: number | null;
  totalCount: number | null;
};

type AnswerRow = {
  id: number;
  exam_id: string;
  question_id: string;
  domain: number;
  mode: AnswerMode;
  selected_json: string;
  is_correct: number;
  confidence: Confidence | null;
  exam_attempt_id: number | null;
  answered_at: number;
};

type ReviewRow = {
  exam_id: string;
  question_id: string;
  due_at: number;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  last_reviewed_at: number;
};

type AttemptRow = {
  id: number;
  exam_id: string;
  status: 'in_progress' | 'submitted';
  started_at: number;
  ends_at: number;
  submitted_at: number | null;
  question_ids_json: string;
  responses_json: string;
  flagged_json: string;
  correct_count: number | null;
  total_count: number | null;
};

const stringArray = z.array(z.string());
const responsesMap = z.record(z.string(), stringArray);

function toAnswer(row: AnswerRow): Answer {
  return {
    id: row.id,
    examId: row.exam_id,
    questionId: row.question_id,
    domain: row.domain,
    mode: row.mode,
    selected: stringArray.parse(JSON.parse(row.selected_json)),
    isCorrect: row.is_correct === 1,
    confidence: row.confidence ?? undefined,
    examAttemptId: row.exam_attempt_id ?? undefined,
    answeredAt: row.answered_at,
  };
}

function toReview(row: ReviewRow): ReviewSchedule {
  return {
    examId: row.exam_id,
    questionId: row.question_id,
    dueAt: row.due_at,
    intervalDays: row.interval_days,
    easeFactor: row.ease_factor,
    repetitions: row.repetitions,
    lastReviewedAt: row.last_reviewed_at,
  };
}

function toAttempt(row: AttemptRow): ExamAttempt {
  return {
    id: row.id,
    examId: row.exam_id,
    status: row.status,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    submittedAt: row.submitted_at,
    questionIds: stringArray.parse(JSON.parse(row.question_ids_json)),
    responses: responsesMap.parse(JSON.parse(row.responses_json)),
    flagged: stringArray.parse(JSON.parse(row.flagged_json)),
    correctCount: row.correct_count,
    totalCount: row.total_count,
  };
}

export function createRepository(db: Database) {
  return {
    /** Runs `task` in a transaction: either every write in it is saved, or none is. */
    transaction(task: () => Promise<void>): Promise<void> {
      return db.withTransactionAsync(task);
    },

    // Answers

    async recordAnswer(answer: NewAnswer): Promise<number> {
      const result = await db.runAsync(
        `INSERT INTO answers
           (exam_id, question_id, domain, mode, selected_json, is_correct, confidence,
            exam_attempt_id, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          answer.examId,
          answer.questionId,
          answer.domain,
          answer.mode,
          JSON.stringify(answer.selected),
          answer.isCorrect ? 1 : 0,
          answer.confidence ?? null,
          answer.examAttemptId ?? null,
          answer.answeredAt,
        ],
      );
      return result.lastInsertRowId;
    },

    /** Most recent answers first, optionally for one domain. */
    async getRecentAnswers(
      examId: string,
      options: { domain?: number; limit: number },
    ): Promise<Answer[]> {
      const params: SqlParam[] = [examId];
      let where = 'exam_id = ?';
      if (options.domain !== undefined) {
        where += ' AND domain = ?';
        params.push(options.domain);
      }
      params.push(options.limit);
      const rows = await db.getAllAsync<AnswerRow>(
        `SELECT * FROM answers WHERE ${where} ORDER BY answered_at DESC, id DESC LIMIT ?`,
        params,
      );
      return rows.map(toAnswer);
    },

    // Review schedule

    async saveReview(review: ReviewSchedule): Promise<void> {
      await db.runAsync(
        `INSERT INTO review_schedule
           (exam_id, question_id, due_at, interval_days, ease_factor, repetitions,
            last_reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (exam_id, question_id) DO UPDATE SET
           due_at = excluded.due_at,
           interval_days = excluded.interval_days,
           ease_factor = excluded.ease_factor,
           repetitions = excluded.repetitions,
           last_reviewed_at = excluded.last_reviewed_at`,
        [
          review.examId,
          review.questionId,
          review.dueAt,
          review.intervalDays,
          review.easeFactor,
          review.repetitions,
          review.lastReviewedAt,
        ],
      );
    },

    async getReview(examId: string, questionId: string): Promise<ReviewSchedule | null> {
      const row = await db.getFirstAsync<ReviewRow>(
        'SELECT * FROM review_schedule WHERE exam_id = ? AND question_id = ?',
        [examId, questionId],
      );
      return row ? toReview(row) : null;
    },

    /** Reviews due at or before `now`, most overdue first. */
    async getDueReviews(examId: string, now: number): Promise<ReviewSchedule[]> {
      const rows = await db.getAllAsync<ReviewRow>(
        'SELECT * FROM review_schedule WHERE exam_id = ? AND due_at <= ? ORDER BY due_at ASC',
        [examId, now],
      );
      return rows.map(toReview);
    },

    // Exam attempts

    async startExamAttempt(attempt: {
      examId: string;
      questionIds: string[];
      startedAt: number;
      endsAt: number;
    }): Promise<number> {
      const result = await db.runAsync(
        `INSERT INTO exam_attempts (exam_id, status, started_at, ends_at, question_ids_json)
         VALUES (?, 'in_progress', ?, ?, ?)`,
        [attempt.examId, attempt.startedAt, attempt.endsAt, JSON.stringify(attempt.questionIds)],
      );
      return result.lastInsertRowId;
    },

    /** Persists in-progress state so an attempt survives the app being killed. */
    async saveExamProgress(
      attemptId: number,
      progress: { responses: ExamResponses; flagged: string[] },
    ): Promise<void> {
      await db.runAsync(
        `UPDATE exam_attempts SET responses_json = ?, flagged_json = ?
         WHERE id = ? AND status = 'in_progress'`,
        [JSON.stringify(progress.responses), JSON.stringify(progress.flagged), attemptId],
      );
    },

    async submitExamAttempt(
      attemptId: number,
      result: { submittedAt: number; correctCount: number; totalCount: number },
    ): Promise<void> {
      await db.runAsync(
        `UPDATE exam_attempts
         SET status = 'submitted', submitted_at = ?, correct_count = ?, total_count = ?
         WHERE id = ? AND status = 'in_progress'`,
        [result.submittedAt, result.correctCount, result.totalCount, attemptId],
      );
    },

    async getExamAttempt(attemptId: number): Promise<ExamAttempt | null> {
      const row = await db.getFirstAsync<AttemptRow>('SELECT * FROM exam_attempts WHERE id = ?', [
        attemptId,
      ]);
      return row ? toAttempt(row) : null;
    },

    async getInProgressExamAttempt(examId: string): Promise<ExamAttempt | null> {
      const row = await db.getFirstAsync<AttemptRow>(
        `SELECT * FROM exam_attempts WHERE exam_id = ? AND status = 'in_progress'
         ORDER BY started_at DESC LIMIT 1`,
        [examId],
      );
      return row ? toAttempt(row) : null;
    },

    /** Submitted attempts, newest first. */
    async getExamHistory(examId: string): Promise<ExamAttempt[]> {
      const rows = await db.getAllAsync<AttemptRow>(
        `SELECT * FROM exam_attempts WHERE exam_id = ? AND status = 'submitted'
         ORDER BY submitted_at DESC`,
        [examId],
      );
      return rows.map(toAttempt);
    },

    // Settings

    async getSetting(key: string): Promise<string | null> {
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?',
        [key],
      );
      return row?.value ?? null;
    },

    async setSetting(key: string, value: string): Promise<void> {
      await db.runAsync(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
        [key, value],
      );
    },
  };
}

export type Repository = ReturnType<typeof createRepository>;
