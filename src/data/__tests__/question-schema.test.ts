import { CLF_C02 } from '@/data/exams/clf-c02';
import { parseQuestionBank } from '@/data/question-schema';

const single = {
  id: 'd3-ec2-001',
  domain: 3,
  taskStatement: '3.3',
  type: 'single',
  prompt: 'Which service provides resizable compute capacity in the cloud?',
  options: [
    { id: 'a', text: 'Amazon EC2' },
    { id: 'b', text: 'Amazon S3' },
    { id: 'c', text: 'AWS IAM' },
    { id: 'd', text: 'Amazon RDS' },
  ],
  correct: ['a'],
  explanation:
    'EC2 provides virtual servers you can resize; S3 is object storage, IAM is identity, RDS is managed databases.',
  services: ['EC2', 'S3', 'IAM', 'RDS'],
  difficulty: 1,
  source: 'https://docs.aws.amazon.com/ec2/',
};

const multi = {
  ...single,
  id: 'd3-ec2-002',
  type: 'multi',
  prompt: 'Which of these are compute services? (Choose two.)',
  options: [...single.options, { id: 'e', text: 'AWS Lambda' }],
  correct: ['a', 'e'],
};

/** Returns the validation messages for a bank, or [] when it is valid. */
function problems(bank: unknown): string[] {
  try {
    parseQuestionBank(bank, CLF_C02);
    return [];
  } catch (error) {
    if (error instanceof Error && 'issues' in error && Array.isArray(error.issues)) {
      return error.issues.map((issue: { message: string }) => issue.message);
    }
    throw error;
  }
}

describe('parseQuestionBank', () => {
  it('accepts valid single-answer and multiple-response questions', () => {
    expect(parseQuestionBank([single, multi], CLF_C02)).toHaveLength(2);
  });

  it('accepts an empty bank', () => {
    expect(parseQuestionBank([], CLF_C02)).toEqual([]);
  });

  it('accepts the optional draft flag but rejects unknown fields', () => {
    expect(problems([{ ...single, draft: true }])).toEqual([]);
    expect(problems([{ ...single, hint: 'nope' }])).not.toEqual([]);
  });

  it.each([
    ['a missing explanation', { ...single, explanation: undefined }],
    ['an empty prompt', { ...single, prompt: '   ' }],
    ['an unknown question type', { ...single, type: 'ordering' }],
    ['a difficulty outside 1-3', { ...single, difficulty: 4 }],
    ['a non-AWS source link', { ...single, source: 'https://example.com/ec2' }],
    ['an http source link', { ...single, source: 'http://docs.aws.amazon.com/ec2/' }],
    ['an id that is not kebab-case', { ...single, id: 'D3 EC2 001' }],
  ])('rejects %s', (_label, question) => {
    expect(problems([question])).not.toEqual([]);
  });

  it('rejects a domain the exam does not have', () => {
    expect(problems([{ ...single, domain: 5 }])).toContain('Unknown domain 5');
  });

  it('rejects a task statement from a different domain', () => {
    expect(problems([{ ...single, taskStatement: '2.1' }])).toContain(
      'Task statement 2.1 is not in domain 3',
    );
  });

  it('rejects a correct answer that is not one of the options', () => {
    expect(problems([{ ...single, correct: ['z'] }])).toContain(
      'Correct answer "z" is not one of the options',
    );
  });

  it('rejects duplicate option ids', () => {
    const options = [...single.options.slice(0, 3), { id: 'a', text: 'Amazon RDS' }];
    expect(problems([{ ...single, options }])).toContain('Option ids must be unique');
  });

  it('rejects a single-answer question without exactly 4 options and 1 correct answer', () => {
    expect(problems([{ ...single, options: single.options.slice(0, 3) }])).toContain(
      'A single-answer question needs exactly 4 options',
    );
    expect(problems([{ ...single, correct: ['a', 'b'] }])).toContain(
      'A single-answer question needs exactly 1 correct answer',
    );
  });

  it('rejects a multiple-response question with fewer than 5 options or 2 correct answers', () => {
    expect(problems([{ ...multi, options: single.options, correct: ['a', 'b'] }])).toContain(
      'A multiple-response question needs at least 5 options',
    );
    expect(problems([{ ...multi, correct: ['a'] }])).toContain(
      'A multiple-response question needs 2 or more correct answers and a distractor',
    );
  });

  it('rejects a multiple-response question where every option is correct', () => {
    expect(problems([{ ...multi, correct: ['a', 'b', 'c', 'd', 'e'] }])).toContain(
      'A multiple-response question needs 2 or more correct answers and a distractor',
    );
  });

  it('rejects a multiple-response prompt that does not say how many answers to pick', () => {
    expect(problems([{ ...multi, prompt: 'Which of these are compute services?' }])).toEqual([
      'A multiple-response prompt must state how many answers to pick, e.g. "(Choose two.)"',
    ]);
  });

  it('rejects a prompt whose stated count does not match the number of correct answers', () => {
    expect(problems([{ ...multi, correct: ['a', 'b', 'e'] }])).toEqual([
      'A multiple-response prompt must state how many answers to pick, e.g. "(Choose three.)"',
    ]);
  });

  it('rejects two questions with the same id', () => {
    expect(problems([single, single])).toContain('Duplicate question id "d3-ec2-001"');
  });

  it('reports every problem in the bank, not just the first', () => {
    const bank = [
      { ...single, domain: 9 },
      { ...multi, correct: ['a'] },
    ];
    expect(problems(bank).length).toBeGreaterThanOrEqual(2);
  });
});
