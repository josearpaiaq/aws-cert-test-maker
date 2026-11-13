import type { Lesson } from '@/content/lesson';

export const accessManagement: Lesson = {
  taskStatement: '2.3',
  title: 'AWS access management',
  summary:
    'IAM users, groups, roles and policies, least privilege, protecting the root user, and federated sign-in.',
  draft: true,
  sources: [
    {
      title: 'Security best practices in IAM',
      url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
    },
    {
      title: 'AWS account root user',
      url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html',
    },
    {
      title: 'Root user best practices for your AWS account',
      url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html',
    },
    {
      title: 'What is IAM Identity Center?',
      url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html',
    },
    {
      title: 'What is AWS Secrets Manager?',
      url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html',
    },
  ],
  body: `
## IAM in one paragraph

**AWS Identity and Access Management (IAM)** controls who can sign in to your AWS account (authentication) and what they are allowed to do (authorization).

| Identity | What it is | Credentials |
|---|---|---|
| Root user | The identity created with the account, with complete access to everything | Email address and password |
| IAM user | One person or application | Long-term: a password and/or access keys |
| IAM user group | A collection of users that share permissions; groups cannot contain other groups | None of its own |
| IAM role | A set of permissions that a person, service or another account assumes when needed | Temporary credentials |

## Least privilege and policies

The **principle of least privilege** means granting only the permissions a task needs. Permissions are written in **policies**:

- **AWS managed policies** are created and maintained by AWS for common use cases. They are a quick start but may grant more than you need.
- **Customer managed policies** are ones you write and can change. Use them to tighten permissions toward least privilege.
- **Inline policies** are embedded in a single user, group or role and are deleted with it.

> [!TIP] Attach policies to groups, not to individual users. When someone changes jobs, move them to another group.

IAM Access Analyzer and last accessed information help you find and remove unused permissions.

## The root user

The root user can do anything, so use it only for the few tasks that require it, such as:

- Change the account's root email address or root password, or close the account (for standalone accounts not in AWS Organizations)
- Restore permissions when the only IAM administrator has locked themselves out
- Activate IAM access to the Billing and Cost Management console
- Register as a seller in the Reserved Instance Marketplace
- Turn on MFA delete for an S3 bucket
- Sign up for AWS GovCloud (US)

How to protect it:

1. Turn on **MFA**, ideally with more than one device registered.
2. **Do not create access keys** for the root user.
3. Use a strong, unique password and a group email address owned by the business.
4. Create an administrative user for daily work instead of signing in as root.
5. Monitor and alert on root user sign-ins.

## Credentials and how to store them

- **Access keys** are long-term credentials for the CLI and SDKs. Prefer temporary credentials from roles; if you must use access keys, rotate them.
- A **password policy** sets rules for IAM user passwords, such as minimum length, character types, expiration and no reuse. It does not apply to the root user.
- **AWS Secrets Manager** stores secrets such as database passwords and API keys, and can **rotate them automatically**. Applications fetch the secret at run time instead of hard-coding it.
- **AWS Systems Manager Parameter Store** stores configuration values, optionally encrypted with KMS, but without automatic rotation.

## Ways to authenticate

- **MFA** adds a second factor, such as a security key or an authenticator app, on top of the password.
- **AWS IAM Identity Center** (formerly AWS Single Sign-On) is the recommended way to give your workforce access to multiple AWS accounts and applications. Users sign in once through the AWS access portal, with users created in Identity Center or from an existing identity provider.
- **Cross-account IAM roles** let users in one account assume a role in another account and receive temporary credentials, without separate users in each account.

## Types of identity management

**Federation** means users sign in with an identity managed outside AWS, such as a corporate directory, and receive temporary AWS credentials. IAM supports identity providers that use **SAML 2.0** or **OpenID Connect (OIDC)**, and AWS recommends federation over IAM users for people. For users of your own mobile or web apps, **Amazon Cognito** handles sign-in, including through social identity providers.

## How the exam asks about it

> [!EXAM] "Single sign-on across many accounts" means IAM Identity Center. "Rotate database credentials automatically" means Secrets Manager. "Temporary access from another account" means a cross-account IAM role. "Sign in with the corporate directory" means federation. "Only the permissions needed" means least privilege.

Common traps:

- **Root user for daily work**: always wrong. Use it only for root-only tasks.
- **Sharing credentials**: never share or embed access keys; give each person their own identity or use roles.

## Check yourself

1. Which identity should have no access keys and MFA turned on? **The root user.**
2. Which service rotates database passwords automatically? **AWS Secrets Manager.**
3. What gives temporary access to resources in another AWS account? **A cross-account IAM role.**
4. Which service provides single sign-on to multiple AWS accounts? **AWS IAM Identity Center.**
`,
};
