# Slice 19: Stage Hazard Effects

## Goal

Make stage hazards feel more like stage-specific mechanics instead of identical damage rectangles.

Stages 5-10 need mechanics such as heat vents, wind gusts, glitch pulses, lightning, signal pulses, and reactor surges. This slice adds data-driven hazard impulse effects that can push the player horizontally or between lanes.

## Scope

- Add optional `forceX` and `forceLane` metadata to hazards.
- Validate hazard impulse metadata.
- Apply impulse only when a hazard actually hits the player.
- Add impulse data to stages 5-10.
- Expose impulse metadata in debug snapshots.
- Add unit coverage for the hazard metadata validation.

## Quality Rules

- Effects must be data-driven.
- Effects must not fire when the player is outside the visible hazard.
- Effects must not bypass existing invincibility rules.
- Hazards still need telegraphing before active damage/effects.

## Non-Goals

- Do not add new hazard art in this slice.
- Do not rebalance enemy AI.
- Do not touch `Youtube++`.

## Verification

- `npm test`
- `npm run test:e2e -- tests/e2e/world-systems.spec.ts`
- `npm run build`

## Done Means

- Stage hazards can now push/churn the player using JSON metadata.
- Validation catches invalid impulse metadata.
