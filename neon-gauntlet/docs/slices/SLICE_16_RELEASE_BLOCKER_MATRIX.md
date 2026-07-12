# Slice 16: Release Blocker Matrix

## Goal

Make unfinished production work visible in the automated release gate.

Slice 15 made all ten planned stages playable, but playable is not production-ready. The release gate should explicitly report level-level blockers, not only texture/audio ledger blockers.

## Scope

- Extend `npm run test:release` to inspect `public/data/level-production-plan.json`.
- Add blockers for every level whose `productionStatus` is not `production-approved`.
- Include boss id and next harness step in each level blocker.
- Keep the current non-strict behavior: the command reports blockers but exits successfully unless `--strict` is used.
- Add a focused unit test for the release readiness script output.

## Quality Rules

- Do not mark any level production-approved.
- Do not hide prototype art debt.
- Keep release output useful for planning the remaining slices.

## Non-Goals

- Do not replace art/audio in this slice.
- Do not change gameplay balance.
- Do not touch `Youtube++`.

## Verification

- `npm run test:release`
- `npm test`
- `npm run build`

## Done Means

- Release readiness reports level-production blockers for all non-approved stages.
- Future production approval must pass through the explicit level plan.
