# Neon Gauntlet Remediation Plan

## Purpose

Bring Neon Gauntlet from a standalone Canvas prototype into a professional, LLM-friendly SNES-style browser game architecture without touching Youtube++ during development.

This plan is documentation only. Do not execute implementation steps until the user explicitly asks.

## Current Problems To Remediate

- The game is not Phaser + TypeScript + Vite.
- The game is still mostly one large `index.html`.
- Levels, enemies, animation frames, and combat are hardcoded instead of JSON/data-driven.
- The game does not use Tiled or LDtk maps.
- The game does not have modular systems such as `Player`, `Enemy`, `CombatSystem`, and `InputSystem`.
- The game does not have real audio or music.
- The game does not have gamepad support.
- The game does not have screenshot baseline comparisons.
- Asset licensing needs cleanup before commercial use.

## Target End State

Neon Gauntlet should become a standalone Phaser + TypeScript + Vite project inside `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.

The final structure should look like this:

```text
neon-gauntlet/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  src/
    main.ts
    game/
      config.ts
      constants.ts
      scenes/
        BootScene.ts
        PreloadScene.ts
        MenuScene.ts
        WorldScene.ts
        UIScene.ts
        PauseScene.ts
        GameOverScene.ts
        StageClearScene.ts
      entities/
        Player.ts
        Enemy.ts
        Boss.ts
        Projectile.ts
        Pickup.ts
      systems/
        InputSystem.ts
        GamepadSystem.ts
        CombatSystem.ts
        SpawnSystem.ts
        AnimationSystem.ts
        AudioSystem.ts
        CameraSystem.ts
        SaveAdapter.ts
      data/
        types.ts
        levels.ts
        enemies.ts
        combat.ts
        animations.ts
        audio.ts
      utils/
        math.ts
        rectangles.ts
        pixelSnap.ts
  public/
    assets/
      sprites/
      backgrounds/
      tilesets/
      maps/
      audio/
      ui/
      atlases/
    data/
      levels/
      enemies.json
      bosses.json
      combat.json
      animations.json
      audio.json
  tests/
    logic/
    e2e/
    screenshots/
  docs/
    GAME_SPEC.md
    STORY.md
    CHARACTERS.md
    STYLE_GUIDE.md
    AUDIO_STYLE.md
    LICENSES.md
    TASKS.md
    REMEDIATION_PLAN.md
```

## Non-Negotiable Rules

- Do not modify Youtube++ while executing this plan.
- Keep the game runnable from `/Dev/Games/neon-gauntlet`.
- Preserve the existing standalone Canvas prototype until the Phaser version reaches feature parity.
- Every phase must end with a working local dev server.
- Every phase must include verification before the next phase starts.
- Do not claim visual quality is fixed without screenshots or screenshot comparison.
- Keep all commercial asset sources documented in `docs/LICENSES.md`.

## Phase 0: Baseline And Safety

Goal: Freeze what already works before replacing the architecture.

Tasks:

- Keep the current `index.html` prototype as the baseline reference.
- Rename the current prototype only after the Phaser version is working, for example:
  - `legacy/index.html`
  - `legacy/_harness.js`
  - `legacy/_game.css`
  - `legacy/neon/assets/...`
- Add a `docs/BASELINE.md` file documenting:
  - current controls
  - current level names
  - current enemy roles
  - current known visual defects
  - target reference quality
- Capture baseline screenshots:
  - title card
  - idle gameplay
  - player punch
  - player kick
  - player jump
  - enemy attack
  - boss encounter if reachable
- Save baseline screenshots under `tests/screenshots/baseline/legacy/`.

Acceptance Criteria:

- Current prototype still runs with `npm start`.
- `npm run smoke:neon` still passes.
- Baseline screenshots exist.
- No Youtube++ files are changed.

## Phase 1: Phaser + TypeScript + Vite Project Setup

Goal: Convert the project shell to a modern browser game stack while keeping the current prototype available.

Tasks:

- Add Vite, TypeScript, Phaser, Vitest, and Playwright dependencies to `neon-gauntlet/package.json`.
- Add:
  - `vite.config.ts`
  - `tsconfig.json`
  - `src/main.ts`
  - `src/game/config.ts`
- Configure Phaser with:
  - internal resolution `320x180` or `426x240` after testing visibility
  - pixel art mode enabled
  - crisp scaling
  - fixed physics timestep where practical
  - transparent separation between game canvas and page shell
- Add scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run test`
  - `npm run smoke`
- Create scenes:
  - `BootScene`
  - `PreloadScene`
  - `MenuScene`
  - `WorldScene`
  - `UIScene`
  - `GameOverScene`
  - `StageClearScene`
- Update root `/Dev/Games/games.json` so the game registry knows whether the active target is legacy or Phaser.

Acceptance Criteria:

- `npm run dev` starts the Phaser shell.
- `npm run build` passes.
- A blank Phaser scene renders at the target internal resolution.
- No gameplay migration is attempted yet.

## Phase 2: Asset Pipeline And Atlas Cleanup

Goal: Move from hand-coded asset paths and frame rectangles to a clean asset pipeline.

Tasks:

- Move assets into `public/assets/`:
  - `public/assets/sprites/player-sheet.png`
  - `public/assets/sprites/enemy-rival-sheet.png`
  - `public/assets/backgrounds/stage-01-metro-arcade.png`
- Create `public/data/animations.json` containing:
  - player idle frames
  - player walk frames
  - player punch frames
  - player kick frames
  - player guard frames
  - player hurt frames
  - player jump frames
  - enemy idle frames
  - enemy walk frames
  - enemy punch frames
  - enemy kick frames
  - enemy guard frames
  - enemy hurt frames
  - enemy down frames
- Move current atlas rectangles out of code and into JSON.
- Add TypeScript types for animation frame data.
- Add validation so missing animation frames fail loudly in development.
- Add `PreloadScene` loading for images, atlases, maps, data JSON, and audio placeholders.

Acceptance Criteria:

- Phaser loads sprites/backgrounds from `public/assets`.
- Animation metadata comes from `public/data/animations.json`.
- No sprite frame rectangle is hardcoded inside entity classes.
- Player and enemy idle sprites render correctly in Phaser.

## Phase 3: Modular Entity System

Goal: Replace global objects with explicit TypeScript classes.

Tasks:

- Create `Player.ts` with:
  - position
  - health
  - facing direction
  - movement state
  - attack state
  - hurt/invincible state
  - animation state
- Create `Enemy.ts` with:
  - role
  - health
  - movement speed
  - attack cooldown
  - attack telegraph
  - lane/depth value
  - animation state
- Create `Boss.ts` extending or composing enemy behavior.
- Create `Projectile.ts`.
- Create `Pickup.ts` for future items.
- Remove reliance on global `player`, `enemies`, `projectiles`, and `level` as the primary game state.
- Keep debug references only if useful for tests.

Acceptance Criteria:

- Player can be instantiated by `WorldScene`.
- Enemies can be spawned by `WorldScene`.
- Each entity updates itself or is updated through a system.
- Entity code does not directly own global scene state.

## Phase 4: Input System

Goal: Support keyboard, touch, and gamepad through one input abstraction.

Tasks:

- Create `InputSystem.ts`.
- Define a normalized input state:
  - `left`
  - `right`
  - `up`
  - `down`
  - `punch`
  - `kick`
  - `jump`
  - `guard`
  - `pause`
- Map keyboard:
  - WASD and arrow keys for movement
  - J or Enter for punch
  - K for kick
  - Space for jump
  - L for guard
  - Escape for pause
- Rebuild touch controls in Phaser or HTML overlay, but route them through `InputSystem`.
- Keep touch buttons large enough for phone/tablet and TV remote workflows.

Acceptance Criteria:

- Player movement and attacks use `InputSystem`, not raw DOM listeners.
- Keyboard and touch both work.
- Input can be inspected in tests.

## Phase 5: Gamepad Support

Goal: Make the game playable on TV/controller setups.

Tasks:

- Create `GamepadSystem.ts`.
- Use the browser Gamepad API or Phaser gamepad support.
- Map:
  - D-pad / left stick to movement
  - South button to jump
  - West button to punch
  - East button to kick
  - Right shoulder or trigger to guard
  - Start/Menu to pause
- Add dead zones for analog sticks.
- Add a connected-controller indicator in debug mode.
- Preserve keyboard/touch behavior.

Acceptance Criteria:

- Gamepad input maps to the same normalized `InputSystem` state.
- Keyboard, touch, and gamepad can coexist.
- Smoke test can at least verify that gamepad code initializes without errors.

## Phase 6: Combat System

Goal: Move combat rules out of update loops into data-driven systems.

Tasks:

- Create `CombatSystem.ts`.
- Create `public/data/combat.json` with:
  - player punch damage
  - player kick damage
  - combo rules
  - attack active frames
  - hitbox sizes
  - knockback amounts
  - guard rules
  - invincibility windows
- Create TypeScript types for attack definitions.
- Implement:
  - lane/depth checks
  - attack hitboxes
  - enemy hurt state
  - player hurt state
  - knockback
  - combo scoring
  - boss damage rules
- Add Vitest unit tests for pure combat calculations.

Acceptance Criteria:

- Damage values are not hardcoded in entity update functions.
- Combat works through data definitions.
- Unit tests cover hit detection, guard behavior, damage, and knockback.

## Phase 7: Enemy And Boss Data

Goal: Make enemies and bosses configurable without rewriting code.

Tasks:

- Create `public/data/enemies.json`.
- Create `public/data/bosses.json`.
- Define enemy fields:
  - id
  - display name
  - role
  - hp
  - speed
  - damage
  - attack range
  - attack cooldown
  - animation set
  - behavior type
- Define boss fields:
  - id
  - display name
  - hp
  - phases
  - attacks
  - projectile settings
  - stage intro message
- Create `SpawnSystem.ts` to instantiate enemies/bosses from data.

Acceptance Criteria:

- Regular enemies spawn from JSON data.
- Boss data is externalized.
- Adding a new enemy role does not require editing `WorldScene`.

## Phase 8: Levels As Data

Goal: Move stage configuration out of code.

Tasks:

- Create `public/data/levels/stage-01-metro-arcade.json`.
- Create one JSON file per stage.
- Define level fields:
  - id
  - name
  - background asset
  - music key
  - world width
  - player spawn
  - enemy waves
  - boss id
  - palette accents
  - parallax settings
  - stage clear condition
- Create `src/game/data/levels.ts` loader/validator.
- Make `WorldScene` load the current level from data.

Acceptance Criteria:

- Stage 1 loads from JSON.
- Existing 10 stage names are represented in data.
- WorldScene no longer contains the `LEVELS` array.

## Phase 9: Tiled Or LDtk Map Pipeline

Goal: Support real level design instead of code-built backgrounds and spawn placement.

Recommended tool: Tiled JSON first, because it is simple and broadly supported.

Tasks:

- Choose Tiled JSON as the first map format.
- Add `public/assets/tilesets/`.
- Add `public/assets/maps/`.
- Create or import `stage-01-metro-arcade.json` from Tiled.
- Define map layers:
  - background tiles
  - foreground decoration
  - collision
  - player spawn
  - enemy spawn zones
  - boss trigger
  - exit trigger
  - camera bounds
- Add map loading to `PreloadScene`.
- Add collision generation from the collision layer.
- Add object-layer parsing for spawns and triggers.

Acceptance Criteria:

- Stage 1 can be loaded from a Tiled JSON map.
- Player spawn comes from map data.
- Enemy spawns can come from map object layers.
- Collision comes from map data, not hardcoded rectangles.

## Phase 10: Audio And Music

Goal: Add real audio feedback and music in a browser-safe way.

Tasks:

- Create `docs/AUDIO_STYLE.md`.
- Add folders:
  - `public/assets/audio/music/`
  - `public/assets/audio/sfx/`
- Add placeholder or licensed audio:
  - `music_stage_01.ogg`
  - `sfx_punch.wav`
  - `sfx_kick.wav`
  - `sfx_hit.wav`
  - `sfx_guard.wav`
  - `sfx_jump.wav`
  - `sfx_player_hurt.wav`
  - `sfx_enemy_defeat.wav`
  - `sfx_stage_clear.wav`
  - `sfx_boss_intro.wav`
- Create `public/data/audio.json` mapping events to files and volumes.
- Create `AudioSystem.ts` with:
  - unlock on first user gesture
  - music loop
  - mute/pause support
  - volume constants
  - event-based sound playback

Acceptance Criteria:

- Music starts after the first user gesture.
- SFX play for jump, punch, kick, hit, guard, hurt, and stage clear.
- Mute button works.
- Audio files and licenses are documented.

## Phase 11: UI, HUD, And Scene Flow

Goal: Move UI out of ad hoc canvas drawing into scene-owned components.

Tasks:

- Implement `UIScene`.
- Display:
  - player health bar
  - score
  - stage name
  - boss health bar
  - combo text
  - pause state
- Implement `MenuScene`:
  - title
  - start action
  - controls
  - controller hint if connected
- Implement `PauseScene`.
- Implement `GameOverScene`.
- Implement `StageClearScene`.

Acceptance Criteria:

- UI is readable at internal resolution.
- UI scales cleanly on phone, tablet, desktop, and TV.
- Scene transitions are explicit.

## Phase 12: Screenshot Baseline Comparisons

Goal: Stop relying on subjective manual review for visual correctness.

Tasks:

- Add Playwright test project under `tests/e2e/`.
- Add screenshot baselines under `tests/screenshots/baseline/`.
- Create tests for:
  - title screen
  - stage 1 idle
  - player walk
  - player punch
  - player kick
  - player jump
  - enemy attack
  - boss intro
  - mobile viewport
  - tablet viewport
  - desktop viewport
  - TV viewport
- Use deterministic test mode:
  - fixed random seed
  - disabled particles or deterministic particles
  - fixed animation timestamp hooks if practical
  - stable viewport and device scale
- Add scripts:
  - `npm run test:e2e`
  - `npm run test:screenshots`
  - `npm run update:screenshots`

Acceptance Criteria:

- Visual tests fail when sprites disappear, crop incorrectly, or render blank.
- Baseline screenshots are reviewed and committed.
- Smoke test remains fast.

## Phase 13: Logic Tests

Goal: Make core rules safer for agents to change.

Tasks:

- Add Vitest tests for:
  - combat hit range
  - lane matching
  - guard blocking
  - damage application
  - combo scoring
  - enemy spawn parsing
  - level data validation
  - input normalization
- Keep tests independent of Phaser rendering where possible.

Acceptance Criteria:

- `npm run test` passes.
- Core game rules are covered by unit tests.
- Regression-prone math is no longer only tested manually.

## Phase 14: Asset Licensing Cleanup

Goal: Make the project commercially safe.

Tasks:

- Audit every asset file.
- Update `docs/LICENSES.md` with:
  - file path
  - source URL or creation source
  - author
  - license
  - commercial-use status
  - attribution requirement
  - replacement needed yes/no
- Replace any asset that is not clearly commercial-safe.
- Prefer:
  - original commissioned assets
  - original generated assets with documented prompts and cleanup
  - CC0/Public Domain packs
  - properly licensed paid asset packs
- Avoid:
  - ripped SNES/Nintendo assets
  - fan-game assets
  - noncommercial licenses
  - no-derivatives licenses
  - assets resembling famous protected characters

Acceptance Criteria:

- `docs/LICENSES.md` fully lists every asset.
- Every production asset is commercial-safe or marked for replacement.
- No untracked asset source remains.

## Phase 15: Performance And Device QA

Goal: Make the game actually playable on PC, phone, tablet, and TV.

Tasks:

- Test viewport classes:
  - phone portrait
  - phone landscape
  - tablet
  - desktop
  - TV/large screen
- Measure:
  - frame rate
  - input latency
  - memory footprint
  - asset load time
- Optimize:
  - texture size
  - animation frame count
  - particle count
  - draw calls
  - audio file sizes
- Add fallback behavior for low-end devices.

Acceptance Criteria:

- Game starts and remains playable on all target viewport classes.
- Touch controls do not overlap gameplay.
- TV/gamepad workflow can start and play without mouse input.

## Phase 16: Import Back To Youtube++ Only When Ready

Goal: Keep app integration separate from game development.

Tasks:

- Define a build output format for the game:
  - static files
  - asset folder
  - manifest metadata
- Create an import checklist for Youtube++:
  - game title
  - route/path
  - thumbnail
  - time limit metadata
  - profile ranking hooks
  - score events
  - completion events
- Add a compatibility wrapper only after the standalone game passes its own tests.

Acceptance Criteria:

- Youtube++ integration is a separate task/PR.
- The standalone game remains runnable after import.
- No app functionality work is blocked by game iteration.

## Proposed Milestones

### Milestone 1: Modern Shell

Phaser + TypeScript + Vite runs with blank scene and copied assets preloaded.

Includes phases:

- Phase 0
- Phase 1
- Phase 2 partial

### Milestone 2: Gameplay Feature Parity

Player, enemies, combat, and stage 1 work in Phaser.

Includes phases:

- Phase 2 complete
- Phase 3
- Phase 4
- Phase 6
- Phase 7
- Phase 8 partial

### Milestone 3: Real Level Pipeline

Stage 1 loads from Tiled JSON with object layers and collision.

Includes phases:

- Phase 8 complete
- Phase 9

### Milestone 4: Console Feel

Audio, UI, gamepad, responsive device QA, and polished scene flow.

Includes phases:

- Phase 5
- Phase 10
- Phase 11
- Phase 15

### Milestone 5: Agent-Safe Quality Gate

Visual baselines, logic tests, and licensing docs make it safer for multiple agents.

Includes phases:

- Phase 12
- Phase 13
- Phase 14

### Milestone 6: App Import

Only after standalone quality gates pass, package for Youtube++ import.

Includes:

- Phase 16

## Recommended Execution Order

1. Baseline screenshots and docs.
2. Add Phaser + TypeScript + Vite shell beside legacy prototype.
3. Move assets and animation data into JSON.
4. Implement `Player` and `InputSystem`.
5. Implement enemies and `CombatSystem`.
6. Externalize enemies, bosses, levels, and combat.
7. Add Tiled map support.
8. Add audio/music.
9. Add gamepad support.
10. Add screenshot comparisons.
11. Add logic tests.
12. Complete license cleanup.
13. QA on PC, phone, tablet, and TV.
14. Package for Youtube++ only after standalone approval.

## Definition Of Done

The remediation is complete only when:

- `npm run dev` runs a Phaser + TypeScript + Vite version.
- `npm run build` passes.
- `npm run test` passes.
- `npm run smoke` passes.
- `npm run test:screenshots` passes.
- Stage 1 runs from data and map files.
- Enemies, bosses, combat, audio, and animations are data-driven.
- Keyboard, touch, and gamepad are supported.
- Asset licensing is documented and commercial-safe.
- The legacy one-file prototype is no longer the primary game.
- Youtube++ integration remains separate from game development.

## Risks

- Migrating everything at once may break gameplay feel.
- Phaser physics may not match the current pseudo-3D lane brawler movement without custom handling.
- Current artwork may not be legally production-safe.
- Screenshot comparisons can be flaky if animation time and randomness are not controlled.
- Gamepad support needs real-device testing, not just code inspection.

## Risk Controls

- Keep legacy prototype until Phaser reaches parity.
- Migrate one system at a time.
- Use deterministic test mode for screenshots.
- Record every asset source immediately.
- Test visually after every rendering change.
- Keep all game work in `/Dev/Games`.
