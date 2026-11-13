import type { Lesson } from '@/content/lesson';

export const deployAndOperate: Lesson = {
  taskStatement: '3.1',
  title: 'Deploying and operating in AWS',
  summary:
    'The console, the CLI, SDKs and infrastructure as code, the three deployment models, and the ways to connect to AWS.',
  draft: true,
  sources: [
    {
      title: 'What is the AWS Command Line Interface?',
      url: 'https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html',
    },
    {
      title: 'What is CloudFormation?',
      url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html',
    },
    {
      title: 'Types of cloud computing',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html',
    },
    {
      title: 'What is AWS Site-to-Site VPN?',
      url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html',
    },
    {
      title: 'What is Direct Connect?',
      url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html',
    },
  ],
  body: `
## Ways to access AWS

Every action in AWS, from launching a server to reading a bill, is an API call. The tools below are different doors into the same APIs, so the choice is about who is doing the work and how often.

| Method | What it is | Best for |
|---|---|---|
| AWS Management Console | A web interface you use in a browser | One-time tasks, exploring a service, checking things visually |
| AWS CLI | Commands typed in a terminal, which can be saved as scripts | Quick tasks and simple automation |
| AWS SDKs | Libraries for languages such as Python, Java or JavaScript that call AWS APIs for you | Applications that create or use AWS resources from their own code |
| Infrastructure as code | Text files that describe the resources you want, such as AWS CloudFormation templates | Building the same environment again and again, the same way |

The SDKs handle low-level details such as signing requests and retrying failed calls.

## One-time operations or repeatable processes

- **One-time operation**: you need to look at a setting or create a single test resource. The console is the fastest and simplest choice.
- **Repeatable process**: you need the same setup in several accounts or Regions, or every time you release. Clicking through the console invites mistakes, so use scripts or, better, infrastructure as code.

## Infrastructure as code with AWS CloudFormation

With CloudFormation you write a **template** that lists your resources and their settings, for example a load balancer, an Auto Scaling group and a database. CloudFormation creates them together as a **stack** and works out the order they must be created in.

- **Repeatable**: deploy the same template to another Region to get an identical copy.
- **Managed as one unit**: deleting the stack deletes every resource in it.
- **Trackable**: templates are text, so you can keep them in version control, see who changed what, and go back to an earlier version.

## Cloud deployment models

| Model | Where it runs | Typical reason |
|---|---|---|
| Cloud | Every part of the application runs in the cloud | New applications, or full migrations that want all the cloud benefits |
| Hybrid | Cloud resources connected to existing on-premises systems | Extending a data center into the cloud, or migrating step by step |
| On-premises (private cloud) | Your own data center, using virtualization tools | Dedicated resources; keeps most of the limits of traditional IT |

## Connectivity options

How does your office or data center reach your resources in AWS?

| Option | How it works | Choose it when |
|---|---|---|
| Public internet | Users and systems connect to public AWS endpoints over the internet | The default for public websites and APIs |
| AWS Site-to-Site VPN | Encrypted IPsec tunnels between your network and your VPC, carried over your internet connection | You need a secure link to a VPC without new physical circuits |
| AWS Client VPN | A managed VPN that individual users connect to from their devices | Remote employees need secure access |
| AWS Direct Connect | A dedicated physical network link from your network to AWS through a Direct Connect location, bypassing internet providers | You need a private connection with more consistent network performance |

Each Site-to-Site VPN connection includes **two tunnels** for high availability. Direct Connect traffic does not cross the public internet, but it is **not encrypted by default**; you add encryption if you need it.

## How the exam asks about it

> [!EXAM] Match the keywords: "repeatable, consistent environments" or "infrastructure as code" means AWS CloudFormation; "web-based interface" means the Management Console; "scripts in a terminal" means the AWS CLI; "from application code" means the SDKs; "encrypted connection over the internet" means AWS VPN; "dedicated private connection that bypasses the internet" means AWS Direct Connect.

Common traps:

- **Direct Connect is not a VPN.** It is a physical link, not an encrypted tunnel.
- **Hybrid is not "half and half".** Any setup that connects cloud resources with on-premises systems is hybrid.
- **The console is fine for one-off checks**, just not for repeatable work.

## Check yourself

1. A team must create identical environments in three Regions. What should it use? **Infrastructure as code, such as AWS CloudFormation.**
2. Which option gives a dedicated network link to AWS that does not use the public internet? **AWS Direct Connect.**
3. A company keeps its data center and connects it to resources in a VPC. Which deployment model is this? **Hybrid.**
4. A developer wants an application to upload files to S3 from Python code. What should it use? **An AWS SDK.**
`,
};
