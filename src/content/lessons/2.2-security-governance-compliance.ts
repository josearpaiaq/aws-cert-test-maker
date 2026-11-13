import type { Lesson } from '@/content/lesson';

export const securityGovernanceCompliance: Lesson = {
  taskStatement: '2.2',
  title: 'Security, governance and compliance',
  summary:
    'Where to find compliance reports, which services detect threats, how encryption works, and where the logs live.',
  draft: true,
  sources: [
    {
      title: 'What is AWS Artifact?',
      url: 'https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html',
    },
    {
      title: 'Compliance Programs',
      url: 'https://aws.amazon.com/compliance/programs/',
    },
    {
      title: 'What Is AWS CloudTrail?',
      url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html',
    },
    {
      title: 'Introduction to AWS Security Hub CSPM',
      url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html',
    },
    {
      title: 'Protecting data with encryption',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryption.html',
    },
  ],
  body: `
## Proving compliance

**AWS Artifact** is the self-service portal for AWS compliance documents. It gives you on-demand downloads of reports such as SOC reports, ISO certifications and PCI reports, at no cost. You can also review and accept agreements with AWS there.

> [!NOTE] Artifact shows that the AWS infrastructure is compliant. Demonstrating that your own workloads are compliant is still your job.

## Compliance programs by place and industry

Requirements change with the country and the industry you work in. AWS groups its **compliance programs** into three kinds:

- **Certifications and attestations**, audited by independent parties: for example ISO 27001, SOC and PCI DSS worldwide, FedRAMP in the United States, C5 in Germany and IRAP in Australia
- **Laws, regulations and privacy**, where no formal certification exists and AWS provides features and agreements instead: for example HIPAA for US healthcare and GDPR for EU privacy
- **Alignments and frameworks**, published requirements such as NIST guidelines

Compliance also **varies by service**. Not every AWS service is in scope for every program, so check the AWS Services in Scope by Compliance Program list before you put regulated data into a service.

## Services that help you secure resources

| Service | What it does | Think of it as |
|---|---|---|
| Amazon Inspector | Scans EC2 instances, ECR container images and Lambda functions for software vulnerabilities and unintended network exposure | Vulnerability scanner |
| Amazon GuardDuty | Analyzes CloudTrail events, VPC flow logs and DNS logs to detect threats such as compromised credentials | Threat detection |
| AWS Security Hub CSPM | Gathers findings from GuardDuty, Inspector and others, and checks accounts against security standards | Single pane of glass |
| AWS Shield | Shield Standard protects every customer from common DDoS attacks at no extra charge; Shield Advanced is a paid subscription with expanded protection | DDoS protection |

## Encryption

Encryption makes stolen data useless without the key.

- **In transit**: data is protected while it travels across the network, typically with TLS (HTTPS).
- **At rest**: data is protected while it is stored on disk. For example, Amazon S3 encrypts every new object by default with S3-managed keys.
- **AWS KMS** (Key Management Service) lets you create and control the keys used to encrypt your data. Keys are protected by hardware security modules and never leave the service unencrypted, and many AWS services integrate with it.

## Governance: monitor, audit, report

| Need | Service | What you get |
|---|---|---|
| Monitoring | Amazon CloudWatch | Metrics, alarms, dashboards and log storage (CloudWatch Logs) |
| Auditing API activity | AWS CloudTrail | A record of who did what, when, from the console, CLI or SDKs |
| Auditing configuration | AWS Config | The configuration history of your resources and rules that flag noncompliant ones |
| Collecting audit evidence | AWS Audit Manager | Automatic evidence collection mapped to frameworks such as PCI DSS or HIPAA |
| Access reporting | IAM credential report and last accessed information | Which users have which credentials, and which permissions are unused |

AWS Audit Manager is no longer open to new customers, although existing customers can keep using it.

## Where the logs live

- **CloudTrail event history** keeps the last 90 days of management events in each Region, free and searchable.
- A **CloudTrail trail** delivers events to an **Amazon S3 bucket** for long-term storage, with optional delivery to **CloudWatch Logs**.
- **CloudWatch Logs** stores logs from AWS services and your own applications.
- **AWS Config** writes configuration history to an S3 bucket.

## How the exam asks about it

> [!EXAM] "Download a SOC or PCI report" means AWS Artifact. "Track API calls" means CloudTrail. "Resource configuration history" or "compliant with our rules" means AWS Config. "Performance metrics and alarms" means CloudWatch. "Vulnerabilities on EC2" means Inspector. "Malicious activity or compromised credentials" means GuardDuty. "DDoS" means Shield. "Manage encryption keys" means KMS.

Common traps:

- **CloudTrail versus Config**: CloudTrail records actions; Config records the state of resources over time.
- **CloudTrail versus CloudWatch**: CloudTrail is for auditing who did what; CloudWatch is for performance and operational monitoring.
- **Inspector versus GuardDuty**: Inspector finds weaknesses before they are exploited; GuardDuty spots suspicious activity as it happens.

## Check yourself

1. Where do you download AWS compliance reports such as SOC reports? **AWS Artifact.**
2. Which service records the API calls made in your account? **AWS CloudTrail.**
3. Which service shows how a resource was configured in the past? **AWS Config.**
4. Which service scans EC2 instances for software vulnerabilities? **Amazon Inspector.**
5. Which service lets you create and control encryption keys? **AWS KMS.**
`,
};
