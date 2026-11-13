import type { Lesson } from '@/content/lesson';

export const globalInfrastructure: Lesson = {
  taskStatement: '3.2',
  title: 'The AWS global infrastructure',
  summary:
    'Regions, Availability Zones and edge locations, how they deliver high availability, and when to use more than one Region.',
  draft: true,
  sources: [
    {
      title: 'Global Infrastructure Regions & AZs',
      url: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/',
    },
    {
      title: 'Regions and Zones (Amazon EC2)',
      url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html',
    },
    {
      title: 'Disaster recovery options in the cloud',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html',
    },
    {
      title: 'What is Amazon CloudFront?',
      url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
    },
    {
      title: 'What is AWS Global Accelerator?',
      url: 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html',
    },
  ],
  body: `
## The building blocks

AWS infrastructure is organized in layers, from large geographic areas down to sites close to your users.

| Component | What it is | What it gives you |
|---|---|---|
| Region | A separate geographic area where AWS clusters its data centers | A place to run workloads close to users or to meet legal requirements |
| Availability Zone (AZ) | One or more discrete data centers inside a Region, with redundant power, networking and connectivity | Fault isolation inside a Region |
| Edge location | A site in a city around the world used by services such as Amazon CloudFront | Content and traffic served close to users, with lower latency |
| Local Zone | An extension of a Region placed near a large population or industry center | Low latency for users in that city, and help with local data residency |
| Wavelength Zone | AWS compute and storage at the edge of a telecom carrier's 5G network | Ultra-low latency for mobile and 5G devices |

How they relate: a Region contains several AZs. Local Zones and Wavelength Zones are tied to a parent Region and extend it. Edge locations are separate from Regions and are spread across many more cities.

## Availability Zones and high availability

Each AZ has its own power, cooling and physical security, and AZs are physically separated by a meaningful distance. AZs **do not share single points of failure**, so a problem such as a power outage in one AZ should not take down another. They are still linked by high-bandwidth, low-latency networking, close enough for synchronous replication.

To achieve high availability, run your application in **at least two AZs**. If one AZ fails, instances in another AZ keep serving requests. Many managed services do this for you, such as Amazon RDS Multi-AZ deployments.

> [!TIP] One AZ is a single location, so a design that uses only one AZ is not highly available, no matter how many instances it has.

## When to use multiple Regions

Regions are isolated from each other, and AWS does not automatically copy your resources between them. You choose to go multi-Region for specific reasons:

- **Disaster recovery and business continuity**: if a whole Region becomes unavailable, a copy of the workload in another Region can take over. Strategies range from backups copied to another Region up to running fully active in several Regions.
- **Low latency**: serve users from the Region nearest to them.
- **Data sovereignty and compliance**: laws or contracts may require data to stay inside a country or area. Choosing the Region decides where the data lives.

> [!NOTE] Losing a single data center is usually handled with multiple AZs. Plan for multiple Regions when the risk you are protecting against is the loss of a whole Region, or when a regulation demands it.

## Benefits of edge locations

| Service | What it does at the edge | Use it for |
|---|---|---|
| Amazon CloudFront | A content delivery network (CDN) that caches copies of your content in edge locations and routes each request to the edge with the lowest latency | Websites, images, video and APIs for users worldwide |
| AWS Global Accelerator | Gives your application static anycast IP addresses at the edge, then carries traffic over the AWS global network to the nearest healthy Regional endpoint | Faster, more available non-cached traffic, with quick failover between Regions |

Both services move users onto the AWS network close to where they are, instead of crossing many internet networks.

## How the exam asks about it

> [!EXAM] Match the keywords: "high availability" or "survive a data center failure" means multiple Availability Zones; "disaster recovery for a Regional outage" or "data must stay in a country" means choosing or adding Regions; "cache content close to users" means CloudFront; "static IP addresses" plus "global network" means Global Accelerator; "5G" means Wavelength Zones; "low latency for users in one specific city" points to Local Zones.

Common traps:

- **Edge locations are not Availability Zones.** You do not launch ordinary EC2 instances in them.
- **More instances in one AZ does not add availability.** Spread them across AZs.
- **CloudFront caches; Global Accelerator does not.** Global Accelerator speeds up and routes traffic, it does not store copies of content.

## Check yourself

1. What is the minimum design for a highly available web tier? **Instances in at least two Availability Zones.**
2. A law requires customer data to stay in Germany. Which choice matters most? **The AWS Region where the data is stored.**
3. Which service caches static content at edge locations? **Amazon CloudFront.**
4. Which infrastructure brings AWS compute to the edge of 5G networks? **AWS Wavelength Zones.**
`,
};
