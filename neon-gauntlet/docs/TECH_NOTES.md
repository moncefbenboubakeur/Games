# Technical Notes

## Why This Folder Exists

This game is isolated from Youtube++ so agents can iterate on gameplay, visuals, and tests without blocking app work or polluting the app git history.

## Runtime

`serve.mjs` is a tiny no-dependency static server. It serves this folder only and disables cache with `cache-control: no-store`.

## Smoke Test

From the Games repo root:

```sh
npm run smoke:neon
```

The smoke test:

- starts `neon-gauntlet`
- opens `http://127.0.0.1:4177/`
- clicks the start button
- confirms player, level, enemies, canvas, and assets exist
- fails if resources import from Youtube++
- writes `test-results/neon-gauntlet-smoke.png`

## Current Architecture Debt

The game is still one large HTML file. For long-term work, split it into:

- renderer
- input
- combat
- actors
- levels
- assets
- UI

Future new games should use Phaser + TypeScript + Vite from the start.
