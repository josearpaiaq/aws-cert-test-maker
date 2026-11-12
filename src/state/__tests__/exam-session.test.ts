import type { Question } from '@/data/question-schema';
import type { ExamAttempt } from '@/db/repository';
import { countAnswered, useExamSession } from '@/state/exam-session';

function question(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    domain: 1,
    taskStatement: '1.1',
    type: 'single',
    prompt: 'A question?',
    options: ['a', 'b', 'c', 'd', 'e'].map((o) => ({ id: o, text: o })),
    correct: ['a'],
    explanation: 'Because.',
    services: [],
    difficulty: 1,
    source: 'https://docs.aws.amazon.com/',
    ...overrides,
  };
}

const questions = [
  question('q1'),
  question('q2', { type: 'multi', correct: ['a', 'b'] }),
  question('q3'),
];

function attempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    id: 7,
    examId: 'clf-c02',
    status: 'in_progress',
    startedAt: 0,
    endsAt: 5_400_000,
    submittedAt: null,
    questionIds: questions.map((q) => q.id),
    responses: {},
    flagged: [],
    correctCount: null,
    totalCount: null,
    ...overrides,
  };
}

const session = () => useExamSession.getState();

describe('exam session', () => {
  beforeEach(() => session().load(attempt(), questions));

  it('opens a fresh attempt at the first question', () => {
    expect(session()).toMatchObject({ index: 0, responses: {}, flagged: [] });
  });

  it('resumes a stored attempt at the first unanswered question with its saved state', () => {
    session().load(attempt({ responses: { q1: ['c'] }, flagged: ['q1'] }), questions);

    expect(session()).toMatchObject({ index: 1, responses: { q1: ['c'] }, flagged: ['q1'] });
  });

  it('resumes a fully answered attempt at the first question', () => {
    session().load(attempt({ responses: { q1: ['a'], q2: ['a', 'b'], q3: ['a'] } }), questions);

    expect(session().index).toBe(0);
  });

  it('records the selection for the current question only', () => {
    session().toggleOption('c');
    session().goTo(1);
    session().toggleOption('a');
    session().toggleOption('b');

    expect(session().responses).toEqual({ q1: ['c'], q2: ['a', 'b'] });
  });

  it('lets an answer be changed while the exam is open', () => {
    session().toggleOption('c');
    session().toggleOption('d');

    expect(session().responses.q1).toEqual(['d']);
  });

  it('flags and unflags the current question', () => {
    session().toggleFlag();
    session().goTo(2);
    session().toggleFlag();
    session().toggleFlag();

    expect(session().flagged).toEqual(['q1']);
  });

  it('ignores navigation outside the exam', () => {
    session().goTo(1);
    session().goTo(-1);
    session().goTo(3);

    expect(session().index).toBe(1);
  });
});

describe('countAnswered', () => {
  it('counts questions with at least one selected option', () => {
    expect(countAnswered(questions, { q1: ['a'], q2: [], other: ['a'] })).toBe(1);
  });
});
