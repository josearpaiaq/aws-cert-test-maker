import type { Lesson } from '@/content/lesson';

export const sharedResponsibility: Lesson = {
  taskStatement: '2.1',
  title: 'The shared responsibility model',
  summary: 'Who secures what: AWS secures the cloud itself, you secure what you put in it.',
  draft: true,
  sources: [
    {
      title: 'Shared Responsibility Model',
      url: 'https://aws.amazon.com/compliance/shared-responsibility-model/',
    },
    {
      title: 'Security in Amazon RDS',
      url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html',
    },
    {
      title: 'Security in AWS Lambda',
      url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html',
    },
  ],
  body: `
## The idea in one sentence

AWS is responsible for security **of** the cloud. You are responsible for security **in** the cloud. Almost every exam question on this topic comes down to deciding which side of that line a task falls on.

## What AWS secures

AWS protects the infrastructure that runs every AWS service:

- **Physical security** of data centers: buildings, guards, power, cooling
- **Hardware**: servers, storage devices and networking equipment, including replacing and destroying failed disks
- **The global network** that connects Regions, Availability Zones and edge locations
- **The virtualization layer** (hypervisor) that separates customers from each other
- **The software of managed services**, such as patching the database engine in Amazon RDS

## What you secure

Whatever you build on AWS is yours to protect:

- **Your data**: what you store, how you classify it, whether and how you encrypt it, and your backups
- **Identity and access**: IAM users, groups and roles, MFA, and the principle of least privilege
- **Configuration**: security groups, network ACLs, S3 bucket policies and Block Public Access settings
- **On Amazon EC2**: the guest operating system, its patches, and any software you install

> [!TIP] A quick test: if you could change it from the AWS console or an API call, it is almost always your responsibility.

## The line moves with the service

The more managed a service is, the more of the stack AWS runs for you, so your share shrinks. It never reaches zero: you always own your data and who can access it.

{{diagram:responsibility-by-service}}

- **Amazon EC2** is infrastructure as a service: you manage everything from the operating system up.
- **Amazon RDS** is a managed database: AWS patches the operating system and the database engine; you manage database users, network access and your data.
- **AWS Lambda** is serverless: AWS runs the servers, operating system and scaling; you own your function code, its configuration and its permissions.

## Shared and inherited controls

Some controls are split between both sides:

| Control | AWS does | You do |
|---|---|---|
| Patch management | Patches the infrastructure | Patches guest operating systems and applications |
| Configuration management | Configures its infrastructure devices | Configures guest systems, databases and applications |
| Awareness and training | Trains AWS employees | Trains your own staff |

Other controls are **inherited**: physical and environmental controls are fully handled by AWS, and you rely on them without doing anything.

## How the exam asks about it

> [!EXAM] Read every option and ask "of the cloud or in the cloud?". Hardware, facilities, the global network and the hypervisor are AWS. Data, IAM, encryption choices, security groups and the guest operating system on EC2 are you.

Common traps:

- **Encryption**: AWS provides the tools, such as AWS KMS, but deciding to encrypt your data is your responsibility.
- **Patching**: "Patch the operating system" is yours on EC2 but AWS's on RDS and Lambda.
- **Managed does not mean hands-off**: even on Lambda you must still set permissions correctly.

## Check yourself

1. Who patches the guest operating system of an EC2 instance? **You.**
2. Who patches the database engine of an RDS instance? **AWS.**
3. Who decides whether an S3 bucket is public? **You.**
4. Who disposes of a failed storage disk? **AWS.**
`,
};
