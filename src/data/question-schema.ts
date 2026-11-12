import { z } from 'zod';

import type { ExamConfig } from '@/data/exam-config';

const COUNT_WORDS = ['two', 'three', 'four', 'five', 'six'];

const optionSchema = z.object({
  id: z.string().regex(/^[a-z]$/, 'Option id must be a single lowercase letter'),
  text: z.string().trim().min(1),
});

const baseQuestionSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Question id must be kebab-case'),
  domain: z.number().int(),
  taskStatement: z.string(),
  type: z.enum(['single', 'multi']),
  prompt: z.string().trim().min(10),
  options: z.array(optionSchema),
  correct: z.array(z.string()).min(1),
  explanation: z.string().trim().min(20),
  services: z.array(z.string().trim().min(1)),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  source: z
    .string()
    .regex(
      /^https:\/\/(docs\.aws\.amazon\.com|aws\.amazon\.com)\//,
      'Source must be an https AWS documentation URL',
    ),
  draft: z.boolean().optional(),
});

export type Question = z.infer<typeof baseQuestionSchema>;
export type QuestionOption = Question['options'][number];

/**
 * Builds the schema for one exam's question bank. The rules beyond field shapes follow the
 * official exam guide: a multiple-choice question has one correct response and three
 * distractors; a multiple-response question has two or more correct responses out of five or
 * more options.
 */
export function createQuestionBankSchema(exam: ExamConfig) {
  const questionSchema = baseQuestionSchema.superRefine((question, ctx) => {
    const domain = exam.domains.find((d) => d.id === question.domain);
    if (!domain) {
      ctx.addIssue({
        code: 'custom',
        path: ['domain'],
        message: `Unknown domain ${question.domain}`,
      });
    } else if (!domain.taskStatements.some((t) => t.id === question.taskStatement)) {
      ctx.addIssue({
        code: 'custom',
        path: ['taskStatement'],
        message: `Task statement ${question.taskStatement} is not in domain ${domain.id}`,
      });
    }

    const optionIds = question.options.map((o) => o.id);
    if (new Set(optionIds).size !== optionIds.length) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Option ids must be unique' });
    }
    if (new Set(question.correct).size !== question.correct.length) {
      ctx.addIssue({ code: 'custom', path: ['correct'], message: 'Correct ids must be unique' });
    }
    for (const id of question.correct) {
      if (!optionIds.includes(id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['correct'],
          message: `Correct answer "${id}" is not one of the options`,
        });
      }
    }

    if (question.type === 'single') {
      if (question.options.length !== 4) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: 'A single-answer question needs exactly 4 options',
        });
      }
      if (question.correct.length !== 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['correct'],
          message: 'A single-answer question needs exactly 1 correct answer',
        });
      }
      return;
    }

    if (question.options.length < 5) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'A multiple-response question needs at least 5 options',
      });
    }
    if (question.correct.length < 2 || question.correct.length >= question.options.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['correct'],
        message: 'A multiple-response question needs 2 or more correct answers and a distractor',
      });
    }
    const countWord = COUNT_WORDS[question.correct.length - 2];
    if (!countWord || !question.prompt.toLowerCase().includes(`(choose ${countWord}.)`)) {
      ctx.addIssue({
        code: 'custom',
        path: ['prompt'],
        message: `A multiple-response prompt must state how many answers to pick, e.g. "(Choose ${countWord ?? 'two'}.)"`,
      });
    }
  });

  return z.array(questionSchema).superRefine((questions, ctx) => {
    const seen = new Set<string>();
    questions.forEach((question, index) => {
      if (seen.has(question.id)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `Duplicate question id "${question.id}"`,
        });
      }
      seen.add(question.id);
    });
  });
}

/** Validates raw JSON against an exam's rules. Throws a ZodError listing every problem. */
export function parseQuestionBank(raw: unknown, exam: ExamConfig): Question[] {
  return createQuestionBankSchema(exam).parse(raw);
}
