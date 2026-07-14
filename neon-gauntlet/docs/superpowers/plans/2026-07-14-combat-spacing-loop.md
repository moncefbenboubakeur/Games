# Combat Spacing Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make active encounters feel closer to Return of Double Dragon by having enemies stage around the player instead of stacking directly on the player's exact position.

**Architecture:** Add optional enemy tactics to `Enemy.updateEnemy()` so movement can target a combat slot while attack validation still uses the real player. `WorldScene` computes per-enemy slots from current side, role, lane, and distance. Tests verify separation, no empty-air attacks, and projectile behavior still works.

**Tech Stack:** Phaser 4, TypeScript, Vite, Playwright.

## Global Constraints

- Work only inside `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Do not commit large reference recordings or scratch screenshots.
- Attacks must still face and validate against the real player.
- No enemy should attack, guard, or aim at empty air.
- Preserve keyboard, touch, gamepad, retry, visual, and world-system checks.

---

### Task 1: Enemy Combat Slots

**Files:**
- Modify: `src/game/entities/Enemy.ts`
- Modify: `src/game/entities/Boss.ts`
- Modify: `src/game/scenes/WorldScene.ts`
- Modify: `tests/e2e/enemy-ai.spec.ts`

**Interfaces:**
- Consumes: `Enemy.updateEnemy(dt, player, worldWidth)`, `WorldScene.enemies`.
- Produces: `EnemyTactics`, `Enemy.updateEnemy(dt, player, worldWidth, tactics?)`, `WorldScene.enemyTactics(...)`.

- [x] **Step 1: Add `EnemyTactics`**

In `src/game/entities/Enemy.ts`, export:

```ts
export interface EnemyTactics {
  slotOffsetX?: number
  slotLane?: number
}
```

- [x] **Step 2: Make movement use tactical slot while attacks use real player**

Change:

```ts
updateEnemy(dt: number, player: Player, worldWidth: number)
```

to:

```ts
updateEnemy(dt: number, player: Player, worldWidth: number, tactics: EnemyTactics = {})
```

Keep `dx = player.x - this.x` for facing and attack validation. Add:

```ts
const moveTargetX = tactics.slotOffsetX === undefined || this.canStartAttack(player)
  ? player.x
  : player.x + tactics.slotOffsetX
const moveTargetLane = tactics.slotLane ?? player.lane
const moveDx = moveTargetX - this.x
const moveDy = moveTargetLane - this.lane
```

Use `moveDx` and `moveDy` for pursue/align movement. Use `player` in `canStartAttack(player)` and projectile/contact damage.

- [x] **Step 3: Pass through boss signature**

In `src/game/entities/Boss.ts`, update `override updateEnemy` to accept optional tactics and pass it to `super.updateEnemy(...)`.

- [x] **Step 4: Compute slots in WorldScene**

In `WorldScene.update`, call:

```ts
const livingEnemies = this.enemies.filter((enemy) => enemy.active && enemy.hp > 0)
this.enemies.forEach((enemy) => enemy.updateEnemy(delta, this.player, this.level.worldWidth, this.enemyTactics(enemy, livingEnemies)))
```

Add:

```ts
private enemyTactics(enemy: Enemy, livingEnemies: Enemy[]) {
  if (livingEnemies.length <= 1) return {}
  const side: -1 | 1 = enemy.x >= this.player.x ? 1 : -1
  const sameSide = livingEnemies
    .filter((candidate) => (candidate.x >= this.player.x ? 1 : -1) === side)
    .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))
  const rank = Math.max(0, sameSide.indexOf(enemy))
  const isProjectile = Boolean(enemy.def.projectile)
  const closeSlot = enemy.def.range * 0.82
  const holdSlot = isProjectile ? 96 : 64 + rank * 24
  const slotDistance = rank === 0 ? closeSlot : holdSlot
  const laneOffsets = [0, 0.045, -0.045, 0.075]
  return {
    slotOffsetX: side * slotDistance,
    slotLane: Phaser.Math.Clamp(this.player.lane + laneOffsets[rank % laneOffsets.length], 0.58, 0.88),
  }
}
```

- [x] **Step 5: Add Playwright coverage**

In `tests/e2e/enemy-ai.spec.ts`, add a test that starts stage 1, waits for both first-wave enemies to enter, and asserts their X positions stay separated by at least 24 pixels after the staging beat.

Run:

```bash
npm run test:e2e -- tests/e2e/enemy-ai.spec.ts tests/e2e/enemy-facing.spec.ts tests/e2e/world-systems.spec.ts --project=desktop --workers=1
```

- [x] **Step 6: Visual Review**

Capture `/tmp/neon-combat-spacing.png` after 2 seconds of first-wave movement and inspect it. It should show the player plus two threats with readable horizontal separation.

- [x] **Step 7: Verify and commit**

Run:

```bash
npm run build
npm run test:e2e -- --project=desktop --workers=1
```

Commit only scoped files:

```bash
git add docs/superpowers/plans/2026-07-14-combat-spacing-loop.md src/game/entities/Enemy.ts src/game/entities/Boss.ts src/game/scenes/WorldScene.ts tests/e2e/enemy-ai.spec.ts
git commit -m "add enemy combat spacing"
git push
```
