# Neon Gauntlet Current State

Last updated: 2026-07-02

## Runtime

- Package: `neon-gauntlet`
- Location: `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`
- Stack: Vite + TypeScript + Phaser
- Dev server: `npm start` or `npm run dev` on `http://127.0.0.1:4177/`
- Build: `npm run build`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Screenshot tests: `npm run test:screenshots`
- Contact sheets: `npm run contact-sheets`

## Scenes

- `BootScene`
- `PreloadScene`
- `MenuScene`
- `WorldScene`
- `UIScene`
- `PauseScene`
- `GameOverScene`
- `StageClearScene`

## Entities

- `Player`
- `Enemy`
- `Boss`
- `Projectile`
- `Pickup`

## Systems

- `AnimationSystem`
- `AudioSystem`
- `CameraSystem`
- `CombatSystem`
- `GamepadSystem`
- `InputSystem`
- `SaveAdapter`
- `SpawnSystem`

## Data Files

- `public/data/animations.json`
- `public/data/assets.json`
- `public/data/audio.json`
- `public/data/bosses.json`
- `public/data/combat.json`
- `public/data/enemies.json`
- `public/data/levels/stage-01-metro-arcade.json`
- `public/assets/maps/stage-01-metro-arcade.json`

## Assets

- `public/assets/backgrounds/stage-01-metro-arcade.png`
- `public/assets/sprites/player-sheet.png`
- `public/assets/sprites/enemy-rival-sheet.png`
- `public/assets/audio/music/stage-01-loop.wav`
- `public/assets/audio/sfx/*.wav`

## Tests

- Logic:
  - `tests/logic/combat.test.ts`
- E2E:
  - `tests/e2e/input.spec.ts`
  - `tests/e2e/retry.spec.ts`
  - `tests/e2e/corpse.spec.ts`
  - `tests/e2e/enemy-facing.spec.ts`
  - `tests/e2e/enemy-ai.spec.ts`
  - `tests/e2e/visual.spec.ts`
- Existing visual baselines:
  - desktop
  - phone
  - TV

## What Already Matches The Migration Plan

- The game is isolated in the standalone `Games` repo.
- The game already uses Vite, TypeScript, and Phaser.
- Scenes and systems are split into multiple files.
- Gameplay data exists in JSON.
- Stage 1 now resolves its world width, visual background/ground layers, player spawn, enemy spawns, boss spawn, boss trigger, stage clear trigger, and camera bounds from the Tiled-style map.
- Keyboard, touch, gamepad, corpse timing, enemy facing, AI, retry, and screenshots have test coverage.

## Known Gaps

- Stage 1 still uses a single bitmap as the background image layer; it needs licensed tilesets/parallax art before commercial-quality map production.
- The Tiled-style map is now the runtime source for layout/spawns/triggers, but it does not yet have full editable tile layers or a production tileset.
- Level JSON still contains fallback layout values for safety during migration.
- Combat does not yet use explicit per-frame hitbox/hurtbox metadata.
- Animation approval is manual; contact sheets now exist but are not yet enforced in tests.
- There is one stage, not ten.
- Boss art currently reuses/enhances the regular enemy look rather than a unique boss sprite set.
- Asset licensing is not production-ready.
- Audio is placeholder-level and needs final sourcing/approval.

## Baseline Rule

Before large refactors, run:

```sh
npm run build
npm test
npm run test:e2e
npm run contact-sheets
```

For visual or animation work, inspect the generated contact sheets and compare against the real reference before marking work complete.
