# Slice 18: Boss Art Uniqueness Gate

## Goal

Make final boss art debt explicit in the release gate.

Playable bosses are not enough. Bosses must eventually have unique production-quality sprite sheets, not reused prototype sheets. Slice 15 added playable boss ids for stages 5-10 using temporary texture stand-ins; this slice ensures those stand-ins are visible as release blockers.

## Scope

- Extend `npm run test:release` with boss-art blockers.
- Report any boss texture used by more than one boss.
- Include all boss ids sharing that texture in the blocker reason.
- Add a unit test proving reused boss sheets are blocked.

## Quality Rules

- Every production boss needs its own identity and sprite sheet.
- Runtime stand-ins may exist, but release readiness must reject them.
- Do not mark existing boss sheets as approved.

## Non-Goals

- Do not generate final boss sheets in this slice.
- Do not replace current playable stand-ins.
- Do not touch `Youtube++`.

## Verification

- `npm run test:release`
- `npm test`
- `npm run build`

## Done Means

- The release report has explicit `boss-art` blockers for reused boss textures.
- Future final boss-sheet replacement work has a precise automated target.
