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
- `src/interventions/registry.ts`: intervention catalog (presentation mode, hint timing, defaults)
- `src/modules/intervention-planner.ts`: adaptive intervention selection (time-of-day, completion rates, variety)
- `src/modules/adaptive-scheduler.ts`: dynamic Pulsation interval from local engagement signals
- `src/data/repositories/scheduling-profile-repo.ts`: persists scheduling profile (opens, completions, ignores)
- `src/modules/delivery-layer.ts`: single-action copy mapping
- `src/modules/find-three-variants.ts`: seven “find 3 things” prompt sets (shape · color · feel); no same set twice in a row
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

1. **Onboarding** (`app/index.tsx`): short or extended first-install flow (`ShortOnboardingFlow` / `ExtendedOnboardingFlow`). Anchored spiral, calm main line, then “tap the spiral” (not “one action for you” on onboarding). Optional **About** footer link (About is **only** here in the main flow). Shown once per install/profile (`extendedOnboardingCompleted`).
2. **Trigger** (`app/trigger.tsx`): same spiral slot; main prompt (“One action for you now?”); adaptive spiral hint when the hint system decides to show it.
3. **Action** (`app/action.tsx`): one micro-intervention (feet / find 3 / triangle breath / relax jaw / drop shoulders / notice 3 sounds / press palms together). Instruction copy uses the same soft **explanation rhythm** as return. **Find 3 things** shows three cues from **7 rotating sets** (`find-three-variants.ts`); same set never repeats back-to-back. Until all three bullets are visible, **spiral tap reveals the next bullet** instead of completing the action. **Triangle breath**: soft haptic at inhale start and light haptic at exhale start (`startTriangleBreathHapticLoop`). **Spiral is the same visual everywhere** (`spiral-visual.ts` + `SpiralRings`). Action → return uses **`router.replace`**.
4. **Return** (`app/return.tsx`): “You are here”, then a short intervention-specific explanation (3 rotating variants), then optional **Keep this one for me** (hidden for interventions already saved via `keptInterventions` in SQLite). Adaptive “tap the spiral” hint; tap spiral → trigger.

Stack navigation uses a calm **fade** between routes (`app/_layout.tsx`, `breathingRhythm.motion.screenFadeMs`).

Standalone **About** screen: `app/about.tsx` (reachable from onboarding footer only).

## Design System

Dark minimal palette from technical requirements is implemented in `src/design/tokens.ts` and applied across all screens:

- Background: `#0D121E`, `#0E1420`
- Spiral: `#4F6B91`, `#2A3954` / `#233045`
- Surfaces: `#141B2C`, `#1A2235`

### Copy & motion (high level)

| Piece | Where |
| ----- | ----- |
| Main line typography | `src/design/main-copy.ts` (matches onboarding tone where used) |
| Soft explanation-style fades | `ExplanationText` + `breathingRhythm.explanationText` |
| Gentle screen text entrance | `GentleTextTransition` (opacity only) |
| Spiral hint timing (“tap the spiral”) | Base timing is in `spiralHintTiming` (`src/design/animation-rhythm.ts`), then adapted by `src/modules/spiral-hint-presentation.ts` + `src/services/spiral-hint.ts` based on spiral-tap familiarity (delay, opacity, occasional hide, eventual silence). On **triangle breath**, reveal still waits for **3 full cycles** before adaptation is applied. |
| Find 3 sequential bullets | `findThreeThings.autoRevealIntervalMs` |
| Action → return (“You are here”) | Spiral tap on action (`app/action.tsx`); find 3 requires all bullets first |
| Keep for me | `app/return.tsx` + `src/services/adaptive-preferences.ts` (`keptInterventions`) |

Triangle breath pattern (labels + spiral): **inhale 4s → hold 2s → exhale 5s → hold 2s**, ×3 cycles (~39s spiral timing). Both holds show the “hold / затримка” label.

### Docs for release & QA

- `docs/adaptive-scheduling.md` — adaptive interval + personalization design
- `docs/spiral-regression-checklist.md` — manual spiral / animation checks
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

When Pulsation is in the background, it schedules **one local invitation** after a **dynamic interval** (~20 min base, adapted by recent completions, ignores, and absence — see `docs/adaptive-scheduling.md`):

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
- **Keep this one for me:** subtle selection feedback on tap.
- **Return:** grounding arrival pulse when the screen appears.

Works in silent mode on iPhone (Taptic Engine). Requires a dev build (`npm run ios`) — not Expo Go alone after native module changes.

## Native Integration TODO

- `src/modules/signal-collector.ts` currently uses a runtime app-session signal as a safe fallback.
- Optional overrides for QA:
  - `EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES`
  - `EXPO_PUBLIC_SIMULATED_APP_CATEGORY` (`social` | `video` | `news` | `other`)
- Production recommendation: keep these env overrides unset and wire native usage APIs later.
