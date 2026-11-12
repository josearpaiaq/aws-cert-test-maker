import clfC02Questions from '../../assets/questions/clf-c02.json';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { parseQuestionBank, type Question } from '@/data/question-schema';

let cache: Question[] | undefined;

/** The bundled CLF-C02 question bank, validated on first use. */
export function getQuestionBank(): Question[] {
  cache ??= parseQuestionBank(clfC02Questions, CLF_C02);
  return cache;
}
