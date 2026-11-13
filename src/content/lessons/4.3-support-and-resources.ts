import type { Lesson } from '@/content/lesson';

export const supportAndResources: Lesson = {
  taskStatement: '4.3',
  title: 'AWS Support and technical resources',
  summary:
    'Where to find answers, which support plan gives what, and when to turn to Trusted Advisor, partners or AWS experts.',
  draft: true,
  sources: [
    {
      title: 'AWS Support plan comparison',
      url: 'https://aws.amazon.com/premiumsupport/plans/',
    },
    {
      title: 'AWS Support Plans',
      url: 'https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html',
    },
    {
      title: 'AWS Trusted Advisor',
      url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html',
    },
    {
      title: 'What is AWS Health?',
      url: 'https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html',
    },
    {
      title: 'What is AWS Marketplace?',
      url: 'https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html',
    },
  ],
  body: `
## Finding answers yourself

Free for every customer:

- **AWS documentation**: user guides and API references for every service.
- **AWS Whitepapers and Guides**: whitepapers, decision guides, technical guides and reference architecture diagrams.
- **AWS blogs**: announcements, tutorials and walkthroughs.
- **AWS Prescriptive Guidance**: **guides** with planning advice and best practices, and **patterns** with steps, architectures and code for migration and modernization tasks.
- **AWS Knowledge Center**: articles written by AWS that answer the most common customer questions. They now live on re:Post with an AWS Official badge.
- **AWS re:Post**: a community question-and-answer site where customers and AWS experts answer technical questions.

## AWS Support plans

> [!NOTE] AWS has changed its plans. The exam guide lists Basic, Developer, Business, Enterprise On-Ramp and Enterprise. AWS now offers **Basic, Business Support+, Enterprise Support and Unified Operations**. Developer and Business are being discontinued on January 1, 2027 (customers can move to Business Support+), and Enterprise On-Ramp customers are being moved to Enterprise Support. The older plans remain in AWS GovCloud (US).

| Plan | Recommended for | Highlights |
|---|---|---|
| Basic | Included for all customers | 24/7 customer service for account and billing, documentation, whitepapers, re:Post, core Trusted Advisor checks, AWS Health |
| Business Support+ | The minimum for production workloads | AI-powered assistance, 24/7 phone, web and chat access to engineers, the full set of Trusted Advisor checks, under 30 minutes for a critical system down |
| Enterprise Support | Business-critical workloads | Everything above, a designated Technical Account Manager (TAM), Trusted Advisor Priority, under 15 minutes for a critical system down |
| Unified Operations | Mission-critical workloads | A designated TAM and domain specialist engineers, incident management engineers responding in under 5 minutes, 24/7 workload monitoring, critical workload reviews |

You open cases in the **AWS Support Center** in the console. Every plan can open account and billing cases and request service quota increases; technical cases need a paid plan.

## Trusted Advisor and AWS Health

- **AWS Trusted Advisor** inspects your account and recommends ways to save money, improve performance and availability, and close security gaps. Basic gives the service limit checks plus selected security and fault tolerance checks; paid plans unlock every check.
- **AWS Health Dashboard** shows events affecting your services and accounts, including planned maintenance. It is free and needs no setup.
- **AWS Health API** feeds those events into your own tools. It needs Business Support+ or higher.

## Reporting abuse

Report abuse coming **from** AWS resources, such as spam, port scanning or denial-of-service traffic, to the **AWS Trust and Safety** team through the AWS abuse report form. The same team sends abuse notices to customers whose resources are involved.

## Partners and AWS Marketplace

The **AWS Partner Network (APN)** is a global community of companies building on AWS:

- **Software partners (ISVs)** build and sell software that runs on or with AWS.
- **Services partners**, such as consulting firms and **system integrators**, help customers plan, migrate, build and manage workloads.

Partners benefit from funding and incentives, training and certification, marketing visibility, co-selling with AWS, and selling through AWS Marketplace.

**AWS Marketplace** is a curated catalog of third-party software, data and services, such as AMIs and SaaS products. Pricing options include free trials, hourly, monthly, annual and multi-year terms, or bring your own license, and charges appear on your **AWS bill**. Sellers can also make **private offers** with custom terms.

## Getting help from AWS people

| Need | Who helps |
|---|---|
| Design advice before or during a project | AWS Solutions Architects, free through your account team or the Contact Us form |
| A hands-on consulting team for migration or modernization | AWS Professional Services, often together with partners |
| Ongoing proactive guidance on your workloads | A Technical Account Manager, in Enterprise Support and Unified Operations |

## How the exam asks about it

> [!EXAM] "Designated TAM" means Enterprise Support or higher. "Buy third-party software billed on the AWS bill" means AWS Marketplace. "Check for idle resources, open security groups or service limits" means Trusted Advisor. "Events affecting my account" means AWS Health Dashboard. "Report spam from an AWS IP address" means AWS Trust and Safety. "Community answers" means re:Post. If a question uses the older plan names, Developer and Business map to Business Support+, and Enterprise On-Ramp to Enterprise Support.

## Check yourself

1. Which plan is included for every AWS customer? **Basic.**
2. What is the lowest current plan with a designated TAM? **Enterprise Support.**
3. Where do you buy third-party SaaS that is billed through AWS? **AWS Marketplace.**
4. Who handles reports of abuse from AWS resources? **The AWS Trust and Safety team.**
5. Which service recommends fixes for cost, security and service limits? **AWS Trusted Advisor.**
`,
};
