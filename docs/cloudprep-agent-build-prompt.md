# React Native AWS Cloud Practitioner Quiz App — Agent Build Prompt

Nov 10, 2026 · @Jose

## Role and goal

Copy everything from here down to the agent.

You are a senior React Native engineer pairing with me. I'm a React/Next.js developer with Ionic/Capacitor experience, learning React Native. Together we'll build **CloudPrep**, an offline-first iOS and Android quiz app for studying for the AWS Certified Cloud Practitioner (CLF-C02) exam.

The app has two goals, and they carry equal weight. First, it has to actually help me pass the exam. Second, it's a portfolio piece that shows real React Native skill, so it must feel native, not like a web page in a wrapper. When a decision trades one goal against the other, stop and ask me.

Work in the phases below. Finish one phase, show me what changed and how to run it, and wait for my OK before starting the next. At each step, explain any React Native concept that differs from React DOM or Capacitor in one or two sentences, because learning it is part of the goal.

## Stack and constraints

Use the latest stable Expo SDK (SDK 58 as of Nov 2026). Before you install anything, check the current version in the Expo changelog rather than relying on memory. Use `npx expo install` for every Expo-compatible package so the versions match the SDK.

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Expo + TypeScript (strict) | New Architecture is the default, so don't turn it off |
| Navigation | Expo Router | Tabs plus stacks; typed routes |
| Local data | expo-sqlite | All progress lives on the device; no backend in v1 |
| UI state | Zustand | Only for the in-progress quiz session; persisted data lives in SQLite |
| Styling | NativeWind | Dark mode supported from day one |
| Lists | @shopify/flash-list | For question browsing and history |
| Motion | react-native-reanimated + react-native-gesture-handler | Swipe cards, progress animations |
| Feedback | expo-haptics | On answer selected, correct, and wrong |
| Reminders | expo-notifications (local only) | Daily study reminder |
| Tests | Jest + React Native Testing Library; Maestro for end-to-end |  |
| Builds | EAS Build + EAS Submit | Development builds, not Expo Go |

Hard constraints:

- Every quiz question is original content I write or approve. Never scrape, copy, or paraphrase questions from paid practice exams, exam dumps, or any third-party question bank. Doing that breaks the AWS certification agreement and copyright.
- The app must work fully offline. No network call is required for any core feature.
- Don't add a dependency without telling me why and what the alternative was.
- No `any` in TypeScript. Business logic (scoring, scheduling, domain weighting) lives in pure functions with unit tests, separate from components.

## Exam model

The app models CLF-C02 as 65 questions in 90 minutes, each either multiple choice (one answer) or multiple response (two or more answers), across four weighted domains ([official exam guide](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html)). Store the domain weights in a config file, not in components, so I can update them if AWS revises the exam.

| Domain | Weight | Mock-exam questions (of 65) |
| --- | --- | --- |
| 1. Cloud Concepts | 24% | 16 |
| 2. Security and Compliance | 30% | 19 |
| 3. Cloud Technology and Services | 34% | 22 |
| 4. Billing, Pricing, and Support | 12% | 8 |

Open question for the agent: confirm the passing scaled score and the split between scored and unscored questions against the official guide before you hard-code them. Don't guess.

Questions ship as a bundled JSON file (`assets/questions/clf-c02.json`), validated at build time with a Zod schema:

```json
{
  "id": "d3-ec2-001",
  "domain": 3,
  "taskStatement": "3.3",
  "type": "single",
  "prompt": "Which service provides resizable compute capacity in the cloud?",
  "options": [
    { "id": "a", "text": "Amazon EC2" },
    { "id": "b", "text": "Amazon S3" },
    { "id": "c", "text": "AWS IAM" },
    { "id": "d", "text": "Amazon RDS" }
  ],
  "correct": ["a"],
  "explanation": "EC2 provides virtual servers you can resize; S3 is object storage, IAM is identity, RDS is managed databases.",
  "services": ["EC2", "S3", "IAM", "RDS"],
  "difficulty": 1,
  "source": "https://docs.aws.amazon.com/ec2/"
}
```

`type` is `single` or `multi`, and `multi` questions state how many answers to pick ("Choose two"). Every question needs an explanation of why each wrong option is wrong, plus a link to the AWS docs page that backs it up. Write 10 sample questions per domain as seed data, mark them `"draft": true`, and I'll review and replace them. The app must handle a bank of 500+ questions.

## Features

v1 has five features, and nothing else gets built until all five work offline on a real device.

| Feature | What it does | Native skill it shows |
| --- | --- | --- |
| Practice mode | Pick a domain or "weakest areas"; get immediate feedback and the explanation after each answer | Haptics, animated feedback, Gesture Handler swipe to next card |
| Mock exam | 65 questions weighted by domain, 90-minute timer, flag for review, no feedback until submit; results broken down by domain | Timer that survives app backgrounding (AppState), screen kept awake, Android back button asks for confirmation |
| Spaced repetition | Missed and low-confidence questions come back on a schedule (SM-2 or Leitner, pure function, unit tested) | SQLite queries, background-safe state |
| Progress stats | Accuracy per domain over time, mock-exam history, streak, a "ready to book?" indicator when every domain sits above 80% over the last 50 answers | Smooth charts and lists with FlashList |
| Daily reminder | Local notification at a time I choose | Permissions flow, notification deep-linking into practice |

Not in v1: accounts, cloud sync, AI-generated questions, other certifications. Design the data layer so a second certification could be added later by dropping in another JSON file and config.

## Build phases

Nine phases, each ending with a check I run myself before saying OK.

1. **Scaffold.** Create the app with `create-expo-app` (TypeScript), set up ESLint, Prettier, strict TS, NativeWind and Expo Router with three tabs: Study, Exam, Progress. Make a development build with EAS and run it on my physical phone.
   - Done when: the dev build opens on my phone, hot reload works, and dark mode follows the system setting.
2. **Data layer.** Define the Zod schema and the config of domain weights, write the 40 draft seed questions, set up the SQLite tables (`answers`, `review_schedule`, `exam_attempts`, `settings`) with versioned migrations, and write a typed repository module.
   - Done when: unit tests cover schema validation and migrations, and an invalid question JSON fails the build.
3. **Core logic.** Write pure functions for scoring (a multi-response question counts as correct only when every right answer is selected; check this against the official guide), weighted exam assembly, the spaced-repetition scheduler, and per-domain readiness.
   - Done when: each function has tests, including edge cases (an empty domain, a bank smaller than 65).
4. **Practice mode.** Build the question card, single and multi select, swipe to advance, haptics, and an animated correct/wrong state followed by the explanation.
   - Done when: it runs at 60 fps on my Android device with the performance monitor on, and the keyboard and safe areas are correct on both platforms.
5. **Mock exam.** Add the 65-question flow, a timer based on timestamps (not interval counting), flag for review, a review grid, submit, and a results screen by domain.
   - Done when: backgrounding the app for 2 minutes mid-exam keeps the timer accurate, killing the app resumes the attempt, and the Android back button asks for confirmation.
6. **Spaced repetition and progress.** Add a "Due today" queue, the stats screen, the streak, and the readiness indicator.
   - Done when: answers from previous days drive today's queue correctly (test with mocked dates).
7. **Reminders and settings.** Add the local daily notification, the permission prompt with a fallback when denied, deep-linking into practice, and reset of progress.
   - Done when: tapping the notification opens the Due today queue on both platforms.
8. **Quality pass.** Accessibility (screen reader labels, dynamic type, contrast), an empty state, an error state, and a Maestro end-to-end test for one practice session and one mock exam.
   - Done when: I can finish a practice session using VoiceOver/TalkBack only.
9. **Ship.** Configure EAS for production with an app icon and splash screen, then submit to TestFlight and Google Play internal testing.
   - Done when: I can install it from both test tracks.

## Quality bar and working rules

The app has to pass as a native app with a reviewer who has used both platforms. Treat these as acceptance criteria for every screen:

- Safe areas, notches and the Android navigation bar are handled; nothing sits under the status bar.
- Platform conventions are respected: the iOS swipe-back gesture works, and the Android hardware back button behaves predictably.
- Every animation runs on the UI thread (Reanimated worklets). No layout jank while the JS thread is busy.
- Every tap gives feedback (pressed state, haptic), and loading, empty and error states exist everywhere.
- Cold start to an interactive Study tab takes under 2 seconds on a mid-range Android phone. Measure it and report the number.

Working rules for you, the agent:

- Small commits with clear messages, one feature per branch, and a short summary of what changed after each phase.
- Run type-check, lint and tests before you say a phase is done, and paste the results.
- When something only works on one platform, say so; don't hide it.
- If you're unsure what a current API looks like, check the Expo or React Native docs instead of guessing. Tell me which page you used.
- Never write exam content beyond the 40 draft seed questions. The question bank is mine.

## Deliverables

The finished project is a public GitHub repo, two installable test builds, and a README that sells the work to a reviewer in two minutes.

- [ ] Repo with a clean history, CI on GitHub Actions running type-check, lint and unit tests on every PR
- [ ] TestFlight and Google Play internal testing builds via EAS
- [ ] README containing a 30-second screen recording, architecture notes (data layer, where the logic lives, why each library), and how to run it locally
- [ ] A "React Native vs Ionic/Capacitor" section in the README with measured numbers from my own devices: cold start, scroll performance on the 500-question browser, and how the swipe gestures feel. I'll supply the Ionic figures; you set up the measurement method
- [ ] A short list of known limitations and what v2 would add

End of prompt.

Sources: [AWS CLF-C02 exam guide](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html) · [Expo SDK 58 changelog](https://expo.dev/changelog/sdk-58)
