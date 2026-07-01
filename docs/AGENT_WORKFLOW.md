# Agent Workflow

This repo is the game lab. Work here when creating or testing games. Do not edit `../Youtube++` unless the user explicitly asks to import a finished game back into the app.

## Core Rules

- Every game must run from its own folder.
- Every game must include its own runtime files, CSS, data, and assets.
- No game may import files from `../Youtube++`.
- Keep game work in small, reviewable steps.
- Update docs and task files when behavior changes.
- Run a smoke test before saying a game works.

## Preferred Stack For New SNES-Style Games

Use this for new games:

- Phaser + TypeScript + Vite
- Internal resolution: `320x180` or `256x224`
- 16x16 tiles, pixel-snapped camera, integer scaling
- Tiled or LDtk JSON for maps
- JSON data for enemies, items, dialogue, levels
- Playwright screenshots for browser smoke tests

Current `neon-gauntlet` is a standalone Canvas export from Youtube++. Future games should move toward the Phaser + TypeScript shape in `docs/ARCHITECTURE.md`.

## Standard Agent Loop

1. Read the game-specific `README.md`.
2. Read `docs/GAME_SPEC.md`, `docs/STYLE_GUIDE.md`, and `docs/TASKS.md` if present.
3. Implement only the next requested task.
4. Run the game-specific smoke test.
5. Save screenshots under `test-results/`.
6. Update task docs.
7. Commit only files in `/Dev/Games`.

## Verification Standard

For a game to be considered checked:

- The local server starts.
- The menu/title appears.
- The game can start.
- Player state exists.
- Main assets load from this repo, not Youtube++.
- A screenshot is captured.
- Console errors are empty or explained.
