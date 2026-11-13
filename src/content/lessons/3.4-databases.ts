import type { Lesson } from '@/content/lesson';

export const databases: Lesson = {
  taskStatement: '3.4',
  title: 'AWS database services',
  summary:
    'Managed versus self-managed databases, relational, NoSQL and in-memory options, and the tools for migrating databases to AWS.',
  draft: true,
  sources: [
    {
      title: 'What is Amazon Relational Database Service (Amazon RDS)?',
      url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html',
    },
    {
      title: 'What is Amazon Aurora?',
      url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html',
    },
    {
      title: 'What is Amazon DynamoDB?',
      url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html',
    },
    {
      title: 'What is MemoryDB',
      url: 'https://docs.aws.amazon.com/memorydb/latest/devguide/what-is-memorydb.html',
    },
    {
      title: 'What is AWS Database Migration Service?',
      url: 'https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html',
    },
  ],
  body: `
## Self-managed or managed

You can install a database yourself on Amazon EC2, or use a managed service where AWS does the routine work.

| Task | Database on EC2 | Managed service such as Amazon RDS |
|---|---|---|
| Hardware, power, network and cooling | AWS | AWS |
| Operating system install and patching | You | AWS |
| Database software install and patching | You | AWS |
| Backups, high availability and scaling | You | AWS |
| Schema design, queries and tuning | You | You |

**Choose a managed service** by default: less operational work and fewer chances to break something during an upgrade. **Choose EC2** only when you need full control, such as access to the operating system or a database engine or setting the managed service does not offer.

## Relational databases: Amazon RDS and Amazon Aurora

Relational databases store data in tables with a fixed schema, queried with SQL, for structured data such as orders and customers.

- **Amazon RDS** runs familiar engines for you: IBM Db2, MariaDB, Microsoft SQL Server, MySQL, Oracle Database and PostgreSQL. It handles backups, patching, failure detection and recovery. **Multi-AZ** deployments keep a standby copy in another Availability Zone for failover, and **read replicas** add capacity for reads.
- **Amazon Aurora** is AWS's own relational engine, compatible with **MySQL and PostgreSQL**, and managed through RDS. Its storage grows automatically, and it automates clustering and replication. Pick it when you want more throughput than the standard engines on similar hardware while keeping MySQL or PostgreSQL compatibility.

## NoSQL: Amazon DynamoDB

**Amazon DynamoDB** is a serverless, fully managed NoSQL database for **key-value and document** data. There are no servers to provision or patch and no maintenance windows. It delivers single-digit millisecond performance at any scale and, by default, replicates data across three Availability Zones. **Global tables** copy a table to several Regions, so each can read and write locally.

DynamoDB does not support SQL joins, so it suits workloads with known access patterns and very high scale, such as shopping carts, game state and user profiles.

## In-memory databases

| Service | What it is | Use it for |
|---|---|---|
| Amazon ElastiCache | A managed in-memory cache, compatible with Valkey, Memcached and Redis OSS, with a serverless option | Caching frequent database queries, session data, reducing load on a database |
| Amazon MemoryDB | A durable in-memory database, compatible with Valkey and Redis OSS, that stores data across multiple Availability Zones | A very fast primary database, without managing a separate cache and database |

## Data warehousing: Amazon Redshift

**Amazon Redshift** is a fully managed, petabyte-scale data warehouse for analytics with SQL. Use it for reporting and business intelligence across large amounts of historical data, not for everyday transactions.

## Migrating databases: AWS DMS and AWS SCT

- **AWS Database Migration Service (AWS DMS)** moves data into AWS, or between cloud and on-premises systems. It can do a **one-time migration** or **replicate ongoing changes** to keep the source and target in sync while you cut over. It supports both same-engine and different-engine migrations.
- **AWS Schema Conversion Tool (AWS SCT)** converts a database schema and code from one engine to another, for example from Oracle to Aurora PostgreSQL, or from a data warehouse to Redshift. **DMS Schema Conversion** offers the same kind of conversion inside DMS.

> [!TIP] Same engine to same engine: DMS alone. Different engines: convert the schema first with SCT or DMS Schema Conversion, then move the data with DMS.

## How the exam asks about it

> [!EXAM] Match the keywords: "relational, managed, MySQL or Oracle" means RDS; "MySQL or PostgreSQL compatible, high performance" means Aurora; "NoSQL, key-value, serverless, any scale" means DynamoDB; "cache to speed up reads" means ElastiCache; "durable in-memory primary database" means MemoryDB; "data warehouse" or "analytics" means Redshift; "migrate a database" means DMS; "convert a schema to a different engine" means SCT.

Common traps:

- **Patching the database engine on RDS is AWS's job.** On EC2 it is yours.
- **DynamoDB is not relational.** If the question needs SQL joins, think RDS or Aurora.
- **DMS moves data; SCT converts schemas.** Different-engine migrations usually need both.

## Check yourself

1. A company wants a managed PostgreSQL database without patching the operating system. **Amazon RDS or Amazon Aurora.**
2. Which service is a serverless key-value database? **Amazon DynamoDB.**
3. Which service adds a cache in front of a database to speed up reads? **Amazon ElastiCache.**
4. Which tool converts an Oracle schema for use on Aurora PostgreSQL? **AWS Schema Conversion Tool (AWS SCT).**
5. When might you run a database on EC2 instead of RDS? **When you need control of the operating system or an engine or setting RDS does not support.**
`,
};
