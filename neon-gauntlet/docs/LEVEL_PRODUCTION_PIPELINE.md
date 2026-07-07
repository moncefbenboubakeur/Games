# Level Production Pipeline

Neon Gauntlet levels are built from a manifest-first workflow:

1. Define the level in `public/data/level-production-plan.json`.
2. Generate a map scaffold with `npm run create:level`.
3. Produce or import a high-quality scene plate.
4. Register the art in `public/data/map-art.json`.
5. Validate:

```sh
npm run test:levels
npm run test:map-art
npm run test:maps
```

6. Capture review screenshots:

```sh
npm run capture:map -- --map-id <level-id>
```

7. Human-review the screenshots against the reference quality target.

## Status Meanings

| Status | Meaning |
| --- | --- |
| `concept` | Scenario and gameplay direction exist only in the production manifest. |
| `needs-scene-plate` | Map/data may exist, but production-quality scene art is missing. |
| `needs-map` | Art direction exists, but Tiled-style gameplay map data is missing. |
| `needs-boss` | Level shell exists, but boss behavior/content is incomplete. |
| `vertical-slice` | Playable enough for focused review, but not final. |
| `production-approved` | Art, gameplay, boss, licensing, and review have all passed. |

## Rule

Do not create ten weak playable levels just to increase the count. First create a strong manifest, then build one high-quality vertical slice at a time.
