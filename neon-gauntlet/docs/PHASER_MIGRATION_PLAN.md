# Neon Gauntlet Phaser Migration Plan

## Purpose

Migrate the current Neon Gauntlet prototype into a working professional browser beat-em-up that can later be integrated back into SamiTube without blocking other agents working in the main app.

This plan follows the updated `game-quality-craft` skill and the installed `phaser-gamedev` skill:

- Start from Phaser + TypeScript + Vite.
- Keep modular systems for player, enemies, NPCs, combat, input, animation, audio, and camera.
- Make levels, enemies, bosses, animations, and combat data-driven.
- Use Tiled/LDtk-style maps instead of hardcoded world layout.
- Build/import proper sprite sheets before coding animation.
- Generate contact sheets for every animation cycle before using it.
- Reject bad animation cycles and repeated fake frames.
- Test keyboard, touch, gamepad, phone, tablet, PC, and TV layouts.
- Add screenshot/visual checks.
- Compare to a real reference before saying the work is done.

## Current State

What is already good:

- The game lives independently in `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- It already uses Vite, TypeScript, and Phaser.
- It has a real scene structure: boot, preload, menu, world, UI, pause, game-over, and stage-clear scenes.
- It has modular classes/systems: `Player`, `Enemy`, `Boss`, `CombatSystem`, `InputSystem`, `AnimationSystem`, `AudioSystem`, `CameraSystem`, `SpawnSystem`, `GamepadSystem`, and `SaveAdapter`.
- It already has JSON data for animations, combat, enemies, bosses, audio, and stage 1.
- It has some automated tests: combat logic, input, retry, corpse cleanup, enemy facing, enemy AI, and visual screenshots.

Main gaps:

- The map JSON is currently object-layer-only. It has collision, spawns, and triggers, but no real tilesets or tile layers.
- The world still renders as one large background image plus debug rectangles, not real Tiled/LDtk gameplay layers.
- Animation data uses manual frame rectangles. There is no formal asset manifest, contact-sheet gate, or license ledger.
- Character behavior is improving, but it is not yet a formal state-machine model shared across heroes, enemies, bosses, NPCs, and background actors.
- Combat uses range/lane checks, but not explicit per-frame hitboxes, hurtboxes, active frames, recovery frames, or debug overlays.
- There is only one stage. The target teen game needs at least 10 strong levels and hard bosses.
- Audio exists, but it is not yet a finished music/SFX pipeline.
- Visual baseline checks exist, but they need broader coverage and reference comparisons.
- Asset licensing still needs cleanup before commercial use.

## Non-Negotiable Quality Rules

1. Every visible actor must be believable: hero, enemy, boss, friend, civilian, projectile, prop, UI button, and animated background object.
2. No actor may attack, guard, aim, or react to empty air.
3. No actor may face one direction while the attack, leg, projectile, or hitbox goes another direction.
4. No walk cycle may use duplicated fake frames as a complete motion.
5. No walk cycle may include guard, kick, punch, or raised-fist poses unless that is the intended action.
6. Every animation must have a generated contact sheet before it enters gameplay.
7. "Done" requires both automated tests and visual inspection against a reference.

## Phase 0: Baseline Freeze And Inventory

Goal: lock down what exists before replacing systems underneath it.

Deliverables:

- Add `docs/current-state.md` with:
  - current package/runtime versions,
  - scene list,
  - system/entity list,
  - data files,
  - asset files,
  - tests,
  - known visual bugs and compromises.
- Decide Phaser runtime deliberately:
  - either align to the installed Phaser skill's Phaser 3 guidance,
  - or keep the current Phaser package after confirming API compatibility.
- Add `docs/asset-ledger.md` with source, license, status, and replacement plan for every image/audio asset.
- Add a baseline gameplay capture and screenshots for desktop, phone, tablet, and TV aspect ratios.

Verification:

- `npm run build`
- `npm test`
- `npm run test:e2e`
- Save baseline screenshots before any migration work.

Done means:

- We know exactly what we are preserving, replacing, and testing.

## Phase 1: Project Structure Hardening

Goal: make the current modular structure explicit and stable before expanding.

Target structure:

```text
src/game/
  config/
  data/
  entities/
    actors/
    projectiles/
    pickups/
  scenes/
  systems/
    animation/
    audio/
    camera/
    combat/
    input/
    spawning/
    state/
  ui/
  utils/
public/
  assets/
    atlases/
    audio/
    maps/
    sprites/
    tilesets/
  data/
    actors/
    animations/
    bosses/
    combat/
    levels/
    waves/
```

Deliverables:

- Keep scenes small; move gameplay rules out of `WorldScene`.
- Split actor logic into:
  - `PlayerController`
  - `EnemyController`
  - `BossController`
  - `NPCController`
  - shared `ActorStateMachine`
  - shared `ActorVisualController`
- Introduce a typed data loader/validator so malformed JSON fails early.
- Keep `WorldScene` responsible for orchestration only: load level, create map, create systems, run update loop.

Verification:

- TypeScript build catches bad data contracts.
- Existing tests pass after file movement.
- No gameplay behavior changes yet.

Done means:

- Adding a new enemy, NPC, or boss no longer requires editing `WorldScene`.

## Phase 2: Asset Pipeline And Licensing

Goal: stop building animations from unverified sprite guesses.

Deliverables:

- Create `tools/inspect-spritesheet.ts` or equivalent script to report:
  - image size,
  - frame rectangles,
  - frame count,
  - alpha bounds,
  - duplicate/similar frame warnings.
- Create `tools/generate-contact-sheet.ts`.
- Save contact sheets under `docs/contact-sheets/`.
- Add `public/data/assets.json` describing:
  - texture key,
  - file,
  - frame size or manual frames,
  - scale,
  - license/source,
  - approved animation cycles.
- Convert sprite data toward atlases where practical:
  - `player.atlas.png/json`
  - `enemy-rival.atlas.png/json`
  - boss atlases
  - NPC/background actor atlases
- Replace or redraw any cycle that fails visual review.

Verification:

- Contact sheets generated for `idle`, `walk`, `punch`, `kick`, `guard`, `hurt`, `jump`, `down`, and boss-specific actions.
- Duplicate-frame detector flags fake loops.
- Every approved animation has a source/license entry.

Done means:

- No animation is wired into gameplay before the exact frames are visually approved.

## Phase 3: Real Tiled/LDtk Map Pipeline

Goal: replace the single-image world with real map layers, object layers, and collision.

Deliverables:

- Choose one editor format for production:
  - Tiled JSON first, unless LDtk gives a clear advantage.
- Create a real `stage-01-metro-arcade.tmj/json` with:
  - `BackgroundFar`
  - `BackgroundMid`
  - `Decor`
  - `Ground`
  - `Foreground`
  - `Collision`
  - `PlayerSpawn`
  - `EnemySpawns`
  - `BossSpawn`
  - `Triggers`
  - `CameraZones`
  - `Props`
  - `NPCs`
- Add tilesets under `public/assets/tilesets/`.
- Load maps with Phaser tilemap APIs:
  - `this.load.tilemapTiledJSON`
  - `this.make.tilemap`
  - `map.addTilesetImage`
  - `map.createLayer`
  - `setCollisionByProperty`
- Use object layers for spawn points, trigger volumes, boss locks, doors, pickups, and NPC paths.
- Set world/camera bounds from map dimensions, not `level.worldWidth`.
- Replace `drawTiledCollisionDebug` with actual collision/debug modes.

Verification:

- Screenshot shows layered parallax and foreground occlusion.
- Player and enemies cannot leave the playable floor/camera bounds.
- Stage spawns come from map objects, not duplicated hardcoded data.

Done means:

- Stage layout can be edited in Tiled/LDtk without changing TypeScript.

## Phase 4: Animation And Actor State Machines

Goal: make all actors visually coherent by construction.

Deliverables:

- Define shared actor states:
  - `idle`
  - `walk`
  - `turn`
  - `jump`
  - `land`
  - `attackWindup`
  - `attackActive`
  - `attackRecovery`
  - `guard`
  - `hurt`
  - `knockdown`
  - `dead`
- Add per-animation metadata:
  - frame sequence,
  - frame duration,
  - loop mode,
  - anchor/origin,
  - foot baseline,
  - facing direction of source art,
  - cancel windows,
  - sound cues,
  - hitbox events.
- Make `AnimationSystem` apply the same rules to heroes, enemies, bosses, NPCs, and background actors.
- Add frame-level visual debug:
  - current state,
  - current frame,
  - facing,
  - baseline,
  - hitbox/hurtbox overlay.
- Prevent invalid state transitions:
  - no guard from far-away AI unless there is an incoming threat,
  - no attack if target moved out before active frames,
  - no walk frame while frozen, dead, or attacking.

Verification:

- Contact sheet review for every cycle.
- Automated tests assert legal state transitions.
- Visual screenshot tests cover idle, walk, attack, hurt, down, boss, and NPC/background actor states.

Done means:

- Characters cannot accidentally play a visually nonsensical animation because the state machine rejects it.

## Phase 5: Combat, Physics, Hitboxes, And Lanes

Goal: make combat feel fair, readable, and professional.

Deliverables:

- Keep Arcade-style fast collisions, but formalize a beat-em-up lane model:
  - x position,
  - lane/depth,
  - optional z height for jumps/knockups.
- Add per-frame hitbox and hurtbox data:
  - source animation frame,
  - active start/end,
  - range box,
  - lane/depth tolerance,
  - z tolerance,
  - knockback,
  - stun,
  - guard behavior.
- Add `HitboxSystem` and `HurtboxSystem`.
- Add combat debug overlay toggle.
- Add clear attack phases:
  - windup,
  - active,
  - recovery,
  - cancelable.
- Add enemy/boss damage reactions:
  - hit-stun,
  - stagger,
  - knockdown,
  - wall bounce if supported.
- Add object pooling for hit sparks, projectiles, dropped items, and repeated effects.

Verification:

- Logic tests cover facing, range, lane, z height, active frames, guard, knockback, invincibility, and corpse lifetime.
- Visual tests confirm hit sparks and reactions appear at believable positions.
- Debug overlay proves hitboxes match the visible limb/weapon.

Done means:

- If a punch/kick visually misses, the hitbox misses too. If it visually connects, the hitbox connects.

## Phase 6: AI, NPCs, And World Believability

Goal: make every character look intentional instead of random.

Deliverables:

- Add an AI state machine:
  - `spawn`
  - `approach`
  - `circle`
  - `wait`
  - `attackWindup`
  - `attackActive`
  - `recover`
  - `retreat`
  - `hurt`
  - `dead`
- Add perception rules:
  - target distance,
  - lane distance,
  - line of approach,
  - crowd spacing,
  - attack permission,
  - incoming threat detection.
- Enemies may guard only when:
  - the hero is attacking toward them,
  - a projectile is near,
  - boss script commands it for a readable reason.
- Add crowd coordination:
  - only a small number attack at once,
  - others reposition or taunt from believable distance,
  - no actor attacks empty air.
- Add NPC/background actor behavior rules:
  - background movement must match the scene,
  - civilians do not walk through combat,
  - props and vehicles obey depth and collision rules.

Verification:

- AI tests prove enemies do not attack or guard when far/off-lane.
- Visual tests show enemies approach, wait, attack, and recover believably.
- Manual reference comparison against a high-quality beat-em-up scene.

Done means:

- Enemies, bosses, friends, civilians, and background actors all obey the same believability standard.

## Phase 7: Ten-Level Content Pipeline

Goal: scale from one prototype stage to at least ten impressive levels with bosses.

Level data format:

```json
{
  "id": "stage-02-rooftop-run",
  "name": "Rooftop Run",
  "map": "stage-02-rooftop-run",
  "music": "stage-02",
  "playerSpawn": "player-start",
  "waves": "stage-02-waves",
  "boss": "drone-queen",
  "clearCondition": "boss-defeated"
}
```

Proposed teen-friendly original levels:

1. Metro Arcade - neon street/arcade entrance.
2. Rooftop Run - rain, billboards, rooftop gaps, parkour enemies.
3. Midnight Market - crowded stalls, shutters, rolling carts.
4. Transit Tunnels - trains, warning lights, echoing platforms.
5. Solar Foundry - glowing machinery, conveyor hazards.
6. Skybridge District - glass bridges, drones, wind gusts.
7. Data Garden - holographic trees, security avatars.
8. Harbor Storm - containers, cranes, water reflections.
9. Broadcast Tower - antennas, elevators, signal hazards.
10. Neon Core - final arena with multi-phase boss.

Deliverables:

- Create one JSON file per level and one Tiled/LDtk map per level.
- Create one boss data file per boss with:
  - phases,
  - attacks,
  - tells,
  - arena triggers,
  - weak windows,
  - music cues.
- Create wave data files separate from map data when useful.
- Add level select/debug menu for testing.
- Add progression save adapter that can later connect to SamiTube profiles/server saves.

Verification:

- Smoke test can load every level.
- Every level has:
  - map,
  - music cue,
  - spawn,
  - at least one unique hazard or mechanic,
  - boss,
  - stage clear condition.

Done means:

- New levels can be added mainly through data/maps/assets, not core code changes.

## Phase 8: Input, Mobile, Tablet, PC, And TV

Goal: make control reliable across all target devices.

Deliverables:

- Keep one normalized input model for:
  - keyboard,
  - touch/on-screen controls,
  - gamepad,
  - TV remote/gamepad-style focus.
- Add an input recorder/debug panel showing:
  - raw keyboard state,
  - raw pointer control,
  - gamepad buttons/axes,
  - normalized action state.
- Redesign on-screen buttons:
  - separated hit areas,
  - no overlapping invisible bounds,
  - pressed/held/released feedback,
  - responsive layout for phone/tablet,
  - hidden or minimal on PC/TV unless needed.
- Add gamepad mapping:
  - d-pad/left stick movement,
  - face buttons for punch/kick/jump/guard,
  - start/menu pause.
- Add TV-safe layout:
  - large focus targets,
  - no hover-only controls,
  - visible focus ring,
  - menu navigation by gamepad/remote.

Verification:

- Playwright tests for keydown/keyup release and retry.
- Pointer tests for each on-screen button hit area.
- Manual gamepad test checklist.
- Screenshots at phone, tablet, desktop, and TV aspect ratios.

Done means:

- Input starts and stops exactly when the player presses/releases on every supported device.

## Phase 9: Audio And Music

Goal: make sound part of the game feel, not an afterthought.

Deliverables:

- Keep `AudioSystem`, but add:
  - music layers or loop points,
  - boss music transitions,
  - hit/guard/hurt/jump/land/step cues,
  - UI confirm/cancel cues,
  - mute and volume settings.
- Add `public/data/audio.json` validation.
- Add source/license ledger for every track and effect.
- Avoid audio spam:
  - cooldown duplicate SFX,
  - vary repeated hit sounds,
  - stop sounds on scene shutdown.

Verification:

- Menu, stage, boss, pause, stage-clear, and game-over scenes all have appropriate cues.
- Browser unlock flow works after first player gesture.
- Audio stops/changes cleanly on scene transitions.

Done means:

- The game sounds intentionally designed across the full loop.

## Phase 10: Visual Baselines, Reference Checks, And Performance

Goal: stop relying on subjective review at the end.

Deliverables:

- Expand Playwright screenshot baselines:
  - title/menu,
  - stage intro,
  - player idle/walk,
  - enemy walk,
  - punch/kick active frames,
  - hit reaction,
  - corpse fade,
  - boss intro,
  - stage clear,
  - game over,
  - phone/tablet/desktop/TV.
- Add contact-sheet CI or local test that fails on missing sheets for approved animations.
- Add performance checks:
  - no object creation in hot update paths,
  - pooled projectiles/effects,
  - FPS/debug overlay,
  - throttled AI updates,
  - offscreen culling/physics disable.
- Add reference comparison checklist:
  - background density,
  - sprite readability,
  - animation believability,
  - hit feedback,
  - boss drama,
  - UI quality,
  - control feel.

Verification:

- `npm run build`
- `npm test`
- `npm run test:e2e`
- `npm run test:screenshots`
- Manual reference comparison before "done".

Done means:

- We can prove the game still works and still looks acceptable after changes.

## Phase 11: SamiTube Integration Contract

Goal: keep game development independent while making later integration easy.

Deliverables:

- Define an integration API:
  - start game,
  - pause/resume,
  - profile id/name/avatar in,
  - score/progress/result out,
  - mute/fullscreen state,
  - exit/back event.
- Keep server/profile saving behind `SaveAdapter`.
- Add standalone mock profile data for the Games repo.
- Add build artifact or iframe-friendly route for SamiTube.
- Document exactly which files are copied or consumed by SamiTube.

Verification:

- Standalone game runs without any `Youtube++` imports.
- Mock profile ranking works locally.
- Integration adapter can be swapped without changing gameplay systems.

Done means:

- Other agents can update SamiTube while game creation continues independently.

## Execution Order

1. Freeze baseline and asset ledger.
2. Build asset/contact-sheet tooling.
3. Convert stage 1 to real Tiled/LDtk layers.
4. Refactor actor state machines.
5. Refactor combat hitboxes/hurtboxes.
6. Refactor AI and NPC/world behavior.
7. Polish input for keyboard, touch, gamepad, and TV.
8. Finish audio/music system.
9. Create level/boss pipeline.
10. Build the remaining 9 stages.
11. Expand visual/performance tests.
12. Add SamiTube integration contract.

## First Practical Milestone

The first milestone should not be all 10 levels. It should be:

- Stage 1 rebuilt as a real Tiled/LDtk map.
- Player, one enemy, and one boss controlled by shared animation/state/combat rules.
- Approved contact sheets for all animations used in stage 1.
- Keyboard, touch, and gamepad input verified.
- Screenshot baselines for desktop, phone, tablet, and TV.
- Asset ledger started with license/source status.

This gives us one professional vertical slice. After that, the other nine levels become production work instead of repeated improvisation.
