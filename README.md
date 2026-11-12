# CloudPrep

An offline-first iOS and Android quiz app for studying for the **AWS Certified Cloud Practitioner (CLF-C02)** exam, built with React Native and Expo.

> **Status:** phase 5 (mock exam) done; spaced repetition and progress are next. The build plan lives in [`docs/cloudprep-agent-build-prompt.md`](docs/cloudprep-agent-build-prompt.md). This README will grow with each phase.

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

- **Exam config** (`src/data/exams/clf-c02.ts`) — question counts, scoring scale, domain weights and task statements, taken from the official exam guide. Nothing exam-specific is hard-coded in components.
- **Question bank** (`assets/questions/clf-c02.json`) — bundled JSON validated with a Zod schema (`src/data/question-schema.ts`) that also enforces the exam guide's rules: single-answer questions have 4 options and 1 correct answer; multiple-response questions have 5 or more options, 2 or more correct answers, and a prompt that states how many to pick. Adding a second certification means adding another config and JSON file.
- **Database** (`src/db`) — SQLite tables (`answers`, `review_schedule`, `exam_attempts`, `settings`) created by versioned migrations tracked with `PRAGMA user_version`, behind a typed repository. The repository depends on a small `Database` interface that expo-sqlite satisfies, so unit tests run the same SQL against Node's built-in SQLite.
- **Business logic** (`src/logic`) — pure, unit-tested functions with no React or database imports: scoring (all-or-nothing for multiple-response), weighted exam assembly (largest-remainder allocation, 16/19/22/8 for 65 questions), the SM-2 spaced-repetition scheduler, and per-domain readiness (80% over the last 50 answers in every domain).

## Running locally

Requires Node 22.13+ and a development build (the app does not run in Expo Go).

```bash
npm install

# Build and install the development client on a physical device (once, and after native dependency changes)
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android   # or ios

# Start the dev server and open the app on the device
npx expo start
```

To use a simulator or emulator instead: `npx expo run:ios` or `npx expo run:android`.

Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`.

`npm run validate:questions` validates the bundled question bank against the schema. It runs automatically before `npm run android` / `npm run ios` and on EAS builds, so an invalid question file fails the build.

## Roadmap

- [x] 1. Scaffold — Expo Router tabs (Study, Exam, Progress), lint, strict TS, NativeWind, EAS dev build
- [x] 2. Data layer — Zod schema, domain config, 40 draft seed questions, SQLite migrations, repository
- [x] 3. Core logic — scoring, exam assembly, spaced repetition, readiness
- [x] 4. Practice mode
- [x] 5. Mock exam
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
