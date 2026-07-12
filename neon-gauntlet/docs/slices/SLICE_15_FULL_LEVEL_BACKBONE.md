# Slice 15: Full Level Backbone

## Goal

Make the remaining planned stages playable in the standalone Neon Gauntlet harness.

Stages 5-10 currently exist in the production plan only. This slice turns them into real data-driven levels that can be loaded, traversed, fought through, and verified by tests.

## Scope

- Add playable level JSON files for stages 5-10.
- Add Tiled-style map JSON files for stages 5-10.
- Wire stages 5-10 into chapter progression.
- Add boss definitions for the planned stage bosses.
- Add world-system definitions for hazards, props, and background NPCs on stages 5-10.
- Add map-art and asset-ledger entries for stage 5-10 prototype scene plates.
- Mark stages 5-10 as `vertical-slice` in the production plan.
- Add tests that verify all ten levels can be started directly and traversed in order.

## Quality Rules

- Keep levels JSON-driven.
- Keep maps Tiled-style with required object layers.
- Do not pretend reused/prototype art is final.
- Every stage must have at least one hazard, prop, and NPC purpose.
- Every boss phase hazard must exist in that stage.
- Stages must preserve PC/phone/TV automated loadability.

## Non-Goals

- Do not create final boss/player/enemy art in this slice.
- Do not approve licensing or commercial release.
- Do not touch `Youtube++`.
- Do not commit `public/assets/backgrounds/Temp/`.

## Verification

- `npm run test:levels`
- `npm run test:maps`
- `npm run test:map-art`
- `npm run test:release`
- `npm test`
- focused Playwright progression tests
- `npm run build`

## Done Means

- Stages 1-10 are present in the chapter list.
- Stages 5-10 have real level/map/world data.
- The game can start stage 10 directly.
- Progression can advance through the complete chapter.
- The release gate still blocks prototype/licensing issues honestly.
