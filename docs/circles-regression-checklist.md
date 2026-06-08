# Circles Regression Checklist

Use this checklist before release whenever animation/layout is changed.

## Visual position & one circles block

- [ ] Open `index -> trigger -> action -> return` and confirm circles stay in the **same vertical slot** (anchored layout).
- [ ] On **feet**, **find three things**, and **trigger/return/index**, circles should **look identical** (same concentric rings + center dot, 136px — shared `CirclesRings` / `circles-visual`).
- [ ] **Triangle breath** uses the same ring art; only the **timing** of scale/opacity differs (longer inhale/exhale cycle).
- [ ] Rotate the device (portrait/landscape where supported) and verify circles remain centered in the slot.
- [ ] Check at least one compact device and one large device/emulator to ensure circles do not jump.

## Interaction (tap)

- [ ] Tap circles on **each** flow screen and verify navigation / completion (circles are wrapped in `Pressable`; layer has `zIndex` + `elevation`).
- [ ] If tap feels dead, check Android: circles layer should stay **above** the `ScrollView` hit target (`PersistentCirclesLayer` elevation). Layer is **circles-sized only** (no full-screen overlay) so footer links stay visible and tappable.
- [ ] **About** on onboarding footer only; **Show my paths** / **Мої шляхи** only on **trigger** when there is today’s count or saved items — together with “One action for you”.
- [ ] **Save this for me** / **Збережи це для мене** pinned in the **footer** on return (not in scroll body); tap → **Saved** / **Збережено** (not clickable).

## Copy order (onboarding hint under circles)

- [ ] On **extended onboarding**: **Tap circles** fades in after **Pulsation exists…** has fully appeared (`getOnboardingCirclesHintDelayMs`); **How it works:** + four steps continue after the headline fades out.
- [ ] On **short onboarding**: same **Tap circles** hint under circles with the headline.
- [ ] On **trigger**, **action**, **return**: **no** tap hint under circles — slot reserved, visually quiet (`PersistentCirclesLayer`).
- [ ] On **trigger**: **One action for you** first; **Show my paths** with main copy when `hasPathsContent()`.
- [ ] On **return**: order is **You are here** → explanation (auto after main, or sooner on tap); **Save this for me** in footer when shown; **last tap** on circles continues to trigger.
- [ ] On return, **Save this for me** sits in the bottom footer (same zone as paths on trigger).

## Animation stability

- [ ] Confirm there is no visible vertical “bounce” while circles breathe (only scale/opacity).
- [ ] On `find_three_things`, verify three bullets appear one at a time (tap or every 2s, `findThreeThings.autoRevealIntervalMs`).
- [ ] Run find 3 **twice in a row** (via trigger rotation): prompt set should **change** (7 variants in `delivery-layer.ts`; same set not twice in a row).
- [ ] On **find 3**, circles tap **before** all bullets are shown only reveals the next bullet (does not go to return).
- [ ] After all three bullets, circles tap goes to return — no auto-advance.
- [ ] On return after find 3, explanation is a short single sentence and rotates across variants.
- [ ] Action → return: only **one** return screen (back does not land on return again); **You are here** fades in like action main copy (`getMainCopyDelayMs` + `copyReveal.fadeMs`).
- [ ] **One action for you**, **You are here**, and action main line (feet / find 3 / triangle) **start at the same Y** (`getTriggerMainCopyTop`); **no vertical jump** when explanation / bullets / hint appear.
- [ ] **Find 3 things:** — gap to first bullet matches return main → explanation (~10px layout + 16px margin); no large empty slot under the title.
- [ ] On `triangle_breath`, verify phase words (`inhale` / `hold` / `exhale`) crossfade gently; **both** holds show “hold / затримка”.
- [ ] On `triangle_breath`, feel haptic at **inhale start** and **exhale start** (device build, not Expo Go only).
- [ ] On return, **Save this for me** becomes **Saved** on tap (stays visible, not clickable); later visits with the same saved intervention do **not** show the control.
- [ ] With **Accessibility XXL** text size (Settings → Display → Larger Text): main line stays pinned; onboarding scrolls (pinned **How it works:**); About / paths scroll when overflow (`OverflowScrollView`); return explanation flows below main without shifting **You are here**.
- [ ] **Paths**: **Saved for you:** styled like «actions for yourself today»; saved list scrolls when many items.
- [ ] Onboarding shows **Pulsation exists…** → **tap circles** under circles, then **How it works** steps; not “one action for you now?” on first screen.

## Automated safety net

- [ ] Run `npm test -- --runInBand` and ensure `ui-regression.test.ts` passes.
