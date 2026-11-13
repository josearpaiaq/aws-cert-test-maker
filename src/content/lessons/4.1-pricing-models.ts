import type { Lesson } from '@/content/lesson';

export const pricingModels: Lesson = {
  taskStatement: '4.1',
  title: 'AWS pricing models',
  summary:
    'The EC2 purchasing options, how Reserved Instances flex and share, and what data transfer and storage cost.',
  draft: true,
  sources: [
    {
      title: 'Amazon EC2 billing and purchasing options',
      url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html',
    },
    {
      title: 'Reserved Instances for Amazon EC2 overview',
      url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html',
    },
    {
      title: 'How Reserved Instance discounts are applied',
      url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/apply_ri.html',
    },
    {
      title: 'Understanding data transfer charges',
      url: 'https://docs.aws.amazon.com/cur/latest/userguide/cur-data-transfers-charges.html',
    },
    {
      title: 'Amazon S3 pricing',
      url: 'https://aws.amazon.com/s3/pricing/',
    },
  ],
  body: `
## Paying for compute

Each option trades commitment against price.

| Option | What you commit to | Best for |
|---|---|---|
| On-Demand | Nothing: pay by the second for what runs | Short-term, spiky or unpredictable workloads, and testing |
| Savings Plans | A steady spend in USD per hour for 1 or 3 years | Steady usage where instance types or Regions may change |
| Reserved Instances | A specific configuration (instance type, Region, tenancy, platform) for 1 or 3 years | Steady, predictable workloads on a known configuration |
| Spot Instances | Nothing, but AWS can take the instance back | Work that can be interrupted: batch jobs, data analysis, background tasks |
| Dedicated Hosts | A whole physical server, billed per host | Server-bound licenses (per socket, per core, per VM) and control over placement |
| Dedicated Instances | Instances on single-tenant hardware, billed per instance | Compliance that needs dedicated hardware but no host-level control |
| Capacity Reservations | Capacity in one Availability Zone, for as long as you keep it | Guaranteed capacity for critical events or disaster recovery |

**Spot Instances** use spare EC2 capacity at a steep discount. When AWS needs the capacity back, the instance gets a **two-minute warning** before it is interrupted.

## Savings Plans and Reserved Instances

AWS recommends **Savings Plans** over Reserved Instances: both can save up to 72% versus On-Demand, but Savings Plans flex more.

- **Compute Savings Plans** apply to any instance family, size, operating system, tenancy or Region, and also cover AWS Fargate and AWS Lambda.
- **EC2 Instance Savings Plans** lock you to one instance family in one Region, in exchange for a bigger discount.

A **Reserved Instance** is not a server but a billing discount for running instances that match its attributes.

- **Payment options**: All Upfront, Partial Upfront or No Upfront. Paying more upfront generally saves more.
- **Standard** RIs give the largest discount but cannot be exchanged. **Convertible** RIs give less but can be exchanged for different attributes.
- RIs cannot be cancelled. When they expire, you pay On-Demand rates again.

### Reserved Instance flexibility

- A **regional** RI applies in any Availability Zone of its Region and to any size in the same instance family (**instance size flexibility**). It does not reserve capacity.
- A **zonal** RI reserves capacity in one Availability Zone, but the running instance must match exactly.
- Size flexibility does not apply to zonal RIs, dedicated tenancy, or some platforms such as Windows.

### Reserved Instances in AWS Organizations

With consolidated billing, an RI discount applies first to the account that bought it, then any unused discount covers matching usage in other member accounts. The **management account** can turn this sharing off per account. A zonal RI's reserved capacity always stays with its owner.

## Data transfer charges

| Traffic | Charged? |
|---|---|
| From the internet into AWS | No |
| From AWS out to the internet | Yes |
| Between Regions | Yes, billed on the way out of the source Region; arriving in the destination is free |
| Between Availability Zones in one Region | Usually yes, in both directions (some services do not charge in-Region traffic) |

## Storage pricing

- **Amazon S3** charges for storage, requests and retrievals, data transfer, and features such as replication. Colder classes cost less to store but add retrieval charges and a **minimum storage duration**: 30 days for Standard-IA and One Zone-IA, 90 days for Glacier Instant and Flexible Retrieval, 180 days for Glacier Deep Archive.
- **S3 Intelligent-Tiering** adds a small monitoring fee per object but no retrieval fees.
- **Amazon EBS** charges for the GB you **provision**, whether or not you fill it. Snapshots are incremental and billed on the data they store.

## How the exam asks about it

> [!EXAM] "Can be interrupted, lowest cost" means Spot. "Steady for 1 or 3 years, may change instance family or move to Lambda" means Compute Savings Plans. "Existing per-core license" means Dedicated Hosts. "Guarantee capacity in one AZ, no long-term commitment" means On-Demand Capacity Reservations. "Short, unpredictable, no commitment" means On-Demand.

Common traps:

- **Data in is free, data out is not.**
- **Regional RIs reserve no capacity**: only zonal RIs and Capacity Reservations do.
- **EBS bills provisioned size**, not used space.

## Check yourself

1. Which option suits a fault-tolerant batch job at the lowest price? **Spot Instances.**
2. Which Savings Plan also covers AWS Lambda? **Compute Savings Plans.**
3. Which kind of RI gives instance size flexibility? **A regional Reserved Instance.**
4. Who can turn off RI discount sharing in an organization? **The management account.**
5. Is data transferred from the internet into AWS charged? **No.**
`,
};
