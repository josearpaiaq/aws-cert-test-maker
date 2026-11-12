import type { Question } from '@/data/question-schema';
import { usePracticeSession } from '@/state/practice-session';

function question(overrides: Partial<Question>): Question {
  return {
    id: 'q1',
    domain: 1,
    taskStatement: '1.1',
    type: 'single',
    prompt: 'A question?',
    options: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, text: id })),
    correct: ['a'],
    explanation: 'Because.',
    services: [],
    difficulty: 1,
    source: 'https://docs.aws.amazon.com/',
    ...overrides,
  };
}

const single = question({ id: 'single' });
const multi = question({ id: 'multi', type: 'multi', correct: ['a', 'c'] });
const session = () => usePracticeSession.getState();

describe('practice session', () => {
  beforeEach(() => session().start([single, multi]));

  it('starts on the first question with nothing selected', () => {
    expect(session()).toMatchObject({ index: 0, selected: [], revealed: false, results: [] });
  });

  it('replaces the selection on a single-answer question', () => {
    session().toggleOption('b');
    session().toggleOption('c');

    expect(session().selected).toEqual(['c']);
  });

  it('adds and removes selections on a multiple-response question', () => {
    session().start([multi]);
    session().toggleOption('a');
    session().toggleOption('b');
    session().toggleOption('a');

    expect(session().selected).toEqual(['b']);
  });

  it('does not allow more selections than the question has correct answers', () => {
    session().start([multi]);
    session().toggleOption('a');
    session().toggleOption('b');
    session().toggleOption('c');

    expect(session().selected).toEqual(['a', 'b']);
  });

  it('refuses to reveal until enough options are selected', () => {
    session().start([multi]);
    session().toggleOption('a');

    expect(session().reveal()).toBeNull();
    expect(session().revealed).toBe(false);
  });

  it('reveals a correct answer and records the result', () => {
    session().toggleOption('a');

    const result = session().reveal();

    expect(result).toMatchObject({ isCorrect: true, selected: ['a'], confidence: undefined });
    expect(session().revealed).toBe(true);
    expect(session().results).toHaveLength(1);
  });

  it('reveals a wrong answer as incorrect', () => {
    session().toggleOption('d');

    expect(session().reveal()?.isCorrect).toBe(false);
  });

  it('marks the result as low confidence when the learner was unsure', () => {
    session().toggleOption('a');
    session().toggleUnsure();

    expect(session().reveal()?.confidence).toBe('low');
  });

  it('locks the answer once it is revealed', () => {
    session().toggleOption('a');
    session().reveal();

    session().toggleOption('b');
    session().toggleUnsure();

    expect(session().selected).toEqual(['a']);
    expect(session().unsure).toBe(false);
    expect(session().reveal()).toBeNull();
    expect(session().results).toHaveLength(1);
  });

  it('does not advance before the answer is revealed', () => {
    session().toggleOption('a');
    session().next();

    expect(session().index).toBe(0);
  });

  it('advances to a clean next question after reveal', () => {
    session().toggleOption('a');
    session().toggleUnsure();
    session().reveal();
    session().next();

    expect(session()).toMatchObject({ index: 1, selected: [], unsure: false, revealed: false });
  });

  it('finishes after the last question and keeps every result', () => {
    session().toggleOption('a');
    session().reveal();
    session().next();
    session().toggleOption('a');
    session().toggleOption('b');
    session().reveal();
    session().next();
    session().next();

    expect(session().index).toBe(2);
    expect(session().results.map((r) => r.isCorrect)).toEqual([true, false]);
  });

  it('clears the previous session when a new one starts', () => {
    session().toggleOption('a');
    session().reveal();

    session().start([multi]);

    expect(session()).toMatchObject({ index: 0, selected: [], revealed: false, results: [] });
  });
});
