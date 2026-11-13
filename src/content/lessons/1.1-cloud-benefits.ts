import type { Lesson } from '@/content/lesson';

export const cloudBenefits: Lesson = {
  taskStatement: '1.1',
  title: 'Benefits of the AWS Cloud',
  summary:
    'Why companies move to AWS: lower costs from economies of scale, global reach, high availability, elasticity and agility.',
  draft: true,
  sources: [
    {
      title: 'Six advantages of cloud computing',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html',
    },
    {
      title: 'What is Cloud Computing?',
      url: 'https://aws.amazon.com/what-is-cloud-computing/',
    },
    {
      title: 'AWS Global Infrastructure',
      url: 'https://aws.amazon.com/about-aws/global-infrastructure/',
    },
    {
      title: 'Regions and Availability Zones',
      url: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/',
    },
  ],
  body: `
## The value proposition

Instead of buying and running your own data centers, you rent IT resources from AWS over the internet, use them for as long as you need, and pay only for what you use. Every benefit the exam asks about grows out of that simple idea.

## The six advantages

AWS describes six advantages of cloud computing. Learn them by name: exam options often paraphrase them.

| Advantage | What it means in practice |
|---|---|
| Trade fixed expense for variable expense | No big up-front purchase of servers; you pay as you consume |
| Benefit from massive economies of scale | AWS buys and runs infrastructure for a huge number of customers, so its prices per unit are lower than you could reach alone |
| Stop guessing capacity | Add or remove capacity as demand changes instead of forecasting years ahead |
| Increase speed and agility | New resources take minutes, not weeks, so experiments are cheap and fast |
| Stop spending money running and maintaining data centers | Spend effort on your product, not on racking, powering and cooling servers |
| Go global in minutes | Deploy to Regions around the world in a few clicks to serve users with lower latency |

## Economies of scale

Because usage from many customers is pooled, AWS operates at a scale no single company can match. Those savings show up as lower pay-as-you-go prices for you. On the exam, "lower variable cost than you could achieve on your own" points to **economies of scale**.

## Global infrastructure: speed and reach

The AWS Global Infrastructure is made of **Regions**, each a separate geographic area containing several **Availability Zones (AZs)**. Each Region has at least three AZs.

- **Global reach**: you can run the same application in several Regions and place it close to your users, which cuts latency.
- **Speed of deployment**: because the infrastructure already exists, launching in a new country is a configuration choice, not a construction project.

## High availability, elasticity and agility

These three words are easy to mix up. Keep them apart:

| Term | Question it answers | Example |
|---|---|---|
| High availability | Does the system keep running when part of it fails? | Running across multiple AZs, each with independent power, cooling and networking |
| Elasticity | Does capacity follow demand automatically, up and down? | Adding servers for a sales peak and removing them afterwards |
| Agility | How quickly can the team try something new? | Spinning up a test environment in minutes and deleting it when done |

> [!TIP] Elasticity works in both directions. If an option only talks about growing, it may describe scalability rather than elasticity. Scaling back down is what saves money.

An AZ is one or more data centers with redundant power and networking, isolated from failures in other AZs but linked to them by fast, low-latency connections. Spreading an application across AZs protects it from a local problem such as a power outage.

## How the exam asks about it

> [!EXAM] Match the keywords: "pay only for what you use" or "no up-front investment" is trading fixed for variable expense; "lower prices because of aggregated usage" is economies of scale; "no more over- or under-provisioning" is stop guessing capacity; "resources in minutes, experiment quickly" is agility; "deploy worldwide with low latency" is go global in minutes; "keeps running if a data center fails" is high availability.

Common traps:

- **Elasticity is not high availability**: one is about matching demand, the other about surviving failures.
- **Agility is about speed, not cost**: lower experiment cost is a side effect, but the keyword is time to deliver.
- **The cloud does not remove all costs**: you still pay for what you use, just without large up-front purchases.

## Check yourself

1. A startup wants to avoid buying servers before it knows how many users it will have. Which advantage applies? **Trade fixed expense for variable expense (and stop guessing capacity).**
2. Why can AWS offer lower prices than a company running its own data center? **Economies of scale.**
3. An application adds servers during a traffic spike and removes them afterwards. What is this called? **Elasticity.**
4. How do you protect an application from the failure of a single data center? **Run it across multiple Availability Zones (high availability).**
`,
};
