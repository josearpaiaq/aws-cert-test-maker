import type { Lesson } from '@/content/lesson';

export const aiMlAnalytics: Lesson = {
  taskStatement: '3.7',
  title: 'AWS AI/ML and analytics services',
  summary:
    'Which AI service handles speech, text, images, chatbots or custom models, and which analytics service queries, streams, prepares or visualizes data.',
  draft: true,
  sources: [
    {
      title: 'What is Amazon SageMaker AI?',
      url: 'https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html',
    },
    {
      title: 'What is Amazon Lex V2?',
      url: 'https://docs.aws.amazon.com/lexv2/latest/dg/what-is.html',
    },
    {
      title: 'What is Amazon Kendra?',
      url: 'https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html',
    },
    {
      title: 'What is Amazon Athena?',
      url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html',
    },
    {
      title: 'What is AWS Glue?',
      url: 'https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html',
    },
  ],
  body: `
## Two families of services

This task statement covers two groups. **AI/ML services** add intelligence to applications, either through a ready-made API or by building your own models. **Analytics services** collect, prepare, query and visualize data.

## Build your own models: Amazon SageMaker AI

**Amazon SageMaker AI** is the fully managed platform for building, training and deploying your own machine learning models. Choose it when a question talks about data scientists, training a custom model, or hosting a model in production.

> [!NOTE] On December 3, 2024 Amazon SageMaker was renamed **Amazon SageMaker AI**. The name "Amazon SageMaker" now refers to a wider platform for data, analytics and AI. The exam guide still says SageMaker.

## Ready-made AI services

These need no machine learning expertise: you call an API.

| Service | Task it accomplishes |
|---|---|
| Amazon Lex | Builds chatbots and conversational interfaces using voice and text |
| Amazon Kendra | Intelligent search across your documents, understanding natural-language questions |
| Amazon Polly | Text to speech: turns text into lifelike spoken audio |
| Amazon Transcribe | Speech to text: turns audio into a transcript, in real time or in batches |
| Amazon Translate | Translates text between languages |
| Amazon Comprehend | Natural language processing: finds sentiment, entities, key phrases, language and personal data in text |
| Amazon Rekognition | Analyzes images and video: objects, text, faces and unsafe content |
| Amazon Bedrock | Gives access to foundation models from many AI companies to build generative AI applications |

> [!NOTE] Amazon Kendra is no longer open to new customers; AWS points to Amazon Bedrock Knowledge Bases for similar needs.

> [!TIP] Polly and Transcribe are opposites: **P**olly **p**roduces speech, Transcribe writes it down.

## Analytics services

| Service | Use it to |
|---|---|
| Amazon Athena | Run standard SQL queries directly on data in Amazon S3. Serverless: you pay for the queries you run |
| Amazon Kinesis | Collect and process streaming data, such as logs or clickstreams, in real time |
| AWS Glue | Discover, prepare and move data with serverless ETL (extract, transform, load), and keep a central Data Catalog |
| Amazon QuickSight | Build interactive dashboards and business intelligence (BI) visualizations |
| Amazon EMR | Run big data frameworks such as Apache Hadoop and Apache Spark on managed clusters |
| Amazon Redshift | A fully managed, petabyte-scale data warehouse queried with SQL, with a serverless option |

> [!NOTE] Amazon QuickSight now lives on as **AWS Quick Sight**, a feature of the AI-powered service AWS Quick. Its BI dashboards work as before.

A typical flow: **Kinesis** brings data in, **Glue** cleans and catalogs it in S3, **Athena** or **Redshift** queries it, and **QuickSight** shows the results.

## How the exam asks about it

> [!EXAM] Match the keywords: "build, train and deploy custom models" is SageMaker; "chatbot" is Lex; "search documents with natural-language questions" is Kendra; "text to speech" is Polly; "speech to text" or "call transcripts" is Transcribe; "sentiment of customer reviews" is Comprehend; "detect faces or objects in images" is Rekognition; "generative AI with foundation models" is Bedrock; "SQL on files in S3, no servers" is Athena; "real-time streaming data" is Kinesis; "ETL" or "data catalog" is Glue; "dashboards" is QuickSight; "Hadoop or Spark" is EMR; "data warehouse" is Redshift.

Common traps:

- **Comprehend vs Translate**: Comprehend understands what text means; Translate only changes its language.
- **Athena vs Redshift**: Athena queries files where they sit in S3 with nothing to set up; Redshift is a data warehouse you load data into.
- **Lex vs Polly**: Lex holds a conversation; Polly only speaks text aloud.

## Check yourself

1. Which service finds whether customer reviews are positive or negative? **Amazon Comprehend.**
2. Which service creates audio narration from written articles? **Amazon Polly.**
3. Which service runs SQL queries on data in S3 without managing any servers? **Amazon Athena.**
4. Which service do data scientists use to train and deploy their own models? **Amazon SageMaker AI.**
5. Which service ingests clickstream data in real time? **Amazon Kinesis.**
`,
};
