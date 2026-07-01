# Technical Notes

## Why This Folder Exists

This game is isolated from Youtube++ so agents can iterate on gameplay, visuals, and tests without blocking app work or polluting the app git history.

## Runtime

The primary runtime is now Phaser + TypeScript + Vite. The legacy Canvas prototype remains under `legacy/`.

`serve.mjs` is retained for serving the legacy prototype.

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

The primary game is now modular TypeScript. Remaining debt:

- stage visuals still use a bitmap background rather than full tile layers
- boss art is not production quality
- screenshot baseline set is still small
- current audio is placeholder generated WAV
- current commercial asset provenance is incomplete
