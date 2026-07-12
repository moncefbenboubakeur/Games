# Slice 17: All Stage Smoke Coverage

## Goal

Add browser coverage that starts every stage directly and confirms the stage is playable enough for future work.

Slice 15 created the ten-stage backbone. This slice makes sure all ten stages stay loadable while art, mechanics, audio, and boss work continue.

## Scope

- Add a Playwright spec that starts stages 1-10 directly.
- Verify each stage exposes:
  - correct level id,
  - expected boss id,
  - at least one enemy,
  - at least one hazard,
  - at least one prop,
  - at least one NPC,
  - scene plate rendering,
  - no visible prototype tile layers.
- Keep the test focused and data-driven.

## Quality Rules

- Do not rely on only stage 1 or stage 10 smoke tests.
- Use public automation hooks, not hidden app state when possible.
- Keep the test compatible with desktop, phone, and TV projects.

## Non-Goals

- Do not perform a full combat playthrough.
- Do not update screenshots.
- Do not touch `Youtube++`.

## Verification

- `npm run test:e2e -- tests/e2e/all-stages.spec.ts`
- `npm test`
- `npm run build`

## Done Means

- A broken level id, missing boss, missing stage systems, or missing scene plate fails quickly.
