import { isCorrect, scoreExam } from '@/logic/scoring';

const single = { id: 's1', domain: 1, correct: ['a'] };
const multi = { id: 'm1', domain: 2, correct: ['b', 'd'] };

describe('isCorrect', () => {
  it('accepts the one right answer to a single-answer question', () => {
    expect(isCorrect(single, ['a'])).toBe(true);
  });

  it('rejects a wrong answer', () => {
    expect(isCorrect(single, ['b'])).toBe(false);
  });

  it('rejects an empty selection', () => {
    expect(isCorrect(single, [])).toBe(false);
    expect(isCorrect(multi, [])).toBe(false);
  });

  it('accepts a multiple-response answer with every correct option, in any order', () => {
    expect(isCorrect(multi, ['d', 'b'])).toBe(true);
  });

  it('gives no partial credit for some of the correct options', () => {
    expect(isCorrect(multi, ['b'])).toBe(false);
  });

  it('rejects all the correct options plus an extra one', () => {
    expect(isCorrect(multi, ['b', 'd', 'a'])).toBe(false);
  });

  it('rejects the right number of options when one is wrong', () => {
    expect(isCorrect(multi, ['b', 'c'])).toBe(false);
  });

  it('does not let a repeated option stand in for a missing one', () => {
    expect(isCorrect(multi, ['b', 'b'])).toBe(false);
  });
});

describe('scoreExam', () => {
  const questions = [
    { id: 'q1', domain: 1, correct: ['a'] },
    { id: 'q2', domain: 1, correct: ['b'] },
    { id: 'q3', domain: 3, correct: ['a', 'c'] },
    { id: 'q4', domain: 2, correct: ['d'] },
  ];

  it('totals correct answers overall and per domain, in domain order', () => {
    const score = scoreExam(questions, { q1: ['a'], q2: ['c'], q3: ['c', 'a'], q4: ['d'] });

    expect(score).toEqual({
      correct: 3,
      total: 4,
      accuracy: 0.75,
      byDomain: [
        { domain: 1, correct: 1, total: 2 },
        { domain: 2, correct: 1, total: 1 },
        { domain: 3, correct: 1, total: 1 },
      ],
    });
  });

  it('counts unanswered questions as incorrect', () => {
    const score = scoreExam(questions, { q1: ['a'] });

    expect(score.correct).toBe(1);
    expect(score.total).toBe(4);
  });

  it('ignores responses to questions that are not in the exam', () => {
    expect(scoreExam(questions, { other: ['a'] }).correct).toBe(0);
  });

  it('scores an empty exam as zero without dividing by zero', () => {
    expect(scoreExam([], {})).toEqual({ correct: 0, total: 0, accuracy: 0, byDomain: [] });
  });
});
