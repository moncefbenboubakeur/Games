# Audio Sourcing And Approval

Audio is tracked in two places:

- Runtime cue data: `public/data/audio.json`
- Source/license approval data: `public/data/audio-sources.json`

## Current Status

The current music and SFX are usable for local prototype testing, but they are not production-approved. They are marked as `placeholder` and blocked from release until source files, author, license, and commercial-use permission are approved or replaced.

## Approval Rules

Before any cue can be production-approved:

- the cue must appear in `public/data/audio-sources.json`,
- `source`, `author`, `license`, `commercialUse`, `approvalStatus`, and `replacementPlan` must be filled,
- `approvalStatus` must be `production-approved`,
- no field may contain unknown, blocked, placeholder, or pending release status.

## Commands

```sh
npm run test:audio
npm run test:release
npm run release:check
```

`npm run test:release` reports whether release is currently blocked without failing local development. `npm run release:check` is strict and exits non-zero while blockers remain.
