# Spiral Regression Checklist

Use this checklist before release whenever animation/layout is changed.

## Visual Position

- [ ] Open `index -> trigger -> action -> explanation -> return` and confirm the spiral stays in the same vertical slot.
- [ ] Rotate the device (portrait/landscape where supported) and verify the spiral remains centered in the slot.
- [ ] Check at least one compact device and one large device/emulator to ensure the spiral does not jump.

## Interaction

- [ ] Confirm the spiral remains the primary interaction element on every flow screen.
- [ ] Tap the spiral on each screen and verify navigation is correct.

## Animation Stability

- [ ] Confirm there is no visible vertical "bounce" while the spiral breathes (only scale/opacity).
- [ ] On `find_three_things`, verify items fade in smoothly with longer search pauses.
- [ ] On `triangle_breath`, verify `вдих` and `видих` fade in/out while `затримка` remains constantly visible.

## Automated Safety Net

- [ ] Run `npm test -- --runInBand` and ensure `ui-regression.test.ts` passes.
