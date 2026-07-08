# Slice 13: World Systems And Art Roles

## Goal

Move Neon Gauntlet beyond simple enemies on a background by adding stage-specific world systems and stricter character art slots:

1. Enemy roles use separate texture keys instead of one generic rival sheet.
2. Bosses gain explicit phase data and phase-aware behavior.
3. Stages can define hazards, props, NPC/background actors, and projectile rules from JSON.
4. Runtime behavior remains visually believable: no off-screen nonsense, no random actions without a reason, and no unapproved art pretending to be final.

## Quality Bar

- Every visible actor or object needs a purpose, a data definition, and a validation rule.
- Hazards must telegraph before damaging.
- Projectiles must originate from an actor action and move in the actor's facing direction.
- NPC/background actors are decorative unless explicitly promoted to gameplay.
- Enemy/boss art can improve through generated/imported candidate sheets, but production release stays blocked until art is documented and approved.

## Scope

### Better Enemy/Boss Art Slots

- Add role-specific enemy sprite sheets:
  - `striker-sheet`
  - `runner-sheet`
  - `bruiser-sheet`
  - `thrower-sheet`
- Wire enemy definitions to those texture keys.
- Keep generated sheets marked as `prototype-derived` in the asset ledger.
- Keep boss sheets separate and add boss phase metadata.

### Richer Gameplay Systems

- Add `public/data/world-systems.json` for:
  - hazards,
  - props,
  - NPC/background actors,
  - projectile definitions,
  - boss phase definitions.
- Add runtime systems:
  - `HazardSystem`
  - `PropSystem`
  - `NpcSystem`
  - `ProjectileSystem`
- Add stage-specific mechanics for China stages:
  - Stage 1: arcade sign spark hazard and cabinet props.
  - Stage 2: platform gate sparks and commuter NPC silhouettes.
  - Stage 3: steam vent hazard and crate props.
  - Stage 4: market cart hazard and lantern crowd ambience.
- Add thrower projectile behavior.
- Add boss phase changes at HP thresholds.

## Non-Goals

- Do not mark generated/derived sheets as production-approved.
- Do not touch the `Youtube++` app.
- Do not commit `public/assets/backgrounds/Temp/`.
- Do not build stages 5-10 in this slice.

## Implementation Plan

1. Generate role-specific enemy sheets from the current rival sheet as improved art slots.
2. Register role textures in `enemies.json`, `assets.json`, and preload.
3. Extend data types and validation for world systems, projectiles, hazards, props, NPC actors, and boss phases.
4. Implement modular runtime systems for hazards, props, NPCs, and projectiles.
5. Wire world systems into `WorldScene` update/shutdown/debug flow.
6. Add phase-aware boss behavior and tests.
7. Add visual/debug tests proving hazards, projectiles, NPCs, props, role textures, and boss phases are present.
8. Run verification, commit, and push.

## Verification

- `npm run enemy-role-sheets`
- `npm run test:assets`
- `npm run test:levels`
- `npm run test:map-art`
- `npm run test:maps`
- `npm run test:audio`
- `npm run test:release`
- `npm test`
- focused Playwright e2e checks for world systems and boss phases
- `npm run build`

## Done Means

- Enemy roles no longer all render from the same generic texture key.
- Throwers and selected bosses can use projectiles rather than fake long-range contact damage.
- Stages contain validated hazards, props, and NPC/background actors.
- Bosses visibly and mechanically change phase.
- Production release still honestly blocks unapproved generated art.
