import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import { assembleExam } from '@/logic/exam-assembly';

// This test is the build gate for the bundled question bank: `npm run validate:questions`
// runs it, and it fails when assets/questions/clf-c02.json breaks the schema.
describe('bundled CLF-C02 question bank', () => {
  it('passes schema validation', () => {
    expect(() => getQuestionBank()).not.toThrow();
  });

  it('has questions for every domain', () => {
    const bank = getQuestionBank();
    for (const domain of CLF_C02.domains) {
      expect(bank.filter((q) => q.domain === domain.id).length).toBeGreaterThan(0);
    }
  });
});

describe('mock exam from the bundled bank', () => {
  it('fills a full exam with the official domain split', () => {
    const exam = assembleExam(getQuestionBank(), CLF_C02);

    const perDomain = CLF_C02.domains.map((d) => exam.filter((q) => q.domain === d.id).length);
    expect(exam).toHaveLength(CLF_C02.totalQuestions);
    expect(perDomain).toEqual([16, 19, 22, 8]);
  });
});

describe('CLF-C02 exam config', () => {
  it('has domain weights that sum to 100%', () => {
    const total = CLF_C02.domains.reduce((sum, d) => sum + d.weight, 0);
    expect(total).toBeCloseTo(1);
  });

  it('splits total questions into scored and unscored', () => {
    expect(CLF_C02.scoredQuestions + CLF_C02.unscoredQuestions).toBe(CLF_C02.totalQuestions);
  });
});
