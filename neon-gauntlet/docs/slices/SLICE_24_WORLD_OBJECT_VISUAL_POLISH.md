# Slice 24: World Object Visual Polish

## Goal

Replace ugly abstract world-system rectangles with readable in-world props, hazards, and background actors.

## Root Cause

`PropSystem`, `NpcSystem`, and `HazardSystem` were drawing gameplay objects as plain colored rectangles. In screenshots these looked like random fixed and moving blocks, especially the cyan/magenta background NPCs and prop markers.

## Scope

- Render props as small semantic pixel objects:
  - cabinet,
  - crate,
  - barrel,
  - stall/container-door.
- Render NPC/background actors as subtle silhouettes, drones, warning lights, or indicator lights based on their purpose/id.
- Render hazards as readable effects:
  - spark arcs,
  - steam gusts,
  - rolling cart silhouettes.
- Keep collision, scoring, damage, and debug snapshots unchanged.
- Add focused visual-state tests that assert world objects no longer use raw rectangle placeholders.

## Quality Rules

- Moving background objects must look like something: person, light, drone, indicator, or environmental effect.
- Gameplay hazards must telegraph but should not look like generic UI boxes.
- Props can remain code-native pixel art, but they must have recognizable silhouettes.
- Do not touch `Youtube++`.
- Do not commit `public/assets/backgrounds/Temp/`.

## Verification

- `npm run test:e2e -- tests/e2e/world-systems.spec.ts`
- `npm run test:e2e -- tests/e2e/all-stages.spec.ts --project=desktop -g "stage-10-neon-core" --workers=1`
- `npm test`
- `npm run build`

## Done Means

- The fixed and moving world objects read as intentional scene objects.
- World-system behavior still works.
- A representative screenshot confirms no obvious colored-box placeholders remain.
