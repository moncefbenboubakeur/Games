# Neon Gauntlet Asset Ledger

Last updated: 2026-07-07

This ledger is the human-readable companion to `public/data/assets.json`.

## Release Rule

No asset is production-approved until it has:

- source,
- author,
- license,
- commercial-use permission,
- approval status,
- replacement plan if needed.

Unknown assets are allowed only for internal prototype work.

## Image Assets

| Key | File | Current status | Commercial status | Action |
| --- | --- | --- | --- | --- |
| `stage-01-bg` | `public/assets/backgrounds/stage-01-metro-arcade.png` | Prototype | Blocked | Replace with licensed Tiled/LDtk tilesets/layers or document source/license. |
| `metro-tiles` | `public/assets/tilesets/metro-tiles.svg` | Prototype | Blocked | Project-created pipeline tileset. Approve formally or replace with final licensed tileset art before release. |
| `player-sheet` | `public/assets/sprites/player-sheet.png` | Prototype | Blocked | Replace or formally document. Generate contact sheets for every cycle. |
| `enemy-sheet` | `public/assets/sprites/enemy-rival-sheet.png` | Prototype | Blocked | Replace or formally document. Contact sheet review required after every crop/frame edit. |

## Audio Assets

| Key | File | Current status | Commercial status | Action |
| --- | --- | --- | --- | --- |
| `music:stage-01` | `public/assets/audio/music/stage-01-loop.wav` | Placeholder | Blocked | Replace with final licensed music or approve as project-owned. |
| `sfx:punch` | `public/assets/audio/sfx/punch.wav` | Placeholder | Blocked | Replace/approve. |
| `sfx:kick` | `public/assets/audio/sfx/kick.wav` | Placeholder | Blocked | Replace/approve. |
| `sfx:hit` | `public/assets/audio/sfx/hit.wav` | Placeholder | Blocked | Replace/approve. |
| `sfx:jump` | `public/assets/audio/sfx/jump.wav` | Placeholder | Blocked | Replace/approve. |
| `sfx:hurt` | `public/assets/audio/sfx/hurt.wav` | Placeholder | Blocked | Replace/approve. |
| `sfx:guard` | `public/assets/audio/sfx/guard.wav` | Placeholder | Blocked | Replace/approve. |
| `sfx:stageClear` | `public/assets/audio/sfx/stage-clear.wav` | Placeholder | Blocked | Replace/approve. |

## Animation Approval Status

Contact sheets are generated into `docs/contact-sheets/` with:

```sh
npm run contact-sheets
```

Current approval state:

| Actor | Cycle | Status | Notes |
| --- | --- | --- | --- |
| player | idle | Needs review | Prototype crop. |
| player | walk | Needs review | Must compare leg alternation, baseline, and arms. |
| player | punch | Needs review | Needs future hitbox overlay. |
| player | kick | Needs review | Needs future hitbox overlay. |
| player | guard | Needs review | Should never leak into walk. |
| player | hurt | Needs review | Needs reaction timing review. |
| player | jump | Needs review | Needs z-height/baseline review. |
| enemy | idle | Needs review | Prototype crop. |
| enemy | walk | Needs review | Improved, but still requires contact-sheet approval. |
| enemy | punch | Needs review | Must match facing and hitbox direction. |
| enemy | kick | Needs review | Must match facing and hitbox direction. |
| enemy | guard | Needs review | Must only play for believable reasons. |
| enemy | hurt | Needs review | Needs reaction timing review. |
| enemy | jump | Needs review | Needs z-height/baseline review. |
| enemy | down | Needs review | Corpse lifetime currently 1.6 seconds. |
