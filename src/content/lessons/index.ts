import type { Lesson } from '@/content/lesson';
import { cloudBenefits } from '@/content/lessons/1.1-cloud-benefits';
import { wellArchitected } from '@/content/lessons/1.2-well-architected';
import { migration } from '@/content/lessons/1.3-migration';
import { cloudEconomics } from '@/content/lessons/1.4-cloud-economics';
import { sharedResponsibility } from '@/content/lessons/2.1-shared-responsibility';
import { securityGovernanceCompliance } from '@/content/lessons/2.2-security-governance-compliance';
import { accessManagement } from '@/content/lessons/2.3-access-management';
import { securityComponents } from '@/content/lessons/2.4-security-components';
import { deployAndOperate } from '@/content/lessons/3.1-deploy-and-operate';
import { globalInfrastructure } from '@/content/lessons/3.2-global-infrastructure';
import { compute } from '@/content/lessons/3.3-compute';
import { databases } from '@/content/lessons/3.4-databases';
import { networking } from '@/content/lessons/3.5-networking';
import { storage } from '@/content/lessons/3.6-storage';
import { aiMlAnalytics } from '@/content/lessons/3.7-ai-ml-analytics';
import { otherServices } from '@/content/lessons/3.8-other-services';
import { pricingModels } from '@/content/lessons/4.1-pricing-models';
import { billingAndCostManagement } from '@/content/lessons/4.2-billing-and-cost-management';
import { supportAndResources } from '@/content/lessons/4.3-support-and-resources';

/** Every written lesson, in exam order. Task statements without one show as "coming soon". */
export const LESSONS: readonly Lesson[] = [
  cloudBenefits,
  wellArchitected,
  migration,
  cloudEconomics,
  sharedResponsibility,
  securityGovernanceCompliance,
  accessManagement,
  securityComponents,
  deployAndOperate,
  globalInfrastructure,
  compute,
  databases,
  networking,
  storage,
  aiMlAnalytics,
  otherServices,
  pricingModels,
  billingAndCostManagement,
  supportAndResources,
];

export function getLesson(taskStatement: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.taskStatement === taskStatement);
}
