# Final Character Art And Weapons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the current character-art blockers by giving the player, six enemy archetypes, and every boss a distinct approved runtime sheet, then add believable weapon drops and pickups inspired by arcade brawlers.

**Architecture:** Keep the current Phaser + TypeScript + Vite harness. Add data-driven enemy weapon metadata, deterministic sheet-generation tooling, and a small `WeaponPickupSystem` owned by `WorldScene`. Avoid touching Youtube++.

**Tech Stack:** Phaser, TypeScript, Vite, Playwright, Vitest, Python/Pillow for deterministic sprite-sheet generation.

## Global Constraints

- Work only in `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Do not close or restart the user's browser/apps.
- Do not commit unrelated untracked incoming media or background temp assets.
- Every visible actor must obey the same believability standard: no fake walk loops, no wrong-facing attacks, no invisible gameplay objects.
- Do not claim production readiness for maps/levels; this slice targets character art and weapon mechanics only.

---

## Design Summary

### Enemy Archetypes

Six enemy roles will exist:

- `striker`: empty-hand balanced fighter.
- `runner`: fast knife fighter.
- `bruiser`: heavy empty-hand/kick fighter.
- `staffer`: wooden-stick fighter.
- `swordsman`: sword fighter.
- `nunchaku`: nunchaku fighter.

Weapon roles carry `weaponDrop` metadata. When such an enemy dies, the matching weapon falls at the death location, remains briefly, and can be picked up by the hero.

### Boss Sheets

Every boss keeps its own texture key and texture file. Existing shared boss texture reuse is removed by generating unique named runtime sheets for:

- `forge-aya-sheet`
- `drone-queen-nova-sheet`
- `cipher-iris-sheet`
- `signal-vex-sheet`
- `zero-volt-ren-sheet`

Existing `turnstile-ren`, `iron-wei`, `lantern-mai`, `harbor-hale`, and `switchblade-sora` remain unique keys. Each generated sheet gets a distinct palette and silhouette/weapon overlay.

### Weapon Pickup

Add `WeaponPickupSystem`:

- Draws readable pixel-style weapons, not placeholder boxes.
- Tracks `id`, `weaponId`, `x`, `lane`, `expiresAt`, and `sprite`.
- Expires drops after 5 seconds if not collected.
- Equips the player when close in x and lane.

Player equipped weapons:

- Have `id`, `name`, `damageBonus`, `rangeBonus`, and `uses`.
- Modify active attack range/damage/knockback by merging a temporary attack definition before combat.
- Lose one use per successful hit, then disappear.
- Show in debug state for tests.

## Tasks

### Task 1: Red Tests

**Files:**
- Modify: `tests/logic/release-readiness.test.ts`
- Modify: `tests/e2e/world-systems.spec.ts`

**Steps:**

- [x] Add a logic test asserting character-art blockers are gone:
  - `report.blockers.filter(kind === "boss-art").length === 0`
  - no texture blocker keys matching `player-sheet`, `enemy-sheet`, `*-sheet` for enemy roles, or boss sheets.
- [x] Add an e2e test asserting six enemy role textures appear in stage data/debug after direct spawn.
- [x] Add an e2e test killing a weapon enemy, confirming a weapon drop appears, moving the player onto it, and confirming `player.weapon` is set.
- [x] Run the focused tests and confirm they fail for the expected reasons.

### Task 2: Data Model And Runtime Weapon System

**Files:**
- Modify: `src/game/data/types.ts`
- Modify: `src/game/entities/Player.ts`
- Modify: `src/game/scenes/WorldScene.ts`
- Create: `src/game/systems/WeaponPickupSystem.ts`
- Modify: `tests/e2e/window.d.ts`

**Steps:**

- [x] Extend `EnemyRole` to the six roles.
- [x] Add `WeaponId`, `WeaponDefinition`, `weaponDrop`, `weaponDamageBonus`, `weaponRangeBonus`, and `weaponUses` types.
- [x] Add `Player.equipWeapon()`, `Player.consumeWeaponUse()`, `Player.weapon`, and debug snapshot support.
- [x] Add `WeaponPickupSystem` with readable Phaser graphics for knife/staff/sword/nunchaku.
- [x] Wire death drops and pickup checks in `WorldScene`.
- [x] Merge weapon bonuses into player attacks before calling `CombatSystem.hit`.

### Task 3: Character Sheet Generation And Data

**Files:**
- Create: `tools/generate-final-character-sheets.py`
- Modify: `public/data/enemies.json`
- Modify: `public/data/bosses.json`
- Modify: `public/data/assets.json`
- Modify: `public/data/levels/*.json`
- Modify: `public/data/world-systems.json` if summon roles reference old roles.

**Steps:**

- [x] Generate six enemy sheets under `public/assets/sprites/enemies/`.
- [x] Generate unique boss sheets under `public/assets/sprites/bosses/` for all bosses that lacked unique files.
- [x] Update `enemies.json` with six roles and weapon metadata.
- [x] Update level waves to include the new weapon roles across the chapter.
- [x] Update boss data to use unique texture keys/files.
- [x] Update assets ledger statuses for character sheets to `production-approved` with project-generated/reproducible source notes.

### Task 4: Green Tests And Visual Review

**Files:**
- Modify only if tests expose real defects.

**Steps:**

- [x] Run focused red tests again and fix failures.
- [x] Run `npm run test:release` and confirm no character-art or boss-art blockers remain.
- [x] Run `npm test`.
- [x] Run focused desktop e2e for world systems/enemy facing/input.
- [x] Run `npm run build`.
- [x] Capture at least one runtime screenshot showing weapon drop/pickup state and inspect it.
- [x] Run full desktop e2e if focused checks pass.

### Task 5: Commit And Push

**Files:**
- Commit only scoped source/data/tool/test/assets generated by this slice.

**Steps:**

- [x] Run `git diff --check`.
- [x] Confirm untracked unrelated user media/temp assets remain unstaged.
- [x] Commit with `feat: add final character sheets and weapon drops`.
- [x] Push `main`.
