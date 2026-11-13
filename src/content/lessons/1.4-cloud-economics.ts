import type { Lesson } from '@/content/lesson';

export const cloudEconomics: Lesson = {
  taskStatement: '1.4',
  title: 'Cloud economics',
  summary:
    'Fixed versus variable costs, licensing choices, rightsizing, automation and managed services as ways the cloud saves money.',
  draft: true,
  sources: [
    {
      title: 'Six advantages of cloud computing',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html',
    },
    {
      title: 'What is Amazon Relational Database Service (Amazon RDS)?',
      url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html',
    },
    {
      title: 'RDS for Oracle licensing options',
      url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Oracle.Concepts.Licensing.html',
    },
    {
      title: 'What is AWS Compute Optimizer?',
      url: 'https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html',
    },
    {
      title: 'What is CloudFormation?',
      url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html',
    },
  ],
  body: `
## Fixed costs vs variable costs

On premises, you pay large **fixed costs** before you know how much you will use: buildings, servers, network gear and the people to run them. In the cloud, most costs become **variable**: you pay for what you consume, when you consume it.

| | On premises | AWS Cloud |
|---|---|---|
| Spending model | Capital expense up front (CapEx) | Operating expense as you go (OpEx) |
| Capacity | Bought for the expected peak, often idle | Added and removed as demand changes |
| Paying for idle resources | Yes, the hardware is already bought | Only if you leave resources running |
| Data center operations | Your responsibility | Handled by AWS |

## The real cost of on-premises

When comparing costs, count everything an on-premises environment needs, not just the servers:

- **Hardware**: servers, storage, networking, and replacing them as they age
- **Facilities**: space, power, cooling and physical security
- **People**: staff to install, patch, monitor and repair systems
- **Software licenses** and support contracts
- **Over-provisioning**: capacity bought for a peak that is rarely reached

## Licensing strategies

| Model | Who holds the license | Good fit when |
|---|---|---|
| Bring Your Own License (BYOL) | You reuse licenses you already own | You have existing licenses and want to avoid paying again |
| License included | AWS; you do not buy licenses separately |You have no licenses or want to stop managing them |

For example, Amazon RDS for Oracle supports both models. **AWS License Manager** helps track license use, including BYOL, across accounts and Regions.

## Rightsizing

**Rightsizing** means matching resource types and sizes to what a workload actually needs. An oversized instance costs money for capacity nobody uses. **AWS Compute Optimizer** analyzes utilization metrics and recommends resizing resources or stopping idle ones.

> [!TIP] Rightsizing is an ongoing habit, not a one-time task. Because resizing in the cloud is easy, you can start small and adjust.

## Automation

Automation saves staff time and avoids costly mistakes. **AWS CloudFormation** lets you describe your resources in a text template and creates them for you:

- The same template builds identical environments again and again, in any Region.
- Deleting a stack removes all of its resources together, so nothing is left running by accident.
- Templates can be version-controlled, so changes are tracked and can be rolled back.

## Managed services

Managed services move operational work from you to AWS, which lowers the total cost of running a workload.

| Service | What it is | What AWS handles |
|---|---|---|
| Amazon RDS | Managed relational database | Backups, patching, failure detection and recovery |
| Amazon DynamoDB | Serverless NoSQL database | Servers, software maintenance, scaling and high availability |
| Amazon ECS | Managed container orchestration | The control plane; with AWS Fargate, the servers too |
| Amazon EKS | Managed Kubernetes | The Kubernetes control plane |

## How the exam asks about it

> [!EXAM] Keywords: "pay up front for hardware" is a fixed cost (CapEx); "pay for what you use" is variable (OpEx). "Reuse existing licenses" is BYOL. "Instance is underutilized" is rightsizing, with AWS Compute Optimizer. "Repeatable infrastructure from templates" is AWS CloudFormation. "Reduce database administration" points to Amazon RDS or DynamoDB.

Common traps:

- **Cloud costs are not zero when idle**: a running but unused instance still costs money.
- **Managed does not mean free of effort**: on RDS you still own query tuning, access and your data.
- **Labor counts**: cost savings include fewer hours spent on maintenance, not only cheaper hardware.

## Check yourself

1. Is buying servers for a new data center a fixed or a variable cost? **Fixed.**
2. A company wants to reuse its existing database licenses on AWS. Which licensing model? **Bring Your Own License (BYOL).**
3. Which service recommends smaller instances for underused EC2 resources? **AWS Compute Optimizer.**
4. Which service creates the same environment repeatedly from a template? **AWS CloudFormation.**
5. Which managed service runs a relational database with automated backups and patching? **Amazon RDS.**
`,
};
