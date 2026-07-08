# Slice 11: China Responsive Review Packets

## Goal

Turn the four playable China stages from "wired and playable" into reviewable vertical slices by generating desktop, phone, and TV screenshot packets for each stage.

## Why This Slice Exists

The level production manifest says the China stages still need responsive review shots after playtesting. The existing capture tool validates arbitrary map files, but the runtime screenshot flow must also start the matching level, otherwise later-stage packets can accidentally show Stage 1.

## Scope

- Add a test/harness entry point for starting a specific level from browser automation.
- Update the map capture tool so `--map-id` controls both the map contract and the runtime level shown in screenshots.
- Capture review packets for:
  - `stage-01-metro-arcade`
  - `stage-02-china-station`
  - `stage-03-china-back-alley`
  - `stage-04-china-night-market`
- Keep review packets as evidence, not production approval.
- Update documentation so the next work is clear.

## Non-Goals

- Do not mark assets or levels as `production-approved`.
- Do not modify raw temp background sources.
- Do not create new art or sprite sheets in this slice.
- Do not touch the SamiTube app repo.

## Implementation Plan

1. Add a browser automation helper that can start `WorldScene` at a requested level id.
2. Make `tools/capture-map-preview.mjs` call that helper with the `--map-id` value.
3. Add or update tests proving the helper starts Stage 4 directly.
4. Capture desktop, phone, and TV screenshots for each China stage.
5. Run the data, map, unit, focused e2e, and build verification stack.
6. Commit and push the slice.

## Verification

- `npm run test:levels`
- `npm run test:map-art`
- `npm run test:maps`
- `npm test`
- focused e2e check for direct level startup
- `npm run build`

## Done Means

- Every playable China map has a review packet under `docs/reviews/map-previews/<level-id>/`.
- Each packet screenshot actually shows the requested stage.
- The repo still clearly distinguishes review evidence from production approval.
