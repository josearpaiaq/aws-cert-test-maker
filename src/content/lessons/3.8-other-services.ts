import type { Lesson } from '@/content/lesson';

export const otherServices: Lesson = {
  taskStatement: '3.8',
  title: 'Other in-scope AWS services',
  summary:
    'Messaging, business apps, customer engagement, developer tools, virtual desktops, frontend and IoT services, matched to the job each one does.',
  draft: true,
  sources: [
    {
      title: 'What is Amazon Simple Queue Service?',
      url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
    },
    {
      title: 'What is AWS Cloud9?',
      url: 'https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html',
    },
    {
      title: 'AWS CodeCommit User Guide document history',
      url: 'https://docs.aws.amazon.com/codecommit/latest/userguide/history.html',
    },
    {
      title: 'Services in Full Shutdown',
      url: 'https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html',
    },
    {
      title: 'What Is Amazon WorkSpaces Applications?',
      url: 'https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html',
    },
  ],
  body: `
## Many categories, one skill

The exam asks you to pick the service that does a given job, so learn one line per service.

## Application integration: messages and alerts

| Service | Pattern | Use it when |
|---|---|---|
| Amazon SNS | Publish/subscribe: one message is pushed to many subscribers | Alerts by email, SMS, mobile push, or fan-out to other services |
| Amazon SQS | A queue: messages wait until a consumer picks them up | Decoupling components so a slow part does not lose work |
| Amazon EventBridge | An event bus that routes events by rules | Reacting to events from AWS services, your apps or third parties, and running scheduled tasks |

> [!TIP] SNS **pushes** to many; SQS **holds** messages until someone pulls them.

## Business applications

- **Amazon Connect** is a cloud contact center: phone, chat and routing to customer service agents. It is now called **Amazon Connect Customer**.
- **Amazon SES** (Simple Email Service) sends and receives email at scale, such as order confirmations and newsletters.

## Customer engagement and support

| Service | What it gives you |
|---|---|
| AWS Activate | Programs for startups, including AWS credits and resources |
| AWS IQ | Was a marketplace for hiring AWS Certified freelancers and consulting firms |
| AWS Managed Services (AMS) | AWS operates your infrastructure for you: monitoring, patching, backups and changes |
| AWS Support | Plans that give access to AWS experts and support cases |

> [!NOTE] AWS IQ is closed: it reached end of support on May 20, 2026. AMS Advanced ends support on June 30, 2027. Several AWS Support plans are being replaced on January 1, 2027.

## Developer tools

| Service | Job |
|---|---|
| AWS CodeCommit | Private, managed Git repositories |
| AWS CodeBuild | Compiles code, runs tests and produces build artifacts |
| AWS CodeDeploy | Automates deployments to EC2, on-premises servers, Lambda and ECS |
| AWS CodePipeline | Orchestrates the release steps (source, build, test, deploy) as a CI/CD pipeline |
| AWS CodeArtifact | Stores and shares software packages for tools such as npm, Maven and pip |
| AWS CodeStar | Was a quick-start for whole development projects |
| AWS Cloud9 | A browser-based IDE for writing, running and debugging code |
| AWS CloudShell | A browser-based shell, already signed in, launched from the console |
| AWS AppConfig | Changes feature flags and configuration in production without redeploying |
| AWS X-Ray | Traces requests through an application to find errors and bottlenecks |

> [!NOTE] Status changes: AWS CodeStar was shut down on July 25, 2024. AWS Cloud9 is no longer available to new customers. AWS CodeCommit closed to new customers in July 2024 but reopened to them in November 2025.

## End-user computing

- **Amazon WorkSpaces** provides persistent virtual desktops (Windows or Linux) that users reach from their own devices.
- **Amazon AppStream 2.0** streams individual desktop applications to a browser or client; now named **Amazon WorkSpaces Applications**.
- **Amazon WorkSpaces Web** gives a secure, streamed browser for internal websites and SaaS apps; now named **Amazon WorkSpaces Secure Browser**.

## Frontend web and mobile

- **AWS Amplify** builds, deploys and hosts full-stack web and mobile apps, with Git-based continuous deployment.
- **AWS AppSync** creates serverless GraphQL and pub/sub APIs, including real-time updates.

## Internet of Things

- **AWS IoT Core** connects devices to the cloud, using protocols such as MQTT.
- **AWS IoT Greengrass** runs software on the devices themselves so they can act on data locally.

## How the exam asks about it

> [!EXAM] Match the keywords: "notify many subscribers" or "send an SMS alert" is SNS; "decouple with a queue" is SQS; "route events" or "schedule" is EventBridge; "contact center" is Connect; "send marketing email" is SES; "AWS runs operations for us" is AMS; "compile and test" is CodeBuild; "automate deployments" is CodeDeploy; "CI/CD pipeline" is CodePipeline; "trace requests" is X-Ray; "virtual desktop" is WorkSpaces; "stream one application" is AppStream 2.0; "host a web app" is Amplify; "GraphQL" is AppSync; "process IoT data on the device" is Greengrass.

Common traps:

- **SNS vs SES**: SNS sends notifications to many channels; SES is for full email.
- **WorkSpaces vs AppStream 2.0**: a whole desktop versus single applications.

## Check yourself

1. Which service queues orders so a slow back end does not lose them? **Amazon SQS.**
2. Which service builds a cloud contact center? **Amazon Connect.**
3. Which service finds which microservice is slowing requests down? **AWS X-Ray.**
4. Which service gives each employee a persistent cloud desktop? **Amazon WorkSpaces.**
5. Which service runs code on IoT devices so they can act on their data locally? **AWS IoT Greengrass.**
`,
};
