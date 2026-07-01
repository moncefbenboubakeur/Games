# Neon Gauntlet Game Spec

## Concept

Neon Gauntlet is a teen-focused side-scrolling arcade brawler inspired by 16-bit console beat 'em ups. The player fights through neon districts, clears groups of rivals, and faces a boss at the end of each stage.

## Current Version

This is a standalone Canvas prototype exported from Youtube++ into `/Dev/Games/neon-gauntlet`.

## Core Loop

1. Start a stage.
2. Move across the street arena.
3. Fight regular enemies with punch, kick, jump, and guard.
4. Survive enemy attacks.
5. Spawn and defeat the stage boss.
6. Advance to the next stage.

## Controls

- Move: Arrow keys or WASD
- Punch: J or Enter
- Kick: K
- Jump: Space
- Guard: L
- Touch: on-screen buttons

## Technical Requirements

- Must run without Youtube++.
- Must load assets from this folder only.
- Must pass `npm run smoke:neon` from the Games repo root.
- Must keep pixel-art rendering crisp.
- Must support keyboard and touch.

## Not Included Yet

- Phaser/TypeScript modular structure
- Tiled/LDtk maps
- External JSON level data
- Audio assets
- Gamepad support
- Screenshot baseline comparison
