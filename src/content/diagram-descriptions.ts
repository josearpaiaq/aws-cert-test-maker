/**
 * What each lesson diagram shows, in words. Screen readers read this instead of the drawing,
 * and the audio version of a lesson speaks it.
 */
export const DIAGRAM_DESCRIPTIONS: Record<string, string> = {
  'responsibility-by-service':
    'Who manages each layer. On EC2, you manage data and access, the application, and the operating system; AWS manages the infrastructure. On RDS, you manage data and access; AWS manages the database software, operating system and infrastructure. On Lambda, you manage data and access and your code; AWS manages the operating system and infrastructure.',
  's3-lifecycle':
    'Example lifecycle rule: objects start in S3 Standard, move to S3 Standard-IA after 30 days, to S3 Glacier Flexible Retrieval after 90 days, and are deleted after 365 days.',
};
