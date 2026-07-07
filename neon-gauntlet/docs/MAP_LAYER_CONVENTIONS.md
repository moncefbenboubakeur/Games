# Neon Gauntlet Map Layer Conventions

## Production Rule

Maps use high-detail scene plates for primary visible art and Tiled-style object layers for gameplay. Tiny prototype tiles may exist for blockout/editor work, but they must not become the primary visible stage unless replaced with production-quality art.

## Image Layers

Every visible image layer needs a `mode` property.

| Mode | Use | Rendering |
| --- | --- | --- |
| `scenePlate` | Primary high-detail scene plate | Fits the game viewport without repeating. |
| `parallaxPlate` | Large background/depth layer | Uses explicit scroll factors. |
| `tile` | Intentional repeating texture | Repeats only when `repeatX`/`repeatY` is deliberate. |

Do not rely on default image behavior. Silent repeating or stretching is treated as a map bug.

## Required Gameplay Object Layers

Production maps must include:

- `Collision`
- `PlayerSpawn`
- `EnemySpawns`
- `BossSpawn`
- `Triggers`
- `CameraZones`
- `Props`
- `NPCs`

The object layers are the gameplay contract. The scene art can be replaced without changing TypeScript as long as these layers remain valid.

## Prototype Tile Layers

Prototype/editor tile layers are allowed for planning and debugging:

- `BackgroundMid`
- `Decor`
- `Ground`
- `Foreground`

If a tile layer has `prototype = true`, it should usually be hidden. Visible prototype layers make the map prototype-safe only, not production-safe.

## Quality Gate

Before a map is called done:

1. `npm run test:maps` must pass.
2. Responsive screenshots must pass.
3. A human must compare the current screenshot against the quality reference.
4. Asset ledger entries must describe source, license, and commercial-use status.
