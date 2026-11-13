import type { Lesson } from '@/content/lesson';

export const wellArchitected: Lesson = {
  taskStatement: '1.2',
  title: 'The AWS Well-Architected Framework',
  summary:
    'The six pillars of good cloud design, what each one focuses on, and how to tell them apart.',
  draft: true,
  sources: [
    {
      title: 'AWS Well-Architected Framework',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
    },
    {
      title: 'The pillars of the framework',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html',
    },
    {
      title: 'Reliability: design principles',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html',
    },
    {
      title: 'Cost optimization: design principles',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html',
    },
    {
      title: 'Sustainability: design principles',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sus-design-principles.html',
    },
  ],
  body: `
## What the framework is

The **AWS Well-Architected Framework** is a set of best practices and questions for designing and running workloads on AWS. It helps you weigh the pros and cons of architecture decisions and measure a design against good practice. A review is meant to be a constructive conversation, not an audit.

The free **AWS Well-Architected Tool** in the console lets you review a workload by answering questions for each pillar and get improvement recommendations.

## The six pillars

| Pillar | Focus | Ask yourself |
|---|---|---|
| Operational excellence | Running and monitoring systems and improving them over time | How do we deploy, observe and learn from operations? |
| Security | Protecting data, systems and assets | Who can access what, and is data protected? |
| Reliability | Performing the intended function correctly and consistently, and recovering from failure | What happens when something breaks? |
| Performance efficiency | Using resources efficiently as demand and technology change | Are we using the right resource types and sizes? |
| Cost optimization | Delivering business value at the lowest price point | Are we paying for anything we do not need? |
| Sustainability | Reducing the environmental impact of workloads | Can we do the same work with less energy and hardware? |

> [!TIP] A memory aid for the six: "**O**ld **S**ervers **R**arely **P**erform **C**heaply or **S**ustainably". Operational excellence, Security, Reliability, Performance efficiency, Cost optimization, Sustainability.

## Example design principles per pillar

Each pillar has its own design principles. A few of the most testable:

- **Operational excellence**: safely automate where possible (define operations as code), make frequent, small, reversible changes, anticipate failure, learn from operational events, use managed services.
- **Security**: implement a strong identity foundation with least privilege, maintain traceability, apply security at all layers, protect data in transit and at rest, keep people away from data, prepare for security events.
- **Reliability**: automatically recover from failure, test recovery procedures, scale horizontally to increase availability, stop guessing capacity, manage change through automation.
- **Performance efficiency**: democratize advanced technologies (consume them as services), go global in minutes, use serverless architectures, experiment more often, consider mechanical sympathy (pick the technology that fits how the workload accesses data).
- **Cost optimization**: implement Cloud Financial Management, adopt a consumption model, measure overall efficiency, stop spending money on undifferentiated heavy lifting, analyze and attribute expenditure.
- **Sustainability**: understand your impact, establish sustainability goals, maximize utilization, adopt more efficient hardware and software, use managed services, reduce the downstream impact on your customers.

## Telling the pillars apart

The hardest questions describe a practice and ask which pillar it belongs to. Focus on the **goal** of the practice:

| If the goal is... | The pillar is... |
|---|---|
| Recovering from failure, surviving an outage, testing recovery | Reliability |
| Choosing the right instance type or a serverless option for speed | Performance efficiency |
| Removing idle resources to save money | Cost optimization |
| Removing idle resources to use less energy | Sustainability |
| Encryption, IAM, audit logs, incident response | Security |
| Runbooks, monitoring, small deployments, post-incident reviews | Operational excellence |

## How the exam asks about it

> [!EXAM] Keywords: "recover", "failover", "test recovery" means Reliability; "least privilege", "traceability", "encrypt" means Security; "right resource for the workload", "serverless", "experiment" means Performance efficiency; "lowest price", "consumption model", "attribute costs" means Cost optimization; "environmental impact", "energy", "maximize utilization" means Sustainability; "operations as code", "small reversible changes", "learn from failures" means Operational excellence.

Common traps:

- **Reliability is not performance**: being fast is performance efficiency; staying up and recovering is reliability.
- **Sustainability and cost overlap**: right-sizing helps both. Read whether the question cares about money or environmental impact.
- **Stop guessing capacity** is a reliability design principle, even though it also appears among the general cloud advantages.

## Check yourself

1. How many pillars does the Well-Architected Framework have? **Six.**
2. Which pillar includes "test recovery procedures"? **Reliability.**
3. Which pillar focuses on reducing energy consumption? **Sustainability.**
4. Which free service reviews workloads against the framework? **The AWS Well-Architected Tool.**
5. Which pillar includes "implement a strong identity foundation"? **Security.**
`,
};
