# CloudPrep

An offline-first iOS and Android quiz app for studying for the **AWS Certified Cloud Practitioner (CLF-C02)** exam, built with React Native and Expo.

> **Status:** v1 feature-complete, installable as an Android APK. Not published to the App Store or Google Play. The build plan lives in [`docs/cloudprep-agent-build-prompt.md`](docs/cloudprep-agent-build-prompt.md).

<!-- Screen recording: add a 30-second demo here (see "Recording a demo" below). -->

## Highlights

- **Native, not a web view:** real `UITabBarController` and Material bottom navigation, native alerts, date pickers and SF Symbols / Material Symbols per platform.
- **Animations on the UI thread:** the card swipe, shake-on-wrong and progress bar are Reanimated worklets driven by Gesture Handler.
- **Offline-first data:** SQLite with versioned migrations; a mock exam survives the app being killed, and its timer stays exact after backgrounding because it is computed from timestamps.
- **Logic you can trust:** scoring, weighted exam assembly, SM-2 scheduling and readiness are pure functions with 216 unit tests; two Maestro end-to-end flows cover a practice session and a mock exam.

## Why this project

CloudPrep has two goals of equal weight:

1. **Help pass the exam** — practice by domain, realistic mock exams, and spaced repetition focused on weak areas.
2. **Show real React Native skill** — it should feel native on both platforms, not like a web page in a wrapper.

## Features (v1)

| Feature | What it does |
| --- | --- |
| Learn | One lesson per exam task statement, with comparison tables, diagrams and "on the exam" callouts; links to practice that topic (2 pilot lessons so far) |
| Practice mode | Pick a domain or "weakest areas"; immediate feedback and explanation after each answer, swipe to the next card |
| Mock exam | 65 questions weighted by domain, 90-minute timer that survives backgrounding (tap it to hide or show the time), flag for review, results by domain |
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

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Expo SDK 58 (React Native 0.88) + TypeScript (strict), New Architecture | Managed native config (no hand-edited `ios/`/`android/`), current RN |
| Navigation | Expo Router with native tabs and typed routes | File-based routes, real platform tab bars, deep links for free |
| Local data | expo-sqlite | Queries over answer history (per-domain accuracy, due reviews) that a key-value store can't do |
| UI state | Zustand | Tiny store for the in-progress session only; persisted data lives in SQLite |
| Validation | Zod | One schema validates the question bank at build time and types it |
| Styling | NativeWind (Tailwind v3) | Familiar Tailwind classes compiled to native styles; `dark:` variants follow the system |
| Lists | @shopify/flash-list | Recycles rows, so long lists (question bank, exam history) stay smooth |
| Motion | react-native-reanimated + react-native-gesture-handler | Gestures and animations run on the UI thread, not the JS thread |
| Feedback | expo-haptics | Selection and success/error haptics |
| Reminders | expo-notifications (local only) | Daily scheduled notification with no server |
| Icons | expo-symbols | SF Symbols on iOS, Material Symbols on Android, from one component |
| Diagrams | react-native-svg | Vector shapes for lesson diagrams |
| Tests | Jest + jest-expo, Maestro | Unit tests for logic and data; end-to-end flows on a real build |
| Builds | Local `expo run` builds (EAS configured but not used yet) | No account needed to build and sideload |

## Architecture

- **Exam config** (`src/data/exams/clf-c02.ts`) — question counts, scoring scale, domain weights and task statements, taken from the official exam guide. Nothing exam-specific is hard-coded in components.
- **Question bank** (`assets/questions/clf-c02.json`) — bundled JSON validated with a Zod schema (`src/data/question-schema.ts`) that also enforces the exam guide's rules: single-answer questions have 4 options and 1 correct answer; multiple-response questions have 5 or more options, 2 or more correct answers, and a prompt that states how many to pick. Adding a second certification means adding another config and JSON file.
- **Database** (`src/db`) — SQLite tables (`answers`, `review_schedule`, `exam_attempts`, `settings`) created by versioned migrations tracked with `PRAGMA user_version`, behind a typed repository. The repository depends on a small `Database` interface that expo-sqlite satisfies, so unit tests run the same SQL against Node's built-in SQLite.
- **Business logic** (`src/logic`) — pure, unit-tested functions with no React or database imports: scoring (all-or-nothing for multiple-response), weighted exam assembly (largest-remainder allocation, 16/19/22/8 for 65 questions), the SM-2 spaced-repetition scheduler, per-domain readiness (80% over the last 50 answers in every domain), streaks and daily accuracy.
- **Screens** (`src/app`) — Expo Router routes. Tabs (Study, Exam, Progress) live in `src/app/(tabs)`; practice, the exam, results, the question browser and settings are stack screens on top. Screens call the repository through `useRepository()` and keep only view state.
- **Session state** (`src/state`) — Zustand stores for the practice session and the open exam. The exam store is rebuilt from SQLite on open, so killing the app loses nothing.

## Running locally

Requires Node 22.13+, Xcode (for iOS) and Android Studio's SDK (for Android). The app uses native modules, so it runs in a development build, not Expo Go.

```bash
npm install
npx expo run:android   # builds and installs a development build on a connected phone or emulator
npx expo run:ios       # same for the iOS simulator
npx expo start         # afterwards, just start the dev server and open the app
```

Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`. CI runs all four on every pull request (`.github/workflows/ci.yml`).

## Installing the APK on an Android phone

A release APK is a standalone app: no dev server, no developer menu, full speed.

```bash
npm run build:apk     # builds the release APK -> dist/CloudPrep-<version>.apk (version from app.json)
npm run install:apk   # installs the newest APK in dist/ on the connected phone
npm run android:release   # or build and install in one step, without keeping a copy in dist/
```

`build:apk` regenerates `android/` from `app.json`, runs Gradle's `assembleRelease`, and copies the result out of `android/app/build/outputs/apk/release/`. It builds for 64-bit ARM only (practically every current phone); set `ABIS` to add others, for example `ABIS="arm64-v8a,armeabi-v7a" npm run build:apk`. To release a new version, raise `version` in `app.json` first so each APK gets its own file name.

To install without a cable, copy the APK to the phone (USB file transfer, Google Drive, Quick Share), open it from the Files app, and allow "Install unknown apps" for that app when Android asks. With a cable and USB debugging on, `adb install -r app-release.apk` does the same.

The APK is signed with the project's debug key. That is fine for your own devices; publishing to Google Play needs a private upload key (or EAS Build, which manages one).

The app ID is `io.github.josearpaiaq.cloudprep`. Development builds use the same ID, so installing one replaces the other.

End-to-end tests use [Maestro](https://maestro.mobile.dev) and run against a release build on a simulator, emulator or device: `npx expo run:ios --configuration Release` (or `npx expo run:android --variant release`), then `npm run e2e`. The flows in `.maestro/` complete one practice session and one mock exam; they write real answers to the app's database, so run them on a simulator rather than a phone you study on.

`npm run validate:questions` validates the bundled question bank against the schema. It runs automatically before `npm run android` / `npm run ios` and on EAS builds, so an invalid question file fails the build.

## Roadmap

- [x] 1. Scaffold — Expo Router tabs (Study, Exam, Progress), lint, strict TS, NativeWind, EAS dev build
- [x] 2. Data layer — Zod schema, domain config, 40 draft seed questions, SQLite migrations, repository
- [x] 3. Core logic — scoring, exam assembly, spaced repetition, readiness
- [x] 4. Practice mode
- [x] 5. Mock exam
- [x] 6. Spaced repetition and progress
- [x] 7. Reminders and settings
- [x] 8. Quality pass — accessibility, empty/error states, Maestro e2e
- [x] 9. Ship — app icon, splash, release APK, CI (store submission postponed)

## React Native vs Ionic/Capacitor

Measured on a Samsung Galaxy A57 with the release APK on 2026-11-12. The 2-second cold-start target is met with room to spare.

| Measure | CloudPrep (React Native) | Ionic/Capacitor equivalent |
| --- | --- | --- |
| Cold start to first frame | 434 ms (median of 5) | _to add_ |
| Cold start to interactive Study tab | 504 ms (median of 5) | _to add_ |
| Scrolling 520 questions: janky frames | 1.6% (24 of 1,522) | _to add_ |
| Scrolling 520 questions: frame time p50 / p90 / p99 | 5 / 7 / 9 ms | _to add_ |
| Swipe between practice cards: frame time p50 / p90 / p99 | 5 / 10 / 17 ms (13.6% janky) | _to add_ |

How the numbers are taken (`npm run measure:android`, script in `scripts/measure-android.sh`):

- **Cold start:** the app is force-stopped, then `adb shell am start -W` reports the time to the first frame. "Interactive" is the time until the Study tab has loaded its data from SQLite, read from a one-line log the app writes at that moment. Median of 5 runs.
- **Scrolling:** the question browser opens with the bank repeated to 520 rows (`cloudprep://browse?repeat=4`, 130 × 4; the published numbers used the earlier 40-question bank × 13), the script flings it up and down 16 times, and `dumpsys gfxinfo` reports frame times and the share of janky frames.
- **Swipe feel:** frame times are recorded while practice cards are answered and swiped away (by hand, or six cycles driven by Maestro for the figure above).

To compare fairly, measure the Ionic app the same way on the same phone: `am start -W` for cold start, a 520-row list for scrolling, and `dumpsys gfxinfo` for frames.

## Recording a demo

With the phone connected: `adb shell screenrecord --time-limit 30 /sdcard/demo.mp4`, use the app, then `adb pull /sdcard/demo.mp4`. On the iOS simulator: `xcrun simctl io booted recordVideo demo.mp4` (Ctrl+C to stop).

## Question and lesson content

Lessons live in `src/content/lessons` as a small Markdown subset (headings, bold, lists, tables, `> [!TIP]` / `> [!NOTE]` / `> [!EXAM]` callouts and `{{diagram:id}}` markers), parsed by `src/logic/lesson-markdown.ts` and rendered with the app's own components. They are original writing based on the linked AWS documentation.

CloudPrep is an independent study app. It is not affiliated with, endorsed by, or sponsored by Amazon Web Services.

All questions are original or explicitly approved. Nothing is scraped, copied or paraphrased from paid practice exams, exam dumps or third-party question banks.

## Known limitations

- **The question bank is 130 draft questions** (31 / 39 / 44 / 16 by domain), all marked `"draft": true` until reviewed. Mock exams draw a full 65 with the official 16 / 19 / 22 / 8 split, but questions repeat sooner than they would with a larger bank.
- **No scaled score.** Results show percent correct; AWS does not publish how raw scores map to its 100–1,000 scale.
- **Not in the stores.** The APK is debug-signed for sideloading; iOS runs only on a simulator or through Xcode.
- **The reminder text is fixed** ("Time to study"); a repeating notification cannot include today's due count.
- **Android may deliver the reminder a few minutes late**, because exact alarms need a permission Google restricts.
- **A notification tapped while the app is fully closed** opens the Due today queue in release builds only; development builds land on the Expo launcher.
- **Screen-reader support is implemented but not yet verified** end to end with VoiceOver or TalkBack.

## What v2 would add

- A larger reviewed question bank (500+), so mock exams rarely repeat questions.
- A review screen after a mock exam that walks through each question with its explanation.
- Signed store builds through EAS, and TestFlight / Play internal testing.
- A second certification, which the data layer already supports (new config and JSON file).
- iCloud / Google Drive backup of progress, opt-in.
