# Adaptive Pulsation Scheduling

Pulsation invites you back to yourself — it is not a reminder system. Scheduling runs entirely on-device: no server, account, cloud sync, or external analytics.

---

## 1. Architecture

```mermaid
flowchart TD
  subgraph inputs [Local signals]
    A[App open / background]
    B[Completion / dismissal]
    C[Outcomes profile]
    D[Safety state]
  end

  subgraph core [Scheduling core]
    E[scheduling_profile SQLite]
    F[adaptive-scheduler.ts]
    G[intervention-planner.ts]
    H[trigger-engine.ts]
  end

  subgraph delivery [Delivery]
    I[inactivity-notification.ts]
    J[InactivityTriggerListener]
    K[/trigger screen]
  end

  A --> E
  B --> E
  B --> C
  B --> D
  E --> F
  D --> F
  C --> G
  F --> I
  F --> J
  H --> G
  G --> K
  I --> K
  J --> K
```

| Layer | Module | Role |
|-------|--------|------|
| Persistence | `scheduling_profile` table | Engagement timestamps, ignore streak, per-type/hour counts |
| Persistence | `outcomes_profile`, `safety_state` | Completion rates, hour preferences, daily caps, cooldowns |
| Scheduling | `adaptive-scheduler.ts` | Dynamic interval with jitter and destaggering |
| Personalization | `intervention-planner.ts` | Action selection by time-of-day, history, and completion rates |
| Orchestration | `trigger-engine.ts` | Eligibility gates + intervention planning |
| Delivery | `inactivity-notification.ts` | Short local notification series on background |
| Delivery | `InactivityTriggerListener.tsx` | Auto-open on resume when threshold + eligibility pass |

**Design principles**

- Lightweight heuristics, not ML — every decision is explainable via `explainInterval()`.
- Longer intervals = fewer invitations; the app never speeds up to “catch up”.
- Random jitter (±18%) and destaggering avoid clock-like predictability.
- All data stays in `pulsation.db` on the device.

---

## 2. Data model

### `SchedulingProfile` (table: `scheduling_profile`)

| Field | Type | Purpose |
|-------|------|---------|
| `lastAppOpenAt` | timestamp | Last time the app became active |
| `lastCompletedAt` | timestamp | Last completed Pulsation |
| `consecutiveIgnored` | int | Pulsations shown but left without action |
| `totalCompleted` | int | Lifetime completions |
| `completionsByType` | JSON map | Count per action type |
| `completionsByHour` | JSON map | Engagement patterns by hour (0–23) |
| `lastScheduledIntervalMinutes` | int | Previous interval — used to avoid repetition |

Derived at read time:

- **Days since last interaction** = floor days since `max(lastAppOpenAt, lastCompletedAt)`

### Existing profiles (unchanged schema, extended use)

- **`OutcomesProfile`** — EMA completion rates, learned hour preferences, recent intervention history (last 8).
- **`SafetyState`** — daily cap (4), cooldown (45 min), dismissal streak, quiet hours.

### Event log

New event type: `pulsation_dismissed` — user left `/trigger` without starting an action.

---

## 3. Scheduling algorithm

Base interval: **20 minutes** (same starting point as before).

```
interval = base (20m)

+ recent completion bonus     +30m if completed < 1h ago, +12m if < 2h
+ daily completion bonus      +18m per extra completion beyond the first today
+ ignored streak bonus        +15m per consecutive ignored Pulsation
+ absence bonus               +25m per day beyond 2, capped at +90m (≥ 3 days away)

− recovery reduction          up to 35% of dampening when user returns within 48h

× jitter                      random 0.82 – 1.18
+ destagger                   +2 if multiple of 5, +3 if multiple of 10, +5 if too close to last interval

raw scheduler clamps to [18m, 240m]
trigger delivery caps each background interval to [10m, 30m]
```

**When the interval is computed**

- On background → schedule a finite series of 6 local notifications from time to time at the adaptive interval, with each gap capped to the 10-30 minute trigger window (interval persisted as `lastScheduledIntervalMinutes`).
- On resume → compare inactive minutes against current interval; also check eligibility.

**Eligibility gates** (unchanged, from `eligibility-safety.ts`)

- Session too short (< 20 min distracting time)
- Daily cap reached
- Cooldown active
- Quiet hours (after first intervention)
- 3+ consecutive dismissals → pause until streak resets

---

## 4. Personalization algorithm

Seven available actions: feet on ground, find 3 things, triangle breath, relax jaw, drop shoulders, notice 3 sounds, press palms together.

Action selection in `planIntervention()`:

1. **15% variety roll** — pick the least-completed action (if not in last 2).
2. **Time-of-day preference** (65% when not recently shown) — one pick from the pool for that hour:
   - Morning (5–11): `feet_on_ground`, `relax_jaw`, `drop_shoulders`, `press_palms_together`
   - Daytime (11–17): `find_three_things`, `notice_three_sounds`
   - Evening (17–22): `triangle_breath`, `relax_jaw`, `press_palms_together`
   - Night (22–5): `triangle_breath`, `press_palms_together`
3. **Learned hour preference** — from `OutcomesProfile.preferredByHour`.
4. **Completion-rate sort** — prefer higher EMA rates across all seven; skip actions shown in last 2.

Completion rates update via existing EMA in `memory-update.ts` (70/30 blend). Per-type counts also feed `scheduling_profile.completionsByType`.

---

## 5. Example user scenarios

### Scenario A — Engaged morning user

| Day | Events | Interval behavior |
|-----|--------|-------------------|
| Mon 8:00 | Opens app, completes feet on ground | Next invite ~50m (base + recent completion + jitter) |
| Mon 9:30 | Background 55m, completes find 3 things | ~68m (second completion today adds daily bonus) |
| Mon 11:00 | Background 70m, ignores trigger | ~45m base but ignore streak adds +15m next time |
| Tue 8:00 | Completes relax jaw | Streak reset; morning pool suggests grounding actions |

**Feel:** Responsive when engaged, never stacking pressure.

### Scenario A2 — Daytime sensory variety

| Time | Events | Likely action |
|------|--------|---------------|
| 14:00 | Background, opens trigger | `find_three_things` or `notice_three_sounds` (daytime pool) |
| 15:30 | Completes notice 3 sounds | Interval stretches; learned preference for 14–15h updates |
| 16:00 | Variety roll fires | Less-used action from the full set of seven |

### Scenario B — Quiet week, then return

| Day | Events | Interval behavior |
|-----|--------|-------------------|
| Mon | One completion, then ignores twice | Interval grows to ~65m |
| Tue–Thu | App not opened | — |
| Fri | Opens app (5 days absent) | Next interval ~95m+ (absence bonus) |
| Fri PM | Completes one action after return | Recovery shaves ~30% of dampening within 24h |
| Sat | Regular use resumes | Interval drifts back toward ~25–35m over 1–2 days |

**Feel:** Respects absence; gently re-engages without a flood of notifications.

### Scenario C — Three dismissals in a row

| Step | Event | Result |
|------|-------|--------|
| 1 | Ignore trigger | +15m, dismissalStreak = 1 |
| 2 | Ignore again | +30m, dismissalStreak = 2 |
| 3 | Ignore again | +45m, dismissalStreak = 3 → **eligibility blocked** |
| 4 | User completes onboarding circles later | Streak resets on next completion |

**Feel:** Clear boundary — Pulsation steps back until the user is ready.

### Scenario D — Evening regular

| Time | Likely action | Why |
|------|---------------|-----|
| 19:00 | Triangle breath or press palms | Evening pool (breathing + calm body) |
| 19:30 | Find 3 things | Variety roll or learned hour preference |
| 20:00 | Relax jaw | Evening pool; avoids repeating last two |
| 23:00 | Triangle breath or press palms | Night pool — quieter options |

---

## Success criteria

- Intervals vary session to session — never exactly every 20 minutes.
- Completing or ignoring Pulsations measurably shifts the next invite time.
- Action variety emerges from time-of-day + history, not rigid rotation.
- All logic is local, inspectable, and logged via `scheduling` field in `trigger_evaluated` events.

---

## QA overrides

| Env variable | Effect |
|--------------|--------|
| `EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES` | Fixed interval (bypasses adaptive scheduler) |
| `EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES` | Fake background duration on resume |
| `EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES` | Fake session length for eligibility |
