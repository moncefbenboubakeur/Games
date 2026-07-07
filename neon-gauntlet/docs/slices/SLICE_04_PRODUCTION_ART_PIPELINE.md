# Slice 4: Production Art Pipeline

## Goal

Add an intake workflow for scene plates and large prefabs so the harness can accept high-quality art without losing source/license/approval discipline.

## Problem

The target map quality requires scene-level art. But generated/imported art can still be unusable if dimensions are wrong, licensing is unknown, or it has not been visually reviewed. The harness needs an explicit intake gate.

## Deliverables

- Add `public/data/map-art.json` as the map-art manifest.
- Add `tools/validate-map-art.mjs`.
- Add `npm run test:map-art`.
- Manifest records:
  - asset key,
  - file path,
  - role,
  - map id,
  - dimensions,
  - source,
  - author,
  - license,
  - commercial-use status,
  - approval status,
  - review notes.
- Validator checks:
  - referenced file exists,
  - dimensions are positive,
  - required metadata is present,
  - production-approved assets cannot have unknown/blocked commercial status,
  - scene plates are large enough for the game viewport.
- Add a production art intake checklist.

## Execution Steps

1. Create manifest with current Stage 1 scene plate and prototype tileset.
2. Add validator script.
3. Add checklist docs.
4. Add package script.
5. Run:
   - `npm run test:map-art`
   - `npm run test:maps`
   - `npm test`
   - `npm run build`
6. Commit and push.

## Done Criteria

- Current Stage 1 art is tracked in a dedicated map-art manifest.
- Blocked/unknown licensing is allowed only when approval status is not production-approved.
- Future production-approved art must have usable commercial status.
- Missing files or bad dimensions fail the gate.
