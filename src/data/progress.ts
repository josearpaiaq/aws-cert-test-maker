import { CLF_C02 } from '@/data/exams/clf-c02';
import type { Answer, ExamAttempt, Repository } from '@/db/repository';
import { daysAgo } from '@/logic/dates';
import { computeReadiness, READINESS_WINDOW, type Readiness } from '@/logic/readiness';
import { computeStreak, type Streak } from '@/logic/streak';

/** How many days the accuracy chart covers, including today. */
export const HISTORY_DAYS = 14;

export type Progress = {
  readiness: Readiness;
  streak: Streak;
  totalAnswered: number;
  /** Answers from the last HISTORY_DAYS days, for the accuracy chart. */
  recentAnswers: Answer[];
  /** Submitted mock exams, newest first. */
  examHistory: ExamAttempt[];
  /** When this snapshot was taken, in epoch milliseconds. */
  loadedAt: number;
};

/** Everything the Progress tab shows, read from the database in one go. */
export async function loadProgress(repo: Repository, now: number): Promise<Progress> {
  const examId = CLF_C02.id;
  const domainIds = CLF_C02.domains.map((d) => d.id);

  const [perDomain, timestamps, recentAnswers, examHistory] = await Promise.all([
    Promise.all(
      domainIds.map((domain) => repo.getRecentAnswers(examId, { domain, limit: READINESS_WINDOW })),
    ),
    repo.getAnswerTimestamps(examId),
    repo.getAnswersSince(examId, daysAgo(now, HISTORY_DAYS - 1)),
    repo.getExamHistory(examId),
  ]);

  return {
    readiness: computeReadiness(perDomain.flat(), domainIds),
    streak: computeStreak(timestamps, now),
    totalAnswered: timestamps.length,
    recentAnswers,
    examHistory,
    loadedAt: now,
  };
}
