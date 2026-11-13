import type { Lesson } from '@/content/lesson';

export const billingAndCostManagement: Lesson = {
  taskStatement: '4.2',
  title: 'Billing, budgets and cost management',
  summary:
    'Estimate costs before you build, track and alert on spend, consolidate bills and tag costs to teams.',
  draft: true,
  sources: [
    {
      title: 'What is AWS Pricing Calculator?',
      url: 'https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html',
    },
    {
      title: 'Analyzing your costs and usage with AWS Cost Explorer',
      url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html',
    },
    {
      title: 'Managing your costs with AWS Budgets',
      url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
    },
    {
      title: 'What is AWS Billing Conductor?',
      url: 'https://docs.aws.amazon.com/billingconductor/latest/userguide/what-is-billingconductor.html',
    },
    {
      title: 'Organizing and tracking costs using AWS cost allocation tags',
      url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html',
    },
  ],
  body: `
## Getting billing help and pricing information

- **Billing support is free for everyone.** Every AWS account owner can open an **Account and billing** case in the AWS Support Center, whatever their support plan. Only personalized technical support needs a paid plan.
- **Pricing information** lives on each service's pricing page. The principles: pay as you go, save when you commit, and pay less per unit as you use more.
- The **AWS Billing and Cost Management console** holds your bills, payments and the tools below.

## The cost management tools

Learn each tool by the question it answers.

| Tool | Question it answers | Key features |
|---|---|---|
| AWS Pricing Calculator | What will this cost before I build it? | Free web tool; estimates upfront, monthly and yearly costs; groups; share by link; export to CSV or PDF |
| AWS Cost Explorer | What have I spent, and where is it heading? | Charts filtered and grouped by service, account or tag; up to 13 months of history; forecasts up to 18 months; RI and Savings Plans recommendations |
| AWS Budgets | Tell me (or act) when spend crosses a limit | Cost, usage, RI and Savings Plans budgets; alerts on actual or forecasted amounts by email or Amazon SNS; budget actions |
| AWS Billing Conductor | How do I show custom rates to my customers or teams? | Billing groups, pricing rules, markups, discounts and custom charges in a separate pro forma view |
| AWS Data Exports | Give me the most detailed raw data | Recurring exports to Amazon S3, including the Cost and Usage Report (CUR 2.0) |

### AWS Budgets in more detail

- **Budget types**: cost, usage, RI utilization, RI coverage, Savings Plans utilization and Savings Plans coverage.
- **Actions** can respond automatically, for example by applying an IAM policy that stops anyone launching new resources.
- Budget data refreshes up to three times a day, so alerts can lag behind spend.

> [!TIP] Cost Explorer looks backward and a little forward; Budgets watches a threshold and alerts you; Pricing Calculator estimates for something that does not exist yet.

### AWS Billing Conductor

Billing Conductor is for **AWS Partners that resell AWS** and companies that **charge costs back** to internal teams. It creates a pro forma version of the costs at your own rates and does **not** change your AWS invoice.

## Consolidated billing with AWS Organizations

In an organization, the **management account** pays the charges of every **member account**. Consolidated billing gives you:

- **One bill** for all accounts
- **Easy tracking** of each account's charges
- **Combined usage**: usage across accounts adds up for volume pricing tiers, and Reserved Instance and Savings Plans discounts are shared
- **No extra fee**

## Cost allocation tags

A tag is a key and value on a resource, such as CostCenter = Marketing. **Cost allocation tags** let you split your bill by those values.

| Type | Who creates it | Example |
|---|---|---|
| AWS-generated | AWS (or an AWS Marketplace seller) | aws:createdBy, which records who created a resource |
| User-defined | You | CostCenter, Project, Owner |

- In billing reports, AWS-generated tags carry the **aws:** prefix and user-defined tags the **user:** prefix.
- Both types must be **activated** in the Billing and Cost Management console before they appear. Only the management account (or a standalone account) can activate them, and they can take up to 24 hours to show up.
- Once active, tags become **filters in Cost Explorer** and **columns in the cost allocation report** and the Cost and Usage Report, which cover both tagged and untagged costs.

## How the exam asks about it

> [!EXAM] "Estimate before migrating" is AWS Pricing Calculator. "Visualize past spending" or "forecast" is AWS Cost Explorer. "Alert when spend exceeds an amount" is AWS Budgets. "Custom rates for resold or chargeback billing" is AWS Billing Conductor. "Most detailed billing data, delivered to S3" is the Cost and Usage Report (Data Exports). "One bill for many accounts" is consolidated billing in AWS Organizations.

Common traps:

- **Tags do nothing for billing until activated.**
- **Budgets warn, they do not cap by default**: spending stops only with a budget action.

## Check yourself

1. Which tool estimates the cost of an architecture you have not built yet? **AWS Pricing Calculator.**
2. Which tool can email you when forecasted spend exceeds a set amount? **AWS Budgets.**
3. Which feature lets many accounts share volume discounts on one bill? **Consolidated billing in AWS Organizations.**
4. What must you do before a user-defined tag appears in billing reports? **Activate it as a cost allocation tag.**
5. Which tool lets a reseller bill its customers at custom rates? **AWS Billing Conductor.**
`,
};
