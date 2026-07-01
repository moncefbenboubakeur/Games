# Style Guide

## SNES-Inspired Browser Games

- Internal resolution: `320x180` for widescreen games or `256x224` for classic 4:3.
- Tile size: `16x16`.
- Common sprite sizes: `16x16`, `24x24`, `32x32`, or larger boss sprites made from multiples of 16.
- Frame rate target: 60 FPS.
- Use frame-by-frame spritesheets.
- Use parallax backgrounds only when they remain pixel crisp.
- Avoid blurred CSS transforms.
- Use limited palettes per area.
- Keep UI readable at native resolution.

## Controls

Every game should support:

- keyboard
- touch controls
- gamepad when practical

TV/controller play should not require mouse hover or tiny buttons.

## Asset Naming

Use explicit names:

```text
hero_sami_idle.png
hero_sami_run.png
enemy_beetle_walk.png
tileset_ruins.png
item_crystal_shard.png
ui_heart.png
level_theme.ogg
jump.wav
```

## Commercial Safety

Use original characters, worlds, names, and music. Do not use sprites, music, maps, names, or characters from Nintendo/SNES-era games.
