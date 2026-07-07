# Production Art Intake Checklist

Use this checklist before any scene plate, tileset, foreground, or large prefab becomes production art.

## Required Metadata

- Asset key.
- File path.
- Map/level id.
- Role: `scenePlate`, `parallaxPlate`, `foregroundPlate`, `tileset`, or `prefab`.
- Pixel dimensions.
- Source.
- Author.
- License.
- Commercial-use status.
- Approval status.
- Review notes.

## Approval Rules

- `prototype` means the asset may be used in local builds, but not release builds.
- `needs-review` means the asset is a candidate and needs visual/source/license review.
- `production-approved` means it has passed visual review and commercial-use review.
- Production-approved assets cannot have:
  - unknown source,
  - unknown author,
  - unknown license,
  - blocked commercial-use status.

## Visual Review

Compare against the target reference:

- Does it look like a finished scene, not filler?
- Is the first viewport dense and readable?
- Are player/enemy silhouettes readable?
- Are lanes and interactable spaces clear?
- Are foreground elements adding depth without hiding actors or controls?
- Does the art style match character sprites?

## Technical Review

Run:

```sh
npm run test:map-art
npm run test:maps
npm run test:screenshots
```

Do not call the map done until the art and gameplay metadata both pass.
