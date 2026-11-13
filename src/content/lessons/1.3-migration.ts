import type { Lesson } from '@/content/lesson';

export const migration: Lesson = {
  taskStatement: '1.3',
  title: 'Migrating to the AWS Cloud',
  summary:
    'The AWS Cloud Adoption Framework, the seven migration strategies, and the services that move servers, databases and data.',
  draft: true,
  sources: [
    {
      title: 'AWS Cloud Adoption Framework (AWS CAF)',
      url: 'https://aws.amazon.com/cloud-adoption-framework/',
    },
    {
      title: 'AWS CAF: Foundational capabilities',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html',
    },
    {
      title: 'About the migration strategies',
      url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html',
    },
    {
      title: 'What is AWS Database Migration Service?',
      url: 'https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html',
    },
    {
      title: 'What is Snowball Edge?',
      url: 'https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html',
    },
  ],
  body: `
## The AWS Cloud Adoption Framework

The **AWS Cloud Adoption Framework (AWS CAF)** is AWS guidance for planning a cloud transformation. It helps an organization find and prioritize opportunities, check how ready it is, and build a roadmap.

### Business outcomes

AWS CAF names four benefits to aim for:

- **Reduced business risk**: better reliability, performance and security
- **Improved ESG performance**: using data to improve sustainability and transparency
- **Increased revenue**: new products and services, new customers and markets
- **Increased operational efficiency**: lower operating costs and higher productivity

### The six perspectives

| Perspective | Focus | Typical owners |
|---|---|---|
| Business | Cloud investments support business goals | CEO, CFO, COO, CIO, CTO |
| People | Culture, organization, leadership and skills | CIO, COO, CTO, cloud director |
| Governance | Orchestrating initiatives, maximizing benefits, managing risk | Chief transformation officer, CIO, CFO, chief risk officer |
| Platform | A scalable hybrid cloud platform, modernizing and building cloud-native | CTO, architects, engineers |
| Security | Confidentiality, integrity and availability of data and workloads | CISO, chief compliance officer, security engineers |
| Operations | Delivering cloud services at the level the business needs | Infrastructure and operations leaders, SREs |

> [!TIP] Business, People and Governance are the business-side perspectives. Platform, Security and Operations are the technical ones.

## The seven migration strategies (the 7 Rs)

| Strategy | Also called | What happens |
|---|---|---|
| Rehost | Lift and shift | Move the application as it is, with no changes |
| Relocate | | Move servers or workloads to a cloud version of the same platform, without new hardware or rewrites |
| Replatform | Lift, tinker and shift | Move with a few optimizations, such as switching a self-run database to Amazon RDS |
| Refactor | Re-architect | Redesign the application to use cloud-native features |
| Repurchase | Drop and shop | Replace the application with a different product, often SaaS |
| Retain | | Keep it where it is for now, for example because of compliance or dependencies |
| Retire | | Shut it down because it no longer has business value |

Refactor is the most complex and expensive strategy. For large migrations AWS suggests moving first (rehost, relocate or replatform) and modernizing afterwards.

## Resources for the migration journey

- **AWS Transform MGN** (formerly AWS Application Migration Service) automates rehosting by continuously replicating source servers to AWS, keeping cutover downtime short.
- **AWS Database Migration Service (AWS DMS)** migrates databases. It can do a one-time copy or **replicate ongoing changes** to keep the source and target in sync, and it supports moves between different database engines.
- **AWS DataSync** transfers file and object data online, over the network, into AWS storage.
- **AWS Snowball Edge** is a rugged physical device you load with data and ship to AWS, for large transfers where the network is too slow or unavailable.
- The **AWS Migration Acceleration Program (MAP)** offers methodology, tools, partners and funding, in assess, mobilize and migrate phases.

> [!NOTE] AWS Snowball Edge is no longer available to new customers, and AWS has announced the end of support for Snowball devices in commercial Regions on December 31, 2026. The exam guide still names Snowball, so know what it does.

## How the exam asks about it

> [!EXAM] Keywords: "move without changes" is rehost; "small optimizations, managed database" is replatform; "redesign for cloud-native" is refactor; "switch to SaaS" is repurchase; "decommission" is retire; "keep on premises for now" is retain. "Keep databases in sync during migration" is AWS DMS; "petabytes, limited bandwidth, ship a device" is Snowball. "Guidance on organizational readiness" is AWS CAF.

Common traps:

- **Replatform vs refactor**: a few changes is replatform; changing the architecture is refactor.
- **Retain vs retire**: retain keeps the application running; retire turns it off.
- **AWS CAF is not the Well-Architected Framework**: CAF is about adopting the cloud as an organization; Well-Architected is about designing workloads.

## Check yourself

1. A company moves virtual machines to Amazon EC2 without changing them. Which strategy? **Rehost.**
2. Which AWS CAF perspective covers culture, leadership and skills? **People.**
3. Which service keeps a source and target database synchronized during migration? **AWS Database Migration Service.**
4. An application is replaced with a SaaS product. Which strategy? **Repurchase.**
5. Name one AWS CAF business outcome. **Reduced business risk, improved ESG performance, increased revenue, or increased operational efficiency.**
`,
};
