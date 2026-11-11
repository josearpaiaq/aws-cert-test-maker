# CloudPrep

An offline-first iOS and Android quiz app for studying for the **AWS Certified Cloud Practitioner (CLF-C02)** exam, built with React Native and Expo.

> **Status:** pre-scaffold. The build plan lives in [`docs/cloudprep-agent-build-prompt.md`](docs/cloudprep-agent-build-prompt.md). This README will grow with each phase.

## Why this project

CloudPrep has two goals of equal weight:

1. **Help pass the exam** — practice by domain, realistic mock exams, and spaced repetition focused on weak areas.
2. **Show real React Native skill** — it should feel native on both platforms, not like a web page in a wrapper.

## Features (v1)

| Feature | What it does |
| --- | --- |
| Practice mode | Pick a domain or "weakest areas"; immediate feedback and explanation after each answer, swipe to the next card |
| Mock exam | 65 questions weighted by domain, 90-minute timer that survives backgrounding, flag for review, results by domain |
| Spaced repetition | Missed and low-confidence questions return on a schedule ("Due today" queue) |
| Progress stats | Accuracy per domain over time, mock-exam history, streak, and a "ready to book?" indicator |
| Daily reminder | Local notification at a chosen time that deep-links into practice |

Everything works fully offline. There are no accounts, no backend and no cloud sync in v1.

## Exam model

| Domain | Weight | Mock-exam questions (of 65) |
| --- | --- | --- |
| 1. Cloud Concepts | 24% | 16 |
| 2. Security and Compliance | 30% | 19 |
| 3. Cloud Technology and Services | 34% | 22 |
| 4. Billing, Pricing, and Support | 12% | 8 |

Weights live in a config file so they can be updated if AWS revises the exam. Source: [official CLF-C02 exam guide](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html).

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Expo (latest stable SDK) + TypeScript (strict), New Architecture |
| Navigation | Expo Router (tabs + stacks, typed routes) |
| Local data | expo-sqlite |
| UI state | Zustand (in-progress quiz session only) |
| Styling | NativeWind, dark mode from day one |
| Lists | @shopify/flash-list |
| Motion | react-native-reanimated + react-native-gesture-handler |
| Feedback | expo-haptics |
| Reminders | expo-notifications (local only) |
| Tests | Jest + React Native Testing Library, Maestro for end-to-end |
| Builds | EAS Build + EAS Submit (development builds, not Expo Go) |

## Architecture

_To be documented as it is built._ Planned outline:

- **Question bank** — bundled JSON (`assets/questions/clf-c02.json`) validated at build time with a Zod schema. Adding a second certification means dropping in another JSON file and config.
- **Data layer** — SQLite tables (`answers`, `review_schedule`, `exam_attempts`, `settings`) with versioned migrations behind a typed repository module.
- **Business logic** — scoring, weighted exam assembly, spaced-repetition scheduling and readiness are pure, unit-tested functions, separate from components.

## Running locally

_Coming in phase 1 (scaffold)._

## Roadmap

- [ ] 1. Scaffold — Expo Router tabs (Study, Exam, Progress), lint, strict TS, NativeWind, EAS dev build
- [ ] 2. Data layer — Zod schema, domain config, 40 draft seed questions, SQLite migrations, repository
- [ ] 3. Core logic — scoring, exam assembly, spaced repetition, readiness
- [ ] 4. Practice mode
- [ ] 5. Mock exam
- [ ] 6. Spaced repetition and progress
- [ ] 7. Reminders and settings
- [ ] 8. Quality pass — accessibility, empty/error states, Maestro e2e
- [ ] 9. Ship — TestFlight and Google Play internal testing

## React Native vs Ionic/Capacitor

_Measured on real devices once the app is built: cold start, scroll performance on a 500-question list, and swipe-gesture feel._

## Question content

All questions are original or explicitly approved. Nothing is scraped, copied or paraphrased from paid practice exams, exam dumps or third-party question banks.

## Known limitations

_To be listed before release._
