# Switchblade Scale Readability Loop Plan

**Goal:** Make the first boss read closer to the hero/enemy pixel density so the sprite does not look like an over-scaled rough texture during Stage 1.

**Reference Problem:** In the current audit screenshot, Switchblade Sora faces the hero correctly while walking left, but his enlarged scale makes the imported/generated sheet look lower quality than the hero and normal enemies.

**Scope:**

- Keep the existing `switchblade-sora-sheet.png`.
- Keep the existing source-facing metadata and facing tests.
- Adjust only the first boss presentation scale unless verification shows a functional regression.
- Do not commit reference videos, screenshots, temp backgrounds, or incoming boss source files.

## Steps

- [x] Capture the current forced boss-walk screenshot and confirm whether facing is a code problem or an art/scale problem.
- [x] Reduce Switchblade Sora's configured scale to preserve boss presence while improving pixel density.
- [x] Capture the same forced boss-walk screenshot after the change.
- [x] Run focused boss/enemy facing tests.
- [x] Run build and full desktop e2e.
- [x] Commit and push the scoped change.
