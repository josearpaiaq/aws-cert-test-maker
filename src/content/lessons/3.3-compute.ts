import type { Lesson } from '@/content/lesson';

export const compute: Lesson = {
  taskStatement: '3.3',
  title: 'AWS compute services',
  summary:
    'EC2 instance types, containers, serverless compute, and how Auto Scaling and load balancers keep applications elastic.',
  draft: true,
  sources: [
    {
      title: 'Amazon EC2 instance types',
      url: 'https://aws.amazon.com/ec2/instance-types/',
    },
    {
      title: 'What is Amazon Elastic Container Service?',
      url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html',
    },
    {
      title: 'What is AWS Lambda?',
      url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',
    },
    {
      title: 'What is Amazon EC2 Auto Scaling?',
      url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html',
    },
    {
      title: 'What is Elastic Load Balancing?',
      url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html',
    },
  ],
  body: `
## Choosing how much you manage

AWS compute options range from virtual servers you fully control to code that runs with no servers in view. The less you manage, the more AWS handles.

| Option | Services | You manage |
|---|---|---|
| Virtual servers | Amazon EC2, Amazon Lightsail | The operating system, software, patching and scaling setup |
| Containers on servers | Amazon ECS or Amazon EKS on EC2 | Your containers and the EC2 instances they run on |
| Serverless containers | AWS Fargate with ECS or EKS | Only your containers, their CPU and memory, and permissions |
| Serverless functions | AWS Lambda | Only your code and its configuration |

## Amazon EC2 instance types

An instance type sets the mix of CPU, memory, storage and networking. Types are grouped into families by strength.

| Family | Strength | Example uses |
|---|---|---|
| General purpose | A balance of compute, memory and networking | Web servers, code repositories, small and medium databases |
| Compute optimized | High-performance processors | Batch processing, media transcoding, dedicated game servers |
| Memory optimized | Fast processing of large data sets in memory | In-memory databases, data analytics |
| Storage optimized | Very high rates of low-latency reads and writes to local storage | High-throughput databases, data processing and streaming |
| Accelerated computing | Hardware accelerators such as GPUs | Graphics processing, floating-point calculations, data pattern matching |
| HPC optimized | Price performance for high performance computing at scale | Complex simulations, deep learning |

## Containers: Amazon ECS and Amazon EKS

A container packages an application with everything it needs to run anywhere.

- **Amazon ECS** is AWS's own fully managed container orchestration service. You do not manage a control plane.
- **Amazon EKS** is a managed **Kubernetes** service. AWS runs the Kubernetes control plane; choose it when you already use Kubernetes or its tools.

Both can run containers on EC2 instances you manage, or on **AWS Fargate**.

## Serverless compute: Fargate and Lambda

- **AWS Fargate** runs containers without servers to manage. You do not pick instance types or scale a cluster; you set CPU and memory per task or pod and pay as you go.
- **AWS Lambda** runs your code in response to events, such as a file arriving in S3 or a request through API Gateway. AWS handles servers, patching, capacity and scaling, and you pay only for what you use. Lambda suits short, event-driven work: a single invocation can run for at most 15 minutes.

## Elasticity: Auto Scaling and load balancers

**Amazon EC2 Auto Scaling** keeps the right number of instances running in an **Auto Scaling group**. You set a minimum, a maximum and a desired capacity, and scaling policies add instances when demand rises and remove them when it falls. It also replaces unhealthy instances and can spread instances across Availability Zones. This is **elasticity**: capacity follows demand, so you avoid paying for idle servers.

**Elastic Load Balancing** spreads incoming traffic across targets such as EC2 instances, containers and IP addresses in one or more Availability Zones. It checks the health of each target and sends traffic only to healthy ones. Used with Auto Scaling, new instances are registered with the load balancer automatically.

## Simpler options

- **Amazon Lightsail** is the easiest way to start: virtual servers, databases and load balancers bundled for a low, predictable monthly price. Good for simple websites and small projects.
- **AWS Elastic Beanstalk** takes your application code and sets up the servers, load balancing, scaling and health monitoring for you. There is no extra charge for Beanstalk itself; you pay for the resources it creates.

## How the exam asks about it

> [!EXAM] Match the keywords: "run code in response to events without servers" means Lambda; "containers without managing servers" means Fargate; "Kubernetes" means EKS; "match capacity to demand" means Auto Scaling; "distribute traffic across instances" means Elastic Load Balancing; "upload code and AWS handles the infrastructure" means Elastic Beanstalk; "simple, fixed monthly price" means Lightsail.

Common traps:

- **Auto Scaling and load balancing are different jobs.** One changes how many instances you have; the other decides which instance gets each request.
- **Fargate is not a separate orchestrator.** It is the serverless way to run ECS or EKS workloads.
- **Long-running jobs do not fit Lambda.** Use EC2 or containers.

## Check yourself

1. Which EC2 family fits a large in-memory database? **Memory optimized.**
2. A team wants to run containers without managing any EC2 instances. **AWS Fargate.**
3. Which service adds instances during a traffic spike and removes them afterwards? **Amazon EC2 Auto Scaling.**
4. Which service sends each request only to healthy instances across Availability Zones? **Elastic Load Balancing.**
`,
};
