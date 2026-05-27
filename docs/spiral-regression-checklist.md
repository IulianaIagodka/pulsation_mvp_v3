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
- [ ] **About** appears only on **onboarding** footer — not on trigger/action/return.

## Copy order (“tap the spiral” last)

- [ ] On onboarding, trigger, action (feet / find 3), return: “tap the spiral” / “торкнись спіралі” should become visible **after** the main instructional text on that screen (see `spiralHintTiming`).
- [ ] On **triangle breath**, the spiral hint appears only **after 3 complete breath cycles**, then briefly before optional auto-advance.

## Animation stability

- [ ] Confirm there is no visible vertical “bounce” while the spiral breathes (only scale/opacity).
- [ ] On `find_three_things`, verify three lines fade in (shape · color · feel) with staged delays (`findThreeThings.revealDelayMs`).
- [ ] Run find 3 **twice in a row** (via trigger rotation): prompt set should **change** (7 variants in `find-three-variants.ts`; same set not twice in a row).
- [ ] After the third line and “tap the spiral”, wait ~7s: auto-advance to return should feel unhurried (`pauseBeforeAdvanceMs`).
- [ ] On return after find 3, explanation matches: *Looking around slowly helps you return to where you are now.*
- [ ] Action → return: only **one** return screen (back does not land on return again); copy on return starts after fade (`returnScreen.primaryDelayMs`).
- [ ] On `triangle_breath`, verify phase words (`inhale` / `hold` / `exhale`) crossfade gently; **both** holds show “hold / затримка”.

## Automated safety net

- [ ] Run `npm test -- --runInBand` and ensure `ui-regression.test.ts` passes.
