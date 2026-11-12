import type { ExamConfig } from '@/data/exam-config';

/**
 * AWS Certified Cloud Practitioner (CLF-C02).
 *
 * Question counts, scoring and domain weights come from the official exam guide
 * (Version 1.0 CLF-C02):
 * https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html
 *
 * The exam guide does not state the duration; 90 minutes comes from the project plan.
 * Update this file if AWS revises the exam.
 */
export const CLF_C02: ExamConfig = {
  id: 'clf-c02',
  name: 'AWS Certified Cloud Practitioner',
  totalQuestions: 65,
  scoredQuestions: 50,
  unscoredQuestions: 15,
  durationMinutes: 90,
  scaledScore: { min: 100, max: 1000, passing: 700 },
  domains: [
    {
      id: 1,
      name: 'Cloud Concepts',
      weight: 0.24,
      taskStatements: [
        { id: '1.1', title: 'Define the benefits of the AWS Cloud.' },
        { id: '1.2', title: 'Identify design principles of the AWS Cloud.' },
        {
          id: '1.3',
          title: 'Understand the benefits of and strategies for migration to the AWS Cloud.',
        },
        { id: '1.4', title: 'Understand concepts of cloud economics.' },
      ],
    },
    {
      id: 2,
      name: 'Security and Compliance',
      weight: 0.3,
      taskStatements: [
        { id: '2.1', title: 'Understand the AWS shared responsibility model.' },
        {
          id: '2.2',
          title: 'Understand AWS Cloud security, governance, and compliance concepts.',
        },
        { id: '2.3', title: 'Identify AWS access management capabilities.' },
        { id: '2.4', title: 'Identify components and resources for security.' },
      ],
    },
    {
      id: 3,
      name: 'Cloud Technology and Services',
      weight: 0.34,
      taskStatements: [
        { id: '3.1', title: 'Define methods of deploying and operating in the AWS Cloud.' },
        { id: '3.2', title: 'Define the AWS global infrastructure.' },
        { id: '3.3', title: 'Identify AWS compute services.' },
        { id: '3.4', title: 'Identify AWS database services.' },
        { id: '3.5', title: 'Identify AWS network services.' },
        { id: '3.6', title: 'Identify AWS storage services.' },
        {
          id: '3.7',
          title:
            'Identify AWS artificial intelligence and machine learning (AI/ML) services and analytics services.',
        },
        { id: '3.8', title: 'Identify services from other in-scope AWS service categories.' },
      ],
    },
    {
      id: 4,
      name: 'Billing, Pricing, and Support',
      weight: 0.12,
      taskStatements: [
        { id: '4.1', title: 'Compare AWS pricing models.' },
        { id: '4.2', title: 'Understand resources for billing, budget, and cost management.' },
        { id: '4.3', title: 'Identify AWS technical resources and AWS Support options.' },
      ],
    },
  ],
};
