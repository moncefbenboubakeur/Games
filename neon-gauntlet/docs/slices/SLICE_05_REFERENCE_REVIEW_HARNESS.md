# Slice 5: Reference Review Harness

## Goal

Create a repeatable visual review harness so map quality is compared against a reference before anyone says a level is done.

## Problem

Automated screenshots can prove stability, but they cannot decide whether a map looks professional. The harness needs a standard review artifact that captures current screenshots and records the required human comparison.

## Deliverables

- Add `tools/capture-map-preview.mjs`.
- Add `npm run capture:map`.
- Capture screenshots for:
  - desktop,
  - phone,
  - TV.
- Save review artifacts under `docs/reviews/map-previews/<map-id>/`.
- Generate a Markdown report with:
  - captured files,
  - reference target,
  - map contract summary,
  - art intake summary,
  - visual review checklist.
- Keep committed reference targets lightweight and text-based.

## Execution Steps

1. Add capture script using Playwright.
2. Reuse existing dev server when available.
3. Add `--no-browser`/metadata-only path if needed later.
4. Capture current Stage 1 review artifacts.
5. Run full checks.
6. Commit and push.

## Done Criteria

- One command captures review screenshots and report.
- Report makes it impossible to confuse “tests passed” with “visual quality approved.”
- Current Stage 1 has a review artifact checked into docs.
