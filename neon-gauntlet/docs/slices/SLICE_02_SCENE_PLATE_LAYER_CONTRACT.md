# Slice 2: Scene Plate Layer Contract

## Goal

Make the hybrid map contract explicit and enforceable. A production map must say exactly how each image layer should render, and tooling must report whether a map is production-safe or only prototype-safe.

## Problem

The previous tile-only pass technically used Tiled layers, but it created an ugly repeated wall and accidentally hid the real quality target. The harness needs guardrails so this cannot happen again.

## Deliverables

- Document map layer conventions in `docs/MAP_LAYER_CONVENTIONS.md`.
- Require every visible image layer to declare one of:
  - `scenePlate`
  - `parallaxPlate`
  - `tile`
- Reject unknown image layer modes.
- Reject production maps without a visible `scenePlate`.
- Add a map inspection script:
  - reports scene plates,
  - reports parallax/tile image layers,
  - reports prototype tile layers,
  - reports visible prototype tile layers,
  - reports required gameplay object layers,
  - exits non-zero when the map violates the production contract.
- Add validation tests for missing/invalid image layer modes.

## Execution Steps

1. Add a shared Node map-contract helper for tooling.
2. Add `tools/inspect-map-art.mjs`.
3. Add `npm run inspect:map` and `npm run test:maps`.
4. Tighten `DataValidationSystem.validateMap`.
5. Update unit tests.
6. Run:
   - `npm run test:maps`
   - `npm test`
   - `npm run build`
   - focused visual E2E
7. Commit and push.

## Done Criteria

- The current Stage 1 map reports as production-safe.
- A missing scene plate fails.
- A visible image layer without `mode` fails.
- A bad image layer mode fails.
- Prototype tile layers may exist, but visible prototype layers are reported as unsafe.
