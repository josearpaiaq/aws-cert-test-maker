import type { Lesson } from '@/content/lesson';

export const securityComponents: Lesson = {
  taskStatement: '2.4',
  title: 'AWS security components and resources',
  summary:
    'Security groups, network ACLs and AWS WAF, third-party tools in AWS Marketplace, and where to find security help.',
  draft: true,
  sources: [
    {
      title: 'Infrastructure security in Amazon VPC',
      url: 'https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html',
    },
    {
      title: 'AWS WAF',
      url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html',
    },
    {
      title: 'What is AWS Marketplace?',
      url: 'https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html',
    },
    {
      title: 'AWS Trusted Advisor',
      url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html',
    },
    {
      title: 'AWS Cloud Security',
      url: 'https://aws.amazon.com/security/',
    },
  ],
  body: `
## Layers of network protection

AWS gives you several firewalls that work at different layers. Using more than one is called **defense in depth**: if one layer is misconfigured, another still protects you.

| Feature | Protects | Rules | Return traffic |
|---|---|---|---|
| Security group | An instance | Allow rules only; all rules are evaluated together | Allowed automatically (stateful) |
| Network ACL | A whole subnet | Allow and deny rules, evaluated in number order until one matches | Must be allowed explicitly (stateless) |
| AWS WAF | A web application | Inspects HTTP(S) requests, for example by source IP address, country or query string | Not applicable |

### Security groups

A security group is a virtual firewall for your instances. You write rules that **allow** traffic by protocol, port and source; anything not allowed is blocked. Because security groups are stateful, a response to allowed traffic is let back in automatically. AWS recommends security groups as the main way to control network access.

### Network ACLs

A network ACL guards the subnet boundary. It can **deny** traffic, which security groups cannot, so it is useful for blocking a specific IP address range. Because it is stateless, you must allow the return traffic yourself.

### AWS WAF

**AWS WAF** is a web application firewall. It watches the HTTP(S) requests sent to resources such as Amazon CloudFront distributions, Application Load Balancers and Amazon API Gateway REST APIs. Based on your rules it serves the content, blocks the request, or sends a custom response. Its rules can look for attacks hidden in web requests, such as SQL injection or cross-site scripting.

> [!TIP] Shield and WAF work together: Shield handles DDoS floods at the network level, and WAF filters malicious web requests.

## Third-party security products

**AWS Marketplace** is a curated digital catalog of third-party software, data and services, with security as one of its main categories. Every product goes through a curation process. You can launch preconfigured software in a few clicks, as an Amazon Machine Image or as software as a service, and the charges appear on your AWS bill. Some listings are even ready-made rule sets for AWS WAF.

## Where to find security information

| Resource | What you find there |
|---|---|
| AWS Cloud Security (the AWS Security Center) | The AWS security landing page: services, compliance, training and vulnerability reporting |
| AWS Security Blog | How-to articles, best practices and announcements about security, identity and compliance |
| AWS Knowledge Center (on AWS re:Post) | Official answers to the most common customer questions, including security troubleshooting |
| AWS documentation | Security chapters in service guides, such as Security in Amazon RDS, that explain how to secure that service |

## Finding security issues with Trusted Advisor

**AWS Trusted Advisor** inspects your account and recommends improvements, including closing security gaps. Its security checks include:

- Security groups that leave specific ports open to anyone
- MFA not turned on for the root user
- Amazon S3 bucket permissions that allow open access
- Exposed access keys and IAM access keys that have not been rotated

Every account can use a selected set of security checks. The full set of checks requires a higher AWS Support plan.

> [!NOTE] Trusted Advisor also covers cost, performance, fault tolerance and service limits, but on this task statement the exam focuses on its security checks.

## How the exam asks about it

> [!EXAM] "Firewall for an EC2 instance" means a security group. "Block a specific IP address at the subnet" or "stateless" means a network ACL. "SQL injection" or "cross-site scripting" means AWS WAF. "Buy a third-party security product" means AWS Marketplace. "Check my account for open ports or missing MFA" means Trusted Advisor.

Common traps:

- **Deny rules**: only network ACLs can deny traffic; security groups can only allow.
- **Stateful versus stateless**: security groups remember connections; network ACLs do not.
- **WAF versus security groups**: WAF understands web requests; security groups only see ports, protocols and addresses.

## Check yourself

1. Which feature works at the subnet level and supports deny rules? **A network ACL.**
2. Are security groups stateful or stateless? **Stateful.**
3. Which service protects a web application from SQL injection? **AWS WAF.**
4. Where would you buy a third-party firewall that runs on AWS? **AWS Marketplace.**
5. Which service flags security groups with unrestricted ports? **AWS Trusted Advisor.**
`,
};
