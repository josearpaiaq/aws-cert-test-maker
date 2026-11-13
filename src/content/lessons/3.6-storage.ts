import type { Lesson } from '@/content/lesson';

export const storage: Lesson = {
  taskStatement: '3.6',
  title: 'AWS storage services',
  summary:
    'Block, file and object storage, the S3 storage classes, and how to move data between them.',
  draft: true,
  sources: [
    {
      title: 'What is Amazon Elastic Block Store?',
      url: 'https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html',
    },
    {
      title: 'What is Amazon Elastic File System?',
      url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html',
    },
    {
      title: 'Understanding and managing Amazon S3 storage classes',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html',
    },
    {
      title: 'Managing the lifecycle of objects',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html',
    },
    {
      title: 'What is Amazon S3 File Gateway?',
      url: 'https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html',
    },
  ],
  body: `
## Three kinds of storage

Most storage questions start by deciding which **kind** of storage fits the need.

| Kind | AWS service | How it is used | Typical use |
|---|---|---|---|
| Block | Amazon EBS | A volume attached to an EC2 instance, like a hard drive | Boot volumes, databases running on EC2 |
| File | Amazon EFS, Amazon FSx | A shared file system that many servers mount at the same time | Shared content, home directories, Windows file shares |
| Object | Amazon S3 | Objects stored in buckets and accessed over HTTP or an API | Backups, data lakes, static websites, media |

## Block storage: EBS and instance store

**Amazon EBS** volumes are durable block storage. A volume lives independently of the instance: stop the instance and the data is still there. Snapshots back volumes up to S3.

**Instance store** is temporary block storage on disks physically attached to the host. It is fast, but its data is **lost when the instance stops or terminates**.

> [!EXAM] "Data must survive the instance stopping" means EBS, never instance store.

## File storage: EFS and FSx

- **Amazon EFS** is a managed file system for Linux workloads (NFS). It grows and shrinks automatically and many instances can use it at once.
- **Amazon FSx** offers fully managed third-party file systems, such as **FSx for Windows File Server** (SMB shares for Windows) and **FSx for Lustre** (high-performance computing).

## Object storage: Amazon S3

S3 stores any amount of data as objects in buckets. It is designed for 99.999999999% (eleven nines) durability. You choose a **storage class** per object to balance cost against how quickly and how often you need the data.

| Storage class | Use it when | Getting data back |
|---|---|---|
| S3 Standard | Data is accessed often | Milliseconds |
| S3 Intelligent-Tiering | Access patterns are unknown or change | Milliseconds for frequent and infrequent tiers |
| S3 Standard-IA | Data is accessed rarely but must be available instantly | Milliseconds, with a retrieval fee |
| S3 One Zone-IA | Like Standard-IA, for data you can recreate, stored in one Availability Zone | Milliseconds, with a retrieval fee |
| S3 Glacier Instant Retrieval | Archives that are rarely read but need instant access | Milliseconds |
| S3 Glacier Flexible Retrieval | Archives where waiting minutes to hours is fine | Minutes to hours |
| S3 Glacier Deep Archive | Long-term archives, such as compliance records kept for years | Hours; the lowest storage cost |

> [!TIP] Going down the table, storage gets cheaper and retrieval gets slower or more expensive. One Zone-IA is the only class that keeps data in a single Availability Zone.

## Moving data automatically: lifecycle rules

An **S3 Lifecycle configuration** moves objects to cheaper classes as they age, or deletes them when they are no longer needed. For example:

{{diagram:s3-lifecycle}}

Use **S3 Intelligent-Tiering** instead when you cannot predict how data will be accessed: it moves objects between tiers for you.

## Hybrid storage and backups

- **AWS Storage Gateway** lets on-premises applications use cloud storage, keeping frequently used data in a local cache.
- **AWS Backup** centralizes and automates backups across services such as EBS, EFS, RDS and DynamoDB.

## How the exam asks about it

> [!EXAM] Match the keywords: "one instance, block storage" is EBS; "shared file system for Linux" is EFS; "Windows file shares" is FSx for Windows File Server; "unknown access pattern" is S3 Intelligent-Tiering; "rarely accessed, hours are fine, lowest cost" is S3 Glacier Deep Archive.

## Check yourself

1. An application needs a shared file system for many Linux instances. **Amazon EFS.**
2. Data on which storage is lost when an instance stops? **Instance store.**
3. Which S3 class suits data with an unpredictable access pattern? **S3 Intelligent-Tiering.**
4. How do you move objects to a cheaper class after 30 days automatically? **An S3 Lifecycle rule.**
`,
};
