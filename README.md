# Pulsation MVP

Pulsation is a cross-platform mobile MVP that offers one gentle micro-action at a time when you open the calm intervention flow. It uses on-device session context and local history to choose among seven micro-interventions (it does not read other apps).

## Stack

- Expo + React Native + TypeScript
- Expo Router
- Zustand
- Expo SQLite
- Reanimated (configured; core UI uses `Animated` API)
- Jest

## Setup

1. `npm install`
2. `npm run start`
3. Run on iOS/Android simulator from Expo CLI.

## Core Modules

- `src/modules/signal-collector.ts`: on-device session signal (native Screen Time integration planned)
- `src/modules/trigger-engine.ts`: orchestration across safety + adaptive logic
- `src/modules/eligibility-safety.ts`: hard safety rules (quiet hours, cap, cooldown, dismissal dampening)
- `src/modules/state-interpreter.ts`: context interpretation for adaptation
- `src/interventions/registry.ts`: intervention catalog (presentation mode, defaults)
- `src/modules/intervention-planner.ts`: adaptive intervention selection (time-of-day, completion rates, variety)
- `src/modules/adaptive-scheduler.ts`: dynamic Pulsation interval from local engagement signals
- `src/data/repositories/scheduling-profile-repo.ts`: persists scheduling profile (opens, completions, ignores)
- `src/modules/delivery-layer.ts`: in-app copy (en + uk), interventions, find-3 variant sets; no same set twice in a row
- `src/services/find-three-flow.ts`: persists last find-3 variant in `outcomes_profile`
- `src/modules/reflection-engine.ts`: lightweight outcome scoring
- `src/modules/memory-update.ts`: profile memory updates

## Data Model

SQLite tables:

- `intervention`
- `events`
- `post_intervention_effectiveness`
- `safety_state`
- `outcomes_profile`
- `scheduling_profile`

Schema is defined in `src/data/schema.ts`. See `docs/adaptive-scheduling.md` for scheduling and personalization details.

## UX Flow

1. **Onboarding** (`app/index.tsx`): **first install** — full flow (`ExtendedOnboardingFlow`): **Pulsation exists…** stays visible; **How it works:** + three steps appear below (auto one-by-one, or first circles tap reveals all together); second tap → trigger; footer **About** only; once per install (`extended_onboarding_completed`). **Later cold starts** — short headline + **About**; tap circles → trigger. **Resume from background** — skip onboarding, open **One action for you** directly.
2. **Trigger** (`app/trigger.tsx`): same circles slot; **One action for you** and **Show my paths** / **Мої шляхи** fade in together when you already have today’s actions or saved items. Paths → `app/paths.tsx`.
3. **Action** (`app/action.tsx`): one micro-intervention (feet / find 3 / triangle breath / relax jaw / drop shoulders / notice 3 sounds / press palms together). Main line starts at the **same Y** as trigger **One action for you** and return **You are here**; bullets / phases flow **below** main. **Find 3 things:** shows three cues from **7 rotating sets** (`delivery-layer.ts`); same set never repeats back-to-back. Until all three bullets are visible, **circles tap reveals the next bullet** instead of completing the action. **Triangle breath**: soft haptic at inhale start and light haptic at exhale start (`startTriangleBreathHapticLoop`). **Circles are the same visual everywhere** (`circles-visual.ts` + `CirclesRings`). Action → return uses **`router.replace`** (no stack fade — `animation: "none"` on flow screens).
4. **Return** (`app/return.tsx`): **You are here** (pinned main, fade-in) → explanation (auto after main, or sooner on circles tap); **Save this for me** in the **footer**; if already saved, the control is hidden. Second circles tap → trigger.

Stack navigation uses a calm **fade** between routes (`app/_layout.tsx`, `breathingRhythm.motion.screenFadeMs`).

Standalone **About** screen: `app/about.tsx` (reachable from onboarding footer only).

**Paths** (`app/paths.tsx`): today's count (**20 pt**) + label (**17 pt**); **Saved for you:** (**20 pt**); saved intervention names (**17 pt**). Local SQLite only.

**Overflow scroll** (`OverflowScrollView`): native scroll indicator only when content exceeds the viewport (About, paths, explanations, onboarding steps).

## Design System

Dark minimal palette from technical requirements is implemented in `src/design/tokens.ts` and applied across all screens:

- Background: `#0D121E`, `#0E1420`
- Circles: `#4F6B91`, `#2A3954` / `#233045`
- Surfaces: `#141B2C`, `#1A2235`

### Copy & motion (high level)

| Piece | Where |
| ----- | ----- |
| Main line typography | `src/design/main-copy.ts` — **Roboto Serif** for main copy, **Roboto** for service UI; main **20 pt**, explanations **17 pt**, footer **12 pt** |
| Soft explanation-style fades | `ExplanationText` + `breathingRhythm.explanationText` |
| Onboarding step rhythm | `onboardingCopy` + `getOnboardingExplanationDelayMs` |
| Find 3 sequential bullets | `findThreeThings.autoRevealIntervalMs` |
| Action → return (“You are here”) | Circles tap on action (`app/action.tsx`); find 3 requires all bullets first |
| Save for me | `app/return.tsx` + `src/services/adaptive-preferences.ts` (`keptInterventions`) |
| Paths stats | `app/paths.tsx` + `src/services/paths-stats.ts` |
| Dynamic Type caps | `src/design/accessibility.ts` — floor `1.0×` (no shrink below default), ceiling `3.1×` (XXL) |

Triangle breath pattern (labels + circles): **inhale 4s → hold 2s → exhale 5s → hold 2s**, ×3 cycles (~39s circles timing). Both holds show the “hold / затримка” label.

### Docs for release & QA

- `docs/adaptive-scheduling.md` — adaptive interval + personalization design
- `docs/circles-regression-checklist.md` — manual circles / animation checks
- `docs/app-store-metadata.md` — store copy (EN/UK)
- `docs/RELEASE-CHECKLIST.md` — TestFlight → App Store checklist
- `docs/TESTFLIGHT.md` — builds & submit
- `docs/privacy-policy.md` — privacy policy text
- `docs/pages/` — GitHub Pages (Support + Privacy for App Store Connect)
- `docs/app-store-screenshots/` — iPhone screenshots at **1284×2778** for App Store Connect

## Intervention selection

Each visit to `/trigger` picks **one of seven** micro-interventions via `intervention-planner.ts`:

- **Time-of-day pools** — morning grounding, daytime sensory, evening breathing/calm body, quieter night options
- **Completion rates** — prefers actions you tend to complete (EMA in `memory-update.ts`)
- **Variety roll** — occasionally suggests a less-used action
- **Anti-repetition** — skips the last two shown actions

Actions: feet on ground, find 3 things, triangle breath, relax jaw, drop shoulders, notice 3 sounds, press palms together.

For QA only, set `EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS=true` to cycle through all seven in fixed order (`test-intervention-rotate.ts`).

## Inactivity trigger (adaptive)

When Pulsation is in the background, it schedules **one local invitation** after a **dynamic interval** near 20 minutes (kept in a 10-30 minute window and adapted by recent completions, ignores, and absence — see `docs/adaptive-scheduling.md`):

1. A **local notification** may appear (“One action for you now?” / “Одна дія для тебе зараз?”).
2. Reopening the app after the threshold navigates to `/trigger` (not during action / return), if eligibility passes (cooldown, daily cap, etc.).

Timing adapts gently — it is not a fixed 20-minute reminder.

iOS will ask for notification permission the first time you background the app. After adding `expo-notifications`, run `npm run ios` once (not only Expo Go) so the native module is linked.

### Test in Simulator (no Date & Time setting needed)

iOS Simulator often has no manual clock control. Use a short threshold instead:

```bash
EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES=0 npm start
```

Then: open app → **⌘⇧H** (Home) → open Pulsation again → should land on `/trigger`.

To fake a long absence after any background:

```bash
EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES=1 EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES=25 npm start
```

Background once (even briefly), then return to the app.

## Haptic regulation (iOS / Android)

- **Trigger:** soft double-pulse when the prompt appears.
- **Triangle breath:** one pulse at inhale start, one at exhale start.
- **Save this for me:** subtle selection feedback on tap.
- **Return:** grounding arrival pulse when the screen appears.

Works in silent mode on iPhone (Taptic Engine). Requires a dev build (`npm run ios`) — not Expo Go alone after native module changes.

## Native Integration TODO

- `src/modules/signal-collector.ts` currently uses a runtime app-session signal as a safe fallback.
- Optional overrides for QA:
  - `EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES`
  - `EXPO_PUBLIC_SIMULATED_APP_CATEGORY` (`social` | `video` | `news` | `other`)
- Production recommendation: keep these env overrides unset and wire native usage APIs later.
