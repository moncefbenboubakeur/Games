# Neon Gauntlet

Standalone version of the SamiTube teen brawler prototype.

This folder is self-contained:

- `index.html` - game entrypoint
- `_harness.js` - copied local game runtime
- `_game.css` - copied local shell styles
- `neon/assets/` - stage and sprite assets
- `serve.mjs` - no-dependency static server

## Run

```sh
npm start
```

Open the printed URL, usually `http://127.0.0.1:4177/`.

## Controls

- Move: arrow keys or WASD
- Punch: J or Enter
- Kick: K
- Jump: Space
- Guard: L
- Touch: on-screen buttons

## Development Rule

This game must not import from Youtube++. If a shared helper changes, copy it into this repo intentionally so game work stays isolated from app work.
