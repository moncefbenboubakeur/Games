# Engagement Pressure Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make encounter waves become real fights faster, closer to Return of Double Dragon's pressure timing.

**Architecture:** Extend `EnemyTactics` with an optional movement-only speed multiplier. `WorldScene` assigns a rush multiplier while an encounter is active and an enemy is still far from its combat slot. Attacks, telegraphs, hit validation, and projectile behavior stay unchanged.

**Tech Stack:** Phaser 4, TypeScript, Vite, Playwright.

## Global Constraints

- Work only inside `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Enemies must still enter from screen edges.
- Speed boost must not make enemies attack empty air.
- Verify visually and mechanically before committing.

---

### Task 1: Movement-Only Rush Pressure

**Files:**
- Modify: `src/game/entities/Enemy.ts`
- Modify: `src/game/scenes/WorldScene.ts`
- Modify: `tests/e2e/enemy-ai.spec.ts`

**Interfaces:**
- Consumes: `EnemyTactics.slotOffsetX`, `WorldScene.activeEncounterId`.
- Produces: `EnemyTactics.speedMultiplier`.

- [x] **Step 1: Add speed multiplier to tactics**

Add to `EnemyTactics`:

```ts
speedMultiplier?: number
```

- [x] **Step 2: Apply multiplier only to movement**

In `Enemy.updateEnemy`, before movement:

```ts
const movementSpeed = this.def.speed * (tactics.speedMultiplier ?? 1)
```

Use `movementSpeed` for X movement only. Leave lane movement, telegraph, attack, projectile, and damage timing unchanged.

- [x] **Step 3: Assign rush pressure during active encounters**

In `WorldScene.enemyTactics`, include:

```ts
const farFromPlayer = Math.abs(enemy.x - this.player.x) > 150
const rushMultiplier = this.activeEncounterId && farFromPlayer ? 1.55 : 1
```

Return `speedMultiplier: rushMultiplier`.

- [x] **Step 4: Add pressure timing coverage**

In `tests/e2e/enemy-ai.spec.ts`, add a test that starts stage 1 and waits 2400ms. Assert the nearest active enemy is within 230px of the player while enemies remain separated by at least 24px.

- [x] **Step 5: Visual review**

Capture `/tmp/neon-engagement-pressure.png` at 2600ms and inspect whether enemies are now visibly close enough to feel like an incoming fight.

- [x] **Step 6: Verify and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/enemy-ai.spec.ts tests/e2e/enemy-facing.spec.ts --project=desktop --workers=1
npm run build
npm run test:e2e -- --project=desktop --workers=1
```

Commit and push:

```bash
git add docs/superpowers/plans/2026-07-14-engagement-pressure-loop.md src/game/entities/Enemy.ts src/game/scenes/WorldScene.ts tests/e2e/enemy-ai.spec.ts
git commit -m "increase encounter engagement pressure"
git push
```
