# Slice 14: Boss, Stage, And Gamepad Polish

## Goal

Upgrade the current first-pass mechanics into a stronger arcade brawler slice:

1. Bosses use richer data-driven phase mechanics:
   - alternate attack patterns,
   - projectile bursts,
   - support summons,
   - arena hazard triggers,
   - visible phase aura.
2. Stage systems feel more alive:
   - hazards animate by type,
   - props visually react and break,
   - NPCs move with readable ambient purpose,
   - projectiles use staged warning/impact feedback.
3. Gamepad/TV control becomes a real input path:
   - edge-triggered action buttons,
   - analog and d-pad movement,
   - deterministic test injection,
   - HUD hints for gamepad players.

## Quality Bar

- No boss mechanic may contradict the visible state.
- Boss phase changes must be readable before they become dangerous.
- Summons and projectiles must be real objects, not fake damage at a distance.
- Hazards must telegraph before damaging.
- Gamepad buttons must not spam actions every frame while held.
- All new behavior must be inspectable in `__NEON_DEBUG__`.

## Scope

### Stronger Boss Design

- Extend boss phase metadata with:
  - `alternateAttack`,
  - `patternCycleMs`,
  - `auraColor`,
  - `projectileBurst`,
  - `summonRole`,
  - `summonCount`,
  - `stageHazard`.
- Emit boss phase events from `Boss`.
- Let `WorldScene` respond by spawning support enemies, firing projectile bursts, and triggering stage hazards.
- Add a visible aura ring for active boss phases.

### Richer Stage Mechanics

- Add hazard forced-trigger support for boss phases.
- Add type-specific hazard animation polish.
- Add projectile impact flashes and better debug information.
- Keep props/NPCs data-driven and validated.

### Gamepad/TV Pass

- Replace held action button behavior with edge detection for punch/kick/jump/pause.
- Keep guard as a held action.
- Add `window.__NEON_TEST_GAMEPAD__` so Playwright can test gamepad behavior without real hardware.
- Add HUD gamepad hints.

## Non-Goals

- Do not mark any art/audio as production-approved.
- Do not build stages 5-10.
- Do not touch `Youtube++`.
- Do not commit `public/assets/backgrounds/Temp/`.

## Verification

- `npm run test:assets`
- `npm run test:levels`
- `npm run test:map-art`
- `npm run test:maps`
- `npm run test:audio`
- `npm run test:release`
- `npm test`
- focused Playwright:
  - world systems,
  - enemy AI,
  - input/gamepad,
  - retry/progression
- `npm run build`

## Done Means

- Boss phase changes have visible and mechanical consequences.
- Stages have more animated, stage-specific hazard/projectile feedback.
- Gamepad input is testable and does not repeat one-shot actions while held.
