# Entry Composition Loop Plan

**Goal:** Make staged enemy entries feel closer to the Return of Double Dragon reference by keeping edge entry credible while bringing threats into readable screen composition sooner.

**Reference pressure:** The reference keeps enemies entering from edges/doors, but they become visible and stage around the player quickly. Neon Gauntlet's first encounter now spawns from the edge, but the first visual review still showed enemies too peripheral.

## Constraints

- Work only inside `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Keep enemies entering from outside the screen at spawn time.
- Do not regress facing, keyboard/touch/gamepad, or projectile checks.
- Commit this as a separate loop after verification.

## Task 1: Tighten Edge Entry Distance

- [x] Reduce the offscreen entry margin enough that enemies enter quickly, while still spawning outside the camera.
- [x] Increase per-enemy spacing slightly so two enemies do not visually stack at the edge.
- [x] Preserve left/right entry based on spawn target relative to player reference.

## Task 2: Add Regression Coverage

- [x] Extend the initial enemy entry test to prove enemies start outside the camera.
- [x] Add a timed composition assertion that, after a short beat, at least one enemy has entered the visible playfield and the first wave is horizontally separated.

## Task 3: Visual Review

- [x] Capture the first encounter after the timed entry beat.
- [x] Inspect the screenshot against the reference audit.
- [x] Note any remaining visual gap honestly.

## Task 4: Verification And Commit

- [x] Run focused e2e for encounter/facing.
- [x] Run `npm run build`.
- [x] Run full desktop e2e if focused checks pass.
- [x] Commit and push only scoped files.
