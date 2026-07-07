# Slice 3: Map Template Generator

## Goal

Create a repeatable way to start new levels with the correct hybrid structure from the beginning.

## Problem

If each level is created manually, required layers will drift, asset ledger entries will be forgotten, and maps can regress into ugly prototype tile visuals. The harness should generate a correct starting point every time.

## Deliverables

- Add `tools/create-level-from-template.mjs`.
- Generator creates:
  - `public/data/levels/<id>.json`
  - `public/assets/maps/<id>.json`
  - `public/assets/backgrounds/<id>-scene-plate.svg`
  - `docs/generated-levels/<id>.md`
- Generated maps include:
  - one visible `scenePlate` image layer,
  - hidden prototype tile layers,
  - all required gameplay object layers,
  - starter player/enemy/boss/trigger objects.
- Add `npm run create:level`.
- Add a dry-run/check mode so tests can validate output without polluting real production data.
- Add a fixture generated level under `docs/generated-levels/examples/` or a temp target to prove the generator works.

## Execution Steps

1. Build generator arguments:
   - `--id`
   - `--name`
   - `--boss`
   - `--width`
   - `--dry-run`
   - `--out`
2. Reuse the map contract helper to validate generated maps.
3. Add generator docs.
4. Add script to package.json.
5. Verify with a temp generated level.
6. Run existing test gates.
7. Commit and push.

## Done Criteria

- A new level skeleton can be generated with one command.
- Generated map passes `validateMapContract`.
- Generated scene plate is clearly marked placeholder and not final art.
- No generated temp files remain after tests unless intentionally committed as examples.
