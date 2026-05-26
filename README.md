# Pulsation MVP

Pulsation is a cross-platform mobile MVP that offers one gentle micro-action at a time when you open the calm intervention flow. It uses on-device session context and local history to choose among three micro-interventions (it does not read other apps).

## Stack

- Expo + React Native + TypeScript
- Expo Router
- Zustand
- Expo SQLite
- Reanimated
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

1. Quiet onboarding (`app/index.tsx`): only background, spiral, and single text.
2. Trigger prompt (`app/trigger.tsx`)
3. One-action intervention screen (`app/action.tsx`)
4. Explanation after done (`app/explanation.tsx`)
5. Return flow (`app/return.tsx`)

## Design System

Dark minimal palette from technical requirements is implemented in `src/design/tokens.ts` and applied across all screens:

- Background: `#0D121E`, `#0E1420`
- Spiral: `#4F6B91`, `#2A3954` / `#233045`
- Surfaces: `#141B2C`, `#1A2235`

## Intervention rotation

Each visit to the trigger screen (`/trigger`) picks the next intervention in order:
`feet_on_ground` → `find_three_things` → `triangle_breath` → repeat.

## Inactivity trigger

If Pulsation was in the background for **20+ minutes**:

1. A **local notification** is shown (“One action for you now?” / “Одна дія зараз?”).
2. Reopening the app navigates to `/trigger` (not during action / explanation / return).

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

## Native Integration TODO

- `src/modules/signal-collector.ts` currently uses a runtime app-session signal as a safe fallback.
- Optional overrides for QA:
  - `EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES`
  - `EXPO_PUBLIC_SIMULATED_APP_CATEGORY` (`social` | `video` | `news` | `other`)
- Production recommendation: keep these env overrides unset and wire native usage APIs later.
