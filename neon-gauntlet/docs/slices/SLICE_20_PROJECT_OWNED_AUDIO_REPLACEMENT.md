# Slice 20: Project-Owned Audio Replacement

## Goal

Replace the placeholder audio cues with reproducible project-owned original WAV files and clear the audio release blockers without hiding any remaining art or level-production debt.

## Scope

- Add a deterministic local audio generator under `tools/generate-project-audio.mjs`.
- Regenerate the active music loop and all active SFX files under `public/assets/audio/`.
- Update `public/data/audio-sources.json` so every active cue is marked `production-approved` with project-owned metadata.
- Update the audio section of `public/data/assets.json` with the same project-owned metadata.
- Update audio/license documentation so it no longer describes the active cues as placeholders.
- Add release-readiness test coverage proving audio blockers are gone while unrelated production blockers remain visible.

## Quality Rules

- No external audio sources are introduced.
- The generated sounds must be original procedural cues created for this project.
- Do not mark texture, map-art, level, or boss-art blockers as approved in this slice.
- Keep `public/assets/backgrounds/Temp/` untracked and untouched.
- Do not touch `Youtube++`.

## Implementation Plan

1. Create `tools/generate-project-audio.mjs` with a small PCM WAV writer, oscillators, envelopes, and cue render functions.
2. Render one loopable stage music cue and seven arcade-action SFX cues.
3. Update audio source manifests to production-approved project-owned metadata.
4. Update docs to explain the new project-owned audio pipeline and remaining production blockers.
5. Add a release-readiness test that asserts `audio-ledger` and `audio-source` blockers are absent.
6. Run audio validation, release reporting, unit tests, build, then commit and push.

## Verification

- `node tools/generate-project-audio.mjs`
- `npm run test:audio`
- `npm run test:release`
- `npm test`
- `npm run build`

## Done Means

- Active audio files are generated original project assets.
- Audio manifests are internally consistent and production-approved.
- Release readiness no longer reports audio blockers.
- Remaining blockers are still reported honestly for visual art, map art, boss art, and level production.
