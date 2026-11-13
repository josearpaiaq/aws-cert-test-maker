import type { Lesson } from '@/content/lesson';

export const networking: Lesson = {
  taskStatement: '3.5',
  title: 'AWS network services',
  summary:
    'The parts of a VPC, how security groups and network ACLs differ, Route 53, edge services and ways to connect to AWS.',
  draft: true,
  sources: [
    {
      title: 'How Amazon VPC works',
      url: 'https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html',
    },
    {
      title: 'Infrastructure security in Amazon VPC',
      url: 'https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html',
    },
    {
      title: 'What is Amazon Route 53?',
      url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html',
    },
    {
      title: 'What is AWS Global Accelerator?',
      url: 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html',
    },
    {
      title: 'What is Direct Connect?',
      url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html',
    },
  ],
  body: `
## Your own network in the cloud

An **Amazon VPC** (virtual private cloud) is a virtual network that belongs to your account and is isolated from every other network in AWS. You pick its IP address range and then divide it up and connect it.

## The parts of a VPC

| Component | What it does |
|---|---|
| Subnet | A slice of the VPC's IP range in one Availability Zone. You launch resources such as EC2 instances into subnets |
| Route table | A set of routes that decides where traffic leaving a subnet goes. Each subnet uses one route table |
| Internet gateway | Attached to the VPC, it lets resources with public IP addresses talk to the internet in both directions |
| NAT gateway | Lets instances in a private subnet start connections out to the internet, while blocking connections started from the internet |

A **public subnet** is simply one whose route table sends internet traffic to an internet gateway. A **private subnet** has no such route. A public NAT gateway lives in a public subnet, and private instances reach the internet through it.

> [!TIP] Internet gateway: traffic both ways. NAT gateway: outbound only, for private subnets.

## Security inside a VPC

Two firewalls filter traffic, at two different levels.

| | Security group | Network ACL |
|---|---|---|
| Applies to | Instances (their network interfaces) | Whole subnets |
| Rules | Allow rules only | Allow and deny rules |
| How rules are checked | All rules are evaluated together | In number order; the first match wins |
| Return traffic | Allowed automatically (stateful) | Must be allowed explicitly (stateless) |

AWS recommends security groups as the main control. Network ACLs add a second, coarser layer, for example to **block** a specific IP range, which a security group cannot do.

## Amazon Route 53

Route 53 is AWS's **DNS** service. It does three jobs, alone or together:

1. **Registers domain names**, such as example.com.
2. **Routes users** who type that name to your resources, for example a load balancer or an S3 website. Routing can take latency, location and health into account.
3. **Checks the health** of your resources and can steer traffic away from unhealthy ones.

## Edge services

Both use the AWS edge network, but solve different problems.

| | Amazon CloudFront | AWS Global Accelerator |
|---|---|---|
| What it is | A content delivery network (CDN) | A network accelerator with fixed entry points |
| How it helps | Caches copies of content in edge locations near viewers | Carries traffic over the AWS global network to the best healthy endpoint |
| What users connect to | A CloudFront domain name (or your own) | Static anycast IP addresses |
| Typical use | Websites, images, video, APIs served over HTTP | Global apps that need fixed IPs or fast Regional failover |

> [!NOTE] Global Accelerator does not cache content. If the question mentions caching, it is CloudFront.

## Connecting your network to AWS

- **AWS Site-to-Site VPN** creates encrypted IPsec tunnels over the public internet between your data center and your VPC. It is quick to set up.
- **AWS Client VPN** lets individual users connect securely from their own devices.
- **AWS Direct Connect** is a **dedicated private connection** from your network to AWS through a Direct Connect location, bypassing the internet for more consistent performance. Traffic on it is **not encrypted by default**; you can add MACsec or run a VPN over it.

## How the exam asks about it

> [!EXAM] Match the keywords: "private subnet needs to download updates" is a NAT gateway; "block a specific IP address" is a network ACL; "stateful, instance-level firewall" is a security group; "DNS" or "register a domain" is Route 53; "cache content near users" is CloudFront; "static IP addresses for a global app" is Global Accelerator; "encrypted connection over the internet, set up quickly" is Site-to-Site VPN; "dedicated, private, consistent connection" is Direct Connect.

Common traps:

- **Security groups cannot deny**: they only allow. Denying a source needs a network ACL.
- **Direct Connect is not encrypted by itself**: private is not the same as encrypted.

## Check yourself

1. Which component lets instances in a private subnet reach the internet without being reachable from it? **A NAT gateway.**
2. Which firewall is stateless and works at the subnet level? **A network ACL.**
3. Which service registers domain names and checks the health of endpoints? **Amazon Route 53.**
4. Which edge service gives an application two static anycast IP addresses? **AWS Global Accelerator.**
5. Which option gives a dedicated connection that does not travel over the internet? **AWS Direct Connect.**
`,
};
