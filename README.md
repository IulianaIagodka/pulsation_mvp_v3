# Pulsation MVP

Pulsation is a cross-platform mobile MVP that offers one gentle micro-action at a time when you open the calm intervention flow. It uses on-device session context and local history to choose among three micro-interventions (it does not read other apps).

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
- `src/modules/intervention-planner.ts`: intervention selection, anti-repetition rotation
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

Schema is defined in `src/data/schema.ts`.

## UX Flow

1. **Onboarding** (`app/index.tsx`): anchored spiral, calm main line (“Pulsation exists…”), delayed “tap the spiral” hint, optional **About** link in the footer (About is **only** here in the main flow).
2. **Trigger** (`app/trigger.tsx`): same spiral slot; main prompt; spiral hint appears last (timed after main copy).
3. **Action** (`app/action.tsx`): one micro-intervention (feet / find 3 / triangle breath). Instruction copy uses the same soft **explanation rhythm** as return. **Find 3 things** shows three simple cues (shape · color · feel) from **7 rotating sets** in `find-three-variants.ts` — the same set never repeats back-to-back (stored in SQLite). **Spiral is the same visual everywhere** (`src/design/spiral-visual.ts` + `SpiralRings`). Tap uses `Pressable` so touches work above the scroll layer (see `AnchoredSpiralScreen` `elevation`). Action → return uses **`router.replace`** (no duplicate return in the stack).
4. **Return** (`app/return.tsx`): “You are here” (after route fade), then intervention-specific explanation, then “tap the spiral”; tap spiral → onboarding. Find 3 return line: *Looking around slowly helps you return to where you are now.*

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
| Spiral hint timing (“tap the spiral”) | `spiralHintTiming` in `src/design/animation-rhythm.ts` — always **after** other text; on **triangle breath**, the hint appears **after 3 full cycles** (then a short hold before auto-advance — `actionAutoComplete.triangleBreathExtraMs`) |
| Find 3 staged lines + pause before return | `findThreeThings.revealDelayMs`, `pauseBeforeAdvanceMs` (~7s after hint) |

Triangle breath pattern (labels + spiral): **inhale 4s → hold 2s → exhale 5s → hold 2s**, ×3 cycles (~39s spiral timing). Both holds show the “hold / затримка” label.

### Docs for release & QA

- `docs/spiral-regression-checklist.md` — manual spiral / animation checks
- `docs/app-store-metadata.md` — store copy (EN/UK)
- `docs/RELEASE-CHECKLIST.md` — TestFlight → App Store checklist
- `docs/TESTFLIGHT.md` — builds & submit
- `docs/privacy-policy.md` — privacy policy text
- `docs/pages/` — GitHub Pages (Support + Privacy for App Store Connect)
- `docs/app-store-screenshots/` — iPhone screenshots at **1284×2778** for App Store Connect

## Intervention rotation

Each visit to the trigger screen (`/trigger`) picks the next intervention in order:
`feet_on_ground` → `find_three_things` → `triangle_breath` → repeat.

## Inactivity trigger

If Pulsation was in the background for **20+ minutes**:

1. A **local notification** is shown (“One action for you now?” / “Одна дія зараз?”).
2. Reopening the app navigates to `/trigger` (not during action / return).

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

- **Trigger screen:** soft double-pulse when the screen appears.
- **Triangle breath:** haptics follow inhale (4s) → hold (2s) → exhale (5s) → hold (2s), synced with spiral animation.
- **Return screen:** grounding pulse on arrival.

Works in silent mode on iPhone (Taptic Engine). Requires a dev build (`npm run ios`) — not Expo Go alone after native module changes.

## Native Integration TODO

- `src/modules/signal-collector.ts` currently uses a runtime app-session signal as a safe fallback.
- Optional overrides for QA:
  - `EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES`
  - `EXPO_PUBLIC_SIMULATED_APP_CATEGORY` (`social` | `video` | `news` | `other`)
- Production recommendation: keep these env overrides unset and wire native usage APIs later.
