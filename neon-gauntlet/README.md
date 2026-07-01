# Neon Gauntlet

Standalone Phaser + TypeScript + Vite version of the SamiTube teen brawler prototype.

This folder is self-contained:

- `src/` - Phaser scenes, entities, systems, and utilities
- `public/assets/` - sprites, backgrounds, audio, and maps
- `public/data/` - data-driven levels, enemies, combat, animations, audio
- `tests/` - Vitest logic tests and Playwright screenshot tests
- `legacy/` - preserved original Canvas prototype
- `serve.mjs` - no-dependency static server for the legacy prototype

## Run

```sh
npm start
```

Open the printed URL, usually `http://127.0.0.1:4177/`.

## Verify

```sh
npm run test
npm run build
npm run test:screenshots
```

From the Games repo root:

```sh
npm run smoke:neon
```

## Legacy Prototype

```sh
npm run serve:legacy
```

Then open `http://127.0.0.1:4177/legacy/`.

## Controls

- Move: arrow keys or WASD
- Punch: J or Enter
- Kick: K
- Jump: Space
- Guard: L
- Touch: on-screen buttons

## Development Rule

This game must not import from Youtube++. If a shared helper changes, copy it into this repo intentionally so game work stays isolated from app work.
