# Slice 6: Ten-Level Production Manifest

## Goal

Define the full ten-level production pipeline before generating more playable files. Each level needs a scenario, art direction, gameplay hook, boss concept, and production status so the game grows intentionally instead of becoming a pile of placeholders.

## Problem

The harness can now create valid map scaffolds, inspect maps, validate art intake, and capture review screenshots. The next risk is creating ten low-quality placeholder stages and mistaking volume for progress. We need a manifest that records the intended quality and required work for each level before files are generated.

## Deliverables

- Add `public/data/level-production-plan.json`.
- Add `docs/LEVEL_PRODUCTION_PIPELINE.md`.
- Add `tools/validate-level-production-plan.mjs`.
- Add `npm run test:levels`.

## Manifest Requirements

Each stage entry must include:

- `id`
- `name`
- `order`
- `scenario`
- `artTarget`
- `scenePlatePrompt`
- `gameplayHook`
- `boss`
- `bossMechanic`
- `productionStatus`
- `nextHarnessStep`

Allowed `productionStatus` values:

- `concept`
- `needs-scene-plate`
- `needs-map`
- `needs-boss`
- `vertical-slice`
- `production-approved`

## Validation Rules

- Exactly ten unique stages.
- Orders are 1 through 10.
- Stage ids are unique.
- Boss ids are unique.
- Every field is non-empty.
- No level can be `production-approved` unless it has a review packet and approved art status.
- Stage 1 must point to the existing map/review packet.

## Execution Steps

1. Create the manifest with the ten teen-friendly original levels.
2. Add validation script.
3. Add production pipeline documentation.
4. Add `npm run test:levels`.
5. Run:
   - `npm run test:levels`
   - `npm run test:map-art`
   - `npm run test:maps`
   - `npm test`
   - `npm run build`
6. Commit and push.

## Done Criteria

- The ten-level roadmap is machine-checkable.
- The repo knows the difference between concept levels and production-approved levels.
- Future generation can consume this manifest rather than improvising level names and bosses.
