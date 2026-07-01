# Baseline

## Legacy Prototype

The original Canvas prototype is preserved under `legacy/`.

Run it with:

```sh
npm run serve:legacy
```

Then open:

```text
http://127.0.0.1:4177/legacy/
```

## Phaser Version

The primary version is now Phaser + TypeScript + Vite.

Run it with:

```sh
npm start
```

Then open:

```text
http://127.0.0.1:4177/
```

## Baseline Requirements

- Title/menu renders.
- Stage 1 starts.
- Player appears.
- Four regular enemies appear.
- Stage background appears.
- Assets load from this repo.
- No Youtube++ imports.
- Smoke screenshot is written to `../test-results/neon-gauntlet-smoke.png`.

## Known Gaps

- Phaser version is a remediation slice, not final boss-quality production gameplay.
- Stage 1 uses a Tiled-style object map for collision/spawns, while visuals still use the bitmap background.
- Audio files are original generated placeholders and should be replaced with polished music/SFX later.
- Boss currently reuses the regular enemy sprite with tint/scale treatment.
