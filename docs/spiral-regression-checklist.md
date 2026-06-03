# Spiral Regression Checklist

Use this checklist before release whenever animation/layout is changed.

## Visual position & one spiral

- [ ] Open `index -> trigger -> action -> return` and confirm the spiral stays in the **same vertical slot** (anchored layout).
- [ ] On **feet**, **find three things**, and **trigger/return/index**, the spiral should **look identical** (same rings, size, shadow — shared `SpiralRings` / `spiral-visual`).
- [ ] **Triangle breath** uses the same ring art; only the **timing** of scale/opacity differs (longer inhale/exhale cycle).
- [ ] Rotate the device (portrait/landscape where supported) and verify the spiral remains centered in the slot.
- [ ] Check at least one compact device and one large device/emulator to ensure the spiral does not jump.

## Interaction (tap)

- [ ] Tap the spiral on **each** flow screen and verify navigation / completion (spiral is wrapped in `Pressable`; layer has `zIndex` + `elevation`).
- [ ] If tap feels dead, check Android: spiral layer should stay **above** the `ScrollView` hit target (`AnchoredSpiralScreen` spiral `elevation`).
- [ ] **About** on onboarding footer only; **Show my paths** / **Мої шляхи** only on **trigger** and **return** (opens `app/paths.tsx`).

## Copy order (“tap the spiral”)

- [ ] On **onboarding**: “How it works:” + four steps; **Tap the spiral — it's the button here** appears **inline last** (after all steps, `getOnboardingSpiralHintDelayMs`).
- [ ] On trigger, action (feet / find 3), return: short “tap the spiral” / “торкнись спіралі” **under the spiral**, **after** all screen copy (`getFlowSpiralHintDelayMs` / gated reveal on find 3 & triangle).
- [ ] For the **first 3 completed cycles**, the hint is visible on **every** flow screen (no random hide per screen).
- [ ] On **triangle breath**, the under-spiral hint appears only **after 3 complete breath cycles**; spiral animates during intro + triangle rhythm.
- [ ] On return, **Save this for me** / **Збережи це для мене** sits below the explanation block (smaller hint style).

## Animation stability

- [ ] Confirm there is no visible vertical “bounce” while the spiral breathes (only scale/opacity).
- [ ] On `find_three_things`, verify three bullets appear one at a time (tap or every 2s, `findThreeThings.autoRevealIntervalMs`).
- [ ] Run find 3 **twice in a row** (via trigger rotation): prompt set should **change** (7 variants in `find-three-variants.ts`; same set not twice in a row).
- [ ] On **find 3**, spiral tap **before** all bullets are shown only reveals the next bullet (does not go to return).
- [ ] After all three bullets (and optional “tap the spiral” hint), spiral tap goes to return — no auto-advance.
- [ ] On return after find 3, explanation is a short single sentence and rotates across variants.
- [ ] Action → return: only **one** return screen (back does not land on return again); copy on return starts after fade (`returnScreen.primaryDelayMs`).
- [ ] On `triangle_breath`, verify phase words (`inhale` / `hold` / `exhale`) crossfade gently; **both** holds show “hold / затримка”.
- [ ] On `triangle_breath`, feel haptic at **inhale start** and **exhale start** (device build, not Expo Go only).
- [ ] On return, **Save this for me** fades out on tap; second visit with same intervention does **not** show the button again.
- [ ] With **Accessibility XXL** text size, onboarding scrolls; About / paths footer links remain reachable.
- [ ] Onboarding shows **How it works** steps + **tap the spiral** last; not “one action for you now?” on first screen.
- [ ] Under-spiral hint is **closer to the spiral** and **farther from** main text on trigger / action / return (`hintOverlap`, `hintToContentGap`).

## Automated safety net

- [ ] Run `npm test -- --runInBand` and ensure `ui-regression.test.ts` passes.
