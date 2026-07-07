# Hybrid Map Harness Plan

## Purpose

Build a map harness that can produce levels at the same visual quality target as the original Metro Arcade background, while keeping gameplay editable through Tiled/LDtk-style data.

The important lesson from the failed tile-only pass is simple: a professional beat-em-up background is not made from tiny repeated filler tiles. The player sees a dense scene plate with storefronts, signs, lighting, reflections, foreground depth, and readable gameplay lanes. Tiled/LDtk should describe how that scene plays, not force the art to become a cheap pattern wall.

## Target Standard

Every level should pass this visual bar before it is treated as playable:

- The first viewport must look like a finished illustrated scene, not a generated pattern.
- Ground, walls, signs, and props must have clear depth and lighting.
- Player/enemies must remain readable against the background.
- No stretched/ghosted legacy bitmap behind unrelated tile art.
- No tiny repeated tiles as the primary visual unless the tileset itself is production-grade.
- Foreground elements should create depth without covering controls or actors.
- Map data must still be editable without changing TypeScript.

## Architecture

Use a hybrid structure:

```text
public/assets/backgrounds/
  stage-01-metro-arcade.png        # high-detail scene plate

public/assets/maps/
  stage-01-metro-arcade.json       # Tiled-style map

public/assets/tilesets/
  metro-tiles.svg                  # prototype/debug/editor helper tiles

public/data/levels/
  stage-01-metro-arcade.json       # level contract
```

The map contains three categories of layers:

1. **Scene plate layers**
   - High-detail bitmap/image layers used for final visible scenery.
   - Rendered as intentional scene art, not repeated ghost backgrounds.
   - May be split later into `BackgroundFar`, `BackgroundMid`, `GroundPlate`, `ForegroundPlate`.

2. **Gameplay object layers**
   - `PlayerSpawn`
   - `EnemySpawns`
   - `BossSpawn`
   - `Triggers`
   - `CameraZones`
   - `Collision`
   - `Props`
   - `NPCs`

3. **Prototype/editor tile layers**
   - Optional helper layers for collision planning, blockout, and debug.
   - Hidden or low priority unless the tileset reaches final art quality.

## Harness Requirements

### 1. Scene Plate Renderer

Add explicit image-layer render modes:

- `scenePlate`: one high-quality scene image fills the playable viewport/world intentionally.
- `parallaxPlate`: large image layer with scroll factor for background depth.
- `tile`: repeated texture only for intentional repeating details.

Default image layers must not silently repeat.

### 2. Map Validation

Validation must enforce:

- At least one visible high-quality scene plate for production maps.
- Required gameplay object layers exist.
- Prototype tile layers may exist, but cannot be the only visible production art.
- Image layer render mode must be explicit.
- No active legacy background if the map claims to be tile-only.

### 3. Visual Quality Gate

Add map visual checks:

- Capture desktop, phone, TV screenshots.
- Assert scene-plate mode is active.
- Assert prototype tile layers are not the primary background in production mode.
- Human review compares current screenshot against the original reference.

### 4. Art Generation/Import Workflow

For each new level:

1. Define scenario and gameplay lane concept.
2. Generate/import one high-quality scene plate at reference quality.
3. Split into optional parallax/foreground plates when useful.
4. Add Tiled object layers for gameplay.
5. Add large reusable prefabs only if they match scene quality.
6. Run screenshot checks.
7. Update asset ledger and licensing status.

### 5. Future Production Tools

Add scripts later:

- `tools/create-level-from-template.mjs`
  - Creates level JSON, map JSON, object layers, and ledger stubs.
- `tools/inspect-map-art.mjs`
  - Reports image dimensions, aspect ratio, visible layer modes, and repeated tile usage.
- `tools/capture-map-preview.mjs`
  - Captures map screenshots for visual review.
- `tools/compare-map-reference.mjs`
  - Produces reference/current/diff previews.

## Execution Slices

### Slice 1: Restore Professional Visible Stage

- Make `BackgroundFar` a scene plate again.
- Do not render prototype tile layers as the main wall.
- Keep Tiled object layers active for spawns/triggers/camera/collision.
- Expose debug flags:
  - `scenePlates`
  - `tileLayers`
  - `prototypeTileLayersVisible`
- Update visual baseline after inspection.

### Slice 2: Scene Plate Layer Contract

- Add validation for explicit image render mode.
- Add tests that fail when no scene plate exists.
- Add docs for map layer conventions.

### Slice 3: Map Template Generator

- Add a level/map template generator.
- Create placeholders for the 10-level pipeline.
- Include required object layers and ledger entries.

### Slice 4: Production Art Pipeline

- Generate/import final scene plates per level.
- Split plates into parallax/foreground layers.
- Add prefab/object placement tooling.

### Slice 5: Reference Review Harness

- Store approved reference screenshots.
- Capture current screenshots.
- Produce side-by-side review artifacts.
- Require visual review before calling a level done.

## Immediate Decision

The current prototype tileset stays only as a pipeline/debug asset. It is not good enough to be the primary visual map. The active Stage 1 visual should return to the high-detail scene plate until we have a production-quality tileset/prefab pack.
