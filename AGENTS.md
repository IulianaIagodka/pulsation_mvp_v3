# Pulsation — agent / LLM bootstrap context

Read this file first when starting work on this repository with no prior context.
Human-facing overview: `README.md`. Deep scheduling design: `docs/adaptive-scheduling.md`.

---

## What this product is

**Pulsation** is a calm, cross-platform mobile MVP that helps people pause when stuck scrolling.

Critical product constraints:

- It does **not** monitor, read, or control other apps.
- While Pulsation is in the **background**, it schedules **local** “One action for you” invitations.
- Opening an invitation leads to a short flow with **one** gentle micro-action.
- All personalization, history, and scheduling run **on-device** (SQLite). No account, no server, no analytics cloud, no sync.
- Tone: quiet, non-pushy, respectful of quiet hours / daily caps / dismissals.

Current app version in repo: **1.0.5** (`package.json` / `app.json`). iOS bundle / Android package: `com.maksym.pulsation`. Expo slug: `pulsation`. Owner: `iuliana.iagodka`. EAS project id: `54e2f20f-026c-4eae-8a39-b7e09729be1d`. App Store Connect app id: `6773324495`.

---

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Expo ~54, React Native 0.81, React 19 |
| Routing | Expo Router (`app/`), entry via `expo-router/entry` |
| Language | TypeScript |
| State (UI session) | Zustand (`src/state/app-store.ts`) |
| Persistence | Expo SQLite (`pulsation.db`) |
| Motion | RN `Animated` for core UI; Reanimated is present/configured |
| Fonts | Roboto Serif (main copy), Roboto (service UI) |
| Locales | `en` + `uk` via `expo-localization` + copy maps in `delivery-layer.ts` |
| Notifications | `expo-notifications` (local only) |
| Haptics | `expo-haptics` |
| Tests | Jest + `ts-jest` (`npm test`) |
| Builds | EAS (`eas.json`: development / preview / production) |

New Architecture is enabled (`app.json` → `newArchEnabled: true`). Dark UI only.

---

## Repo map

```
app/                    Expo Router screens
  _layout.tsx           fonts, bootstrap, listeners, persistent circles, stack fade
  index.tsx             onboarding / cold-start headline
  trigger.tsx           “One action for you” + paths entry
  action.tsx            micro-intervention UI
  return.tsx            “You are here” + Save this for me
  paths.tsx             today’s count + saved interventions
  about.tsx             About (from onboarding footer)

src/
  modules/              core logic (eligibility, planner, scheduler, delivery, signals)
  services/             app wiring (bootstrap, launch routing, notifications, prefs)
  data/                 SQLite schema, db bootstrap, repositories
  design/               tokens, typography, circles visual/engine, shared UI components
  interventions/        registry of the seven actions
  components/           app-level listeners (inactivity, notification open)
  navigation/           helpers to go to trigger/action, route paths
  hooks/                circles press registration, layout/accessibility helpers
  state/                Zustand store
  types/domain.ts       shared domain types

docs/                   release, privacy, adaptive scheduling, screenshots, GitHub Pages
scripts/                icon + App Store screenshot generation
assets/                 icons / splash
```

There is no backend package and no auth.

---

## Primary UX flow

1. **Onboarding** (`/`)
   - First install → extended multi-step intro (`ExtendedOnboardingFlow`); flag `extended_onboarding_completed`.
   - Later cold starts → short headline + About.
   - Warm resume from background → skip onboarding, go to trigger.
2. **Trigger** (`/trigger`) — “One action for you”; optional “Show my paths” / “Мої шляхи”.
3. **Action** (`/action`) — one of seven interventions. Circles tap advances/completes (find-3 reveals bullets first).
4. **Return** (`/return`) — “You are here” + explanation; footer “Save this for me” if not already saved.
5. **Paths** (`/paths`) — today’s actions + saved list (local only).
6. **About** (`/about`) — reachable from onboarding footer.

Navigation notes:

- Flow screens `trigger` / `action` / `return` use `animation: "none"`; action→return uses `router.replace` (no stack fade).
- Other routes use calm fade (`breathingRhythm.motion.screenFadeMs`).
- Circles are a **persistent overlay** (`PersistentCirclesLayer`), same visual everywhere (`circles-visual.ts` + `CirclesRings`).
- Circles are the primary interaction control; screens register press handlers via the Zustand store / `use-register-circles-press`.

Launch routing logic lives in `src/services/launch-routing.ts` + `onboarding-gate.ts` + `session-runtime.ts`.

---

## The seven interventions

Defined in `src/interventions/registry.ts`:

| id | presentation |
|----|----------------|
| `feet_on_ground` | `simple` |
| `find_three_things` | `find_three` (7 rotating cue sets; no same set twice in a row) |
| `triangle_breath` | `triangle_breath` (inhale 4s → hold 2s → exhale 5s → hold 2s ×3) |
| `relax_jaw` | `simple` |
| `drop_shoulders` | `simple` |
| `notice_three_sounds` | `simple` |
| `press_palms_together` | `simple` |

Selection: `src/modules/intervention-planner.ts` (time-of-day pools, EMA completion rates, variety roll, anti-repetition of last two). Orchestrated by `trigger-engine.ts` after eligibility checks.

Copy / labels / explanations / find-3 sets: **`src/modules/delivery-layer.ts`** (edit user-facing strings here).

---

## Architecture (decision path)

Typical invitation → action path:

1. App backgrounds → `inactivity-notification.ts` schedules local notifications (near series + daily + weekly follow-ups). Interval from `adaptive-scheduler.ts`.
2. Resume / notification open → `InactivityTriggerListener` / `NotificationOpenListener` may navigate to `/trigger` if eligibility passes.
3. `decideIntervention()` in `pulsation-flow.ts`:
   - `collectSignal()` (session fallback; Screen Time not wired yet)
   - `runTriggerEngine()` → `checkEligibility()` + `planIntervention()`
4. User completes/dismisses → `registerInterventionOutcome()` updates effectiveness, outcomes memory, safety state, scheduling profile.

### Safety defaults (`eligibility-safety.ts`)

- Distracting session must be ≥ ~20 minutes (signal-based; QA can simulate).
- Daily cap (default **4**).
- Cooldown (default **45** minutes, same local day).
- Quiet hours (skipped until first recorded intervention).
- Dismissal streak ≥ **3** → dampen / block until a completion resets streak.

### Adaptive scheduling (summary)

Base ~**20 minutes**, then bonuses for recent completions, daily completions, ignore streak, multi-day absence; recovery when user returns; jitter ±18%; destagger. Scheduler clamp ~[18m, 240m]; each background gap delivered in ~[10m, 30m]. Full algorithm + scenarios: `docs/adaptive-scheduling.md`.

Notification cadence when app stays unopened:

1. Near series of local invitations at adaptive gaps.
2. Then **daily** follow-ups for **7 days**.
3. Then **weekly** follow-ups for **8 more weeks**.
4. Returning to the app clears remaining pending invitations.

---

## Data model (SQLite)

DB file: `pulsation.db` (`src/data/db.ts`). Schema: `src/data/schema.ts`. Migrations for optional columns run on init.

| Table | Purpose |
|-------|---------|
| `intervention` | catalog rows |
| `events` | local event log (`signal_collected`, `trigger_evaluated`, `intervention_outcome`, `pulsation_dismissed`, …) |
| `post_intervention_effectiveness` | scores |
| `safety_state` | quiet hours, cap, cooldown, today’s count, dismissal streak |
| `outcomes_profile` | completion rates, preferred-by-hour, recent list, kept interventions, onboarding flags, find-3 variant |
| `scheduling_profile` | open/background/complete timestamps, ignore streak, interval memory, per-type/hour counts |

Domain types: `src/types/domain.ts`.

Zustand store is **not** durable — only ephemeral UI (selected intervention, find-3 variant index, circles press owner, high-contrast preview).

---

## Design system (do not casually redesign)

Tokens: `src/design/tokens.ts`.

- Dark minimal palette (deep navy backgrounds; muted blue-gray circles/text).
- Main copy: **Roboto Serif**, **20 pt**; explanations **17 pt**; footer **12 pt** (`main-copy.ts`).
- Dynamic Type: floor 1.0×, ceiling 3.1× (`accessibility.ts`).
- Prefer existing calm components (`CalmScreen`, `CalmText`, `ExplanationText`, `AnchoredCirclesScreen`, `OverflowScrollView`, …).
- Circles timing/breath engine: `circles-breath-engine.ts`, `animation-rhythm.ts`.
- Avoid dashboard clutter, card-heavy marketing layouts, or loud accents — product identity is sparse and atmospheric.

Regression checklist for circles/motion: `docs/circles-regression-checklist.md`.

---

## Localization

- Device language via `expo-localization`; `uk` → Ukrainian, everything else → English.
- All in-app strings for interventions / guidance / explanations / UI phrases live in `delivery-layer.ts` (and some screen-local copy where noted).
- App Store metadata EN/UK: `docs/app-store-metadata.md`.
- Privacy / support HTML for Connect: `docs/pages/` (GitHub Pages).

---

## Environment / QA overrides

Unset these in production builds.

| Variable | Effect |
|----------|--------|
| `EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES` | Fixed interval; bypass adaptive scheduler |
| `EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES` | Fake background duration on resume |
| `EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES` | Fake session length for eligibility |
| `EXPO_PUBLIC_SIMULATED_APP_CATEGORY` | `social` \| `video` \| `news` \| `other` |
| `EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS=true` | Cycle all seven interventions in fixed order |
| `EXPO_PUBLIC_ENABLE_DEBUG_ACTION_SELECTOR=true` | Debug action picker on action screen |
| `EXPO_PUBLIC_APP_STORE_SCREENSHOTS=true` | Screenshot-friendly presentation mode |

Example simulator QA:

```bash
EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES=0 npm start
# or
EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES=1 EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES=25 npm start
```

Native modules (notifications, haptics) need a **dev build** (`npm run ios` / `npm run android`), not Expo Go alone after native changes.

Dev helper to wipe local DB + reveal state: `resetPulsationLocalData()` in `pulsation-flow.ts`.

---

## Commands

```bash
npm install
npm start                 # Expo dev server
npm run ios               # native iOS run
npm run android           # native Android run
npm test                  # Jest
npm run doctor            # expo-doctor

npm run build:ios:preview
npm run build:ios:prod    # / testflight alias
npm run submit:ios:prod
npm run build:android:preview
npm run build:android:prod
npm run submit:android:prod

npm run generate:icon
npm run generate:screenshots
npm run generate:screenshots:uk
npm run generate:screenshots:conversion
```

---

## Release / store context

- iOS checklist & version history narrative: `docs/RELEASE-CHECKLIST.md`
- Android: `docs/ANDROID-RELEASE-CHECKLIST.md`
- TestFlight notes: `docs/TESTFLIGHT.md`
- Privacy policy text: `docs/privacy-policy.md`
- Privacy nutrition / mapping: `docs/app-privacy-mapping.md`
- Screenshots pipeline & sizes (iPhone **1284×2778** Connect slot, plus iPad assets): `docs/app-store-screenshots/`
- `eas.json` production submit uses ASC app id `6773324495`; Android submit track `internal`.
- `app.json` iOS `buildNumber` / version are source of truth with `appVersionSource: "local"`; production profile has `autoIncrement: true`.

When touching store versioning, keep `package.json` version, `app.json` `expo.version`, and release docs aligned.

---

## Important invariants for agents

1. **Privacy promise:** do not add cross-app monitoring, tracking SDKs, accounts, or cloud sync unless explicitly requested and documented.
2. **Local-first:** persist user-facing memory in SQLite repos; do not invent a backend.
3. **Circles UX:** keep one shared circles layer/visual; do not fork per-screen circle designs without strong reason.
4. **One action at a time:** trigger → single intervention → return. Do not turn action into a multi-choice menu in normal mode.
5. **Safety before delivery:** respect eligibility gates; longer intervals / fewer invites when ignored or absent — never “catch up” with a burst.
6. **Copy:** bilingual EN/UK; prefer editing `delivery-layer.ts` for intervention-related strings.
7. **Tests:** logic-heavy modules already have `*.test.ts` beside them — update/add tests when changing planner, eligibility, scheduling, notifications, launch routing, delivery.
8. **Native folders** `/ios` and `/android` are gitignored (CNG/prebuild style); do not commit generated native trees unless the project deliberately switches approach.
9. Prefer small, focused diffs; do not rewrite design system or flow timing casually.
10. Signal collector is still a **session fallback**; real Screen Time / usage APIs are future work (`README` Native Integration TODO).

---

## Suggested reading order for a new agent

1. This file (`AGENTS.md`)
2. `README.md`
3. `src/interventions/registry.ts` + `src/types/domain.ts`
4. `app/_layout.tsx` → `app/index.tsx` → `trigger.tsx` → `action.tsx` → `return.tsx`
5. `src/services/pulsation-flow.ts` + `launch-routing.ts`
6. `src/modules/eligibility-safety.ts` → `intervention-planner.ts` → `adaptive-scheduler.ts` → `inactivity-notification.ts`
7. `docs/adaptive-scheduling.md`
8. Relevant checklist under `docs/` if the task is release/QA/store related

---

## Out of scope unless asked

- Backend / accounts / push from a server
- Reading other apps’ content or true Screen Time enforcement (planned later)
- Redesigning brand palette or replacing the circles metaphor
- Expanding beyond the seven registered interventions without updating planner, delivery copy, registry, and tests together
