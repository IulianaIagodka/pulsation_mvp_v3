# App Privacy Mapping (App Store Connect) — Pulsation

Last updated: May 28, 2026

Use this file when filling **App Privacy** in App Store Connect.

## Quick summary

- No account/login.
- No third-party analytics SDK.
- No ad SDK.
- Data stays on device (SQLite).
- Notifications are local reminders only (scheduled on device).
- No backend data collection from the app.

## What is stored locally (on device)

Pulsation stores only in-app state needed for app behavior:

- `events` table:
  - signal/intervention events (for example: trigger evaluations, intervention outcomes, circles tap count events),
  - timestamps and event payload needed for local flow logic.
- `safety_state` table:
  - quiet hours, daily cap, cooldown windows, intervention counters.
- `outcomes_profile` table:
  - intervention completion memory,
  - recent interventions,
  - onboarding completion,
  - find-3 rotation state.
- `post_intervention_effectiveness` table:
  - local completion/effectiveness scoring for adaptation.

Storage layer: local SQLite DB (`src/data/schema.ts`).

## What is NOT sent / collected by server

- No user account identifiers.
- No email/phone/name collection in app.
- No server-side profile sync.
- No cross-app or cross-site tracking.
- No advertising identifiers used for ads targeting.
- No sales/sharing of app data.

## Notifications

- App may schedule local reminders after inactivity (adaptively around 20 minutes apart, within a 10-30 minute window).
- Notification generation is local/on-device.
- No remote marketing push campaigns from backend.

## Recommended App Store Connect answers (practical)

Because app data is stored locally and not transmitted, answer conservatively and consistently with policy:

1. **Data Used to Track You**: **No**
2. **Data Linked to You**: **No** (no account/profile linkage)
3. **Data Not Linked to You**:
   - If Connect requires disclosure for local-only diagnostic/app-function state, disclose the minimum category needed for **App Functionality**.
   - If current legal interpretation for your submission treats strictly on-device non-transmitted data as non-collected, keep answers aligned across:
     - App Privacy form
     - Privacy Policy (`docs/privacy-policy.md`)
     - App Review Notes (`docs/app-store-metadata.md`)

## Reviewer-facing consistency checklist

- [ ] Privacy Policy URL is live and matches this mapping.
- [ ] App Review Notes explicitly state "no account/login" and "data stays on device".
- [ ] In-app behavior (notifications, local adaptation) matches metadata text.
- [ ] No claims about cloud analytics or personalized ads.
