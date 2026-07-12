# Slice 23: Production Approval Dossier

## Goal

Create a single production approval dossier that summarizes audio approval, visual art blockers, map-art blockers, level-production blockers, and boss-art replacement needs.

## Scope

- Add `tools/export-production-approval-dossier.mjs`.
- Add `npm run release:dossier`.
- Generate `docs/release/production-approval-dossier.md`.
- Keep release blockers honest; do not mark unknown/prototype art as approved.

## Quality Rules

- Production approval requires source, author, license, and commercial-use status.
- Project-owned audio may be listed as approved because Slice 20 replaced the cues and source generator.
- Prototype sprites, generated derivative boss/enemy sheets, unapproved map art, and vertical-slice levels remain blocked.
- Do not touch `Youtube++`.
- Do not commit `public/assets/backgrounds/Temp/`.

## Implementation Plan

1. Read `assets.json`, `map-art.json`, `audio-sources.json`, `level-production-plan.json`, `bosses.json`, and the release readiness script output.
2. Write a Markdown dossier with approved audio, blocked texture assets, blocked map art, blocked levels, shared boss sheets, and required next actions.
3. Add an npm script to regenerate the dossier.
4. Run dossier generation, release check, unit tests, build, commit, and push.

## Verification

- `npm run release:dossier`
- `npm run test:release`
- `npm test`
- `npm run build`

## Done Means

- The repo has a current production approval dossier.
- Audio is documented as approved.
- Visual art/licensing debt is explicit and cannot be mistaken for release-ready status.
