# Slice 21: All-Stage Review Packets

## Goal

Create visual review packets for every playable stage so final art, layout, and responsive readability can be reviewed against real screenshots instead of guesses.

## Scope

- Extend `tools/capture-map-preview.mjs` with `--all` support.
- Generate a top-level map preview index with packet status for all ten levels.
- Add `tools/validate-review-packets.mjs` to verify every level has desktop, phone, and TV screenshots plus a README.
- Add `npm run test:review-packets`.
- Capture missing stage packets for stages 5-10.

## Quality Rules

- Do not mark screenshots as production approval.
- Keep packets honest about prototype and stand-in scene plates.
- Do not touch `Youtube++`.
- Do not commit `public/assets/backgrounds/Temp/`.

## Implementation Plan

1. Refactor the capture tool so one function captures one map and `--all` loops through the level production plan.
2. Add an index writer that lists packet status, production status, boss id, and next step for each stage.
3. Add a validator that fails when a level packet is missing `README.md`, `desktop.png`, `phone.png`, or `tv.png`.
4. Add a package script for the validator.
5. Run the dev server if needed, capture all map packets, validate packets, run map/release/unit/build checks, then commit and push.

## Verification

- `npm run capture:map -- --all`
- `npm run test:review-packets`
- `npm run test:maps`
- `npm run test:release`
- `npm test`
- `npm run build`

## Done Means

- `docs/reviews/map-previews/` contains review packets for all ten stages.
- Review packets can be regenerated in one command.
- Missing screenshots or packet READMEs fail an automated check.
