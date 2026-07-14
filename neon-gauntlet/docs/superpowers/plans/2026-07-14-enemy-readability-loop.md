# Enemy Readability Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve first-wave visual believability by reducing the runner enemy's neon-green wash while preserving its role distinction.

**Architecture:** Apply a contained palette transformation to `runner-sheet.png` only. Keep animation metadata, frame layout, and gameplay unchanged. Verify with focused browser tests, in-game screenshot inspection, build, and full desktop e2e.

**Tech Stack:** Phaser 4, TypeScript, Vite, ImageMagick, Playwright.

## Global Constraints

- Work only inside `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Do not change animation frame coordinates.
- Do not alter unrelated enemy/boss sheets.
- Do not commit reference videos or scratch screenshots.

---

### Task 1: Runner Palette Cleanup

**Files:**
- Modify: `public/assets/sprites/enemies/runner-sheet.png`

**Interfaces:**
- Consumes: existing `runner-sheet.png` dimensions `1536x1024`.
- Produces: same path, same dimensions, improved color palette.

- [x] **Step 1: Preserve dimensions and layout**

Confirm:

```bash
sips -g pixelWidth -g pixelHeight public/assets/sprites/enemies/runner-sheet.png
```

Expected: `1536x1024`.

- [x] **Step 2: Apply palette transform**

Use ImageMagick to reduce neon green/cyan dominance while preserving alpha and dark outlines. Transform the runner toward a teal/blue jacket with natural skin tones and less glow.

- [x] **Step 3: Inspect the sheet**

Open the transformed sheet visually and reject it if the silhouette becomes muddy or the green glow remains dominant.

- [x] **Step 4: Inspect in-game first encounter**

Capture `/tmp/neon-runner-readability.png` around 2600ms and compare it against the prior screenshot and reference audit.

- [x] **Step 5: Verify**

Run:

```bash
npm run test:e2e -- tests/e2e/enemy-ai.spec.ts tests/e2e/enemy-facing.spec.ts --project=desktop --workers=1
npm run build
npm run test:e2e -- --project=desktop --workers=1
```

- [x] **Step 6: Commit and push**

Commit:

```bash
git add docs/superpowers/plans/2026-07-14-enemy-readability-loop.md public/assets/sprites/enemies/runner-sheet.png
git commit -m "improve runner enemy readability"
git push
```
