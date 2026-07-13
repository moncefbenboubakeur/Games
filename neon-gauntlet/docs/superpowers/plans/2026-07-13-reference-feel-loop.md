# Reference Feel Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Neon Gauntlet toward the Return of Double Dragon reference by adding staged encounter pockets, then iterating with visual review.

**Architecture:** Keep Phaser + TypeScript + Vite. Add optional `encounterWaves` level data that lets stages spawn small waves from credible screen edges, hold the player at a temporary arena gate while threats are alive, and release movement when the pocket is cleared. Preserve old `enemyWaves` as fallback for stages that have not been tuned yet.

**Tech Stack:** Phaser 4, TypeScript, Vite, Playwright, Vitest.

## Global Constraints

- Work only inside `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Do not commit large reference recordings or local screenshots.
- Use the Return of Double Dragon audit in `docs/reference/return-of-double-dragon-reference-audit.md` as the visual/behavior target.
- Every loop must include a saved plan, implementation, browser/gameplay verification, and honest remaining-gap notes.
- Do not claim “same feel” from automated tests alone; inspect gameplay screenshots or recordings.

---

### Task 1: Data-Driven Encounter Pockets

**Files:**
- Modify: `src/game/data/types.ts`
- Modify: `src/game/systems/DataValidationSystem.ts`
- Modify: `src/game/systems/SpawnSystem.ts`
- Modify: `src/game/scenes/WorldScene.ts`
- Modify: `public/data/levels/stage-01-metro-arcade.json`
- Modify: `tests/e2e/enemy-facing.spec.ts`
- Create: `tests/e2e/encounter-flow.spec.ts`

**Interfaces:**
- Consumes: `LevelData.enemyWaves`, `EnemySpawnData`, `SpawnSystem`.
- Produces: optional `LevelData.encounterWaves`, `SpawnSystem.spawnWave()`, debug `level.encounter`.

- [x] **Step 1: Add encounter data types**

Add:

```ts
export interface EncounterWaveData {
  id: string
  triggerX: number
  gateX: number
  spawns: EnemySpawnData[]
}
```

Add `encounterWaves?: EncounterWaveData[]` to `LevelData`.

- [x] **Step 2: Validate encounter waves**

In `DataValidationSystem.validateLevel`, require:

```ts
level.encounterWaves?.forEach((wave, index) => {
  this.require(Boolean(wave.id), `${level.id} encounter ${index} id is required`)
  this.require(wave.triggerX >= 0 && wave.triggerX <= level.stageClearX, `${wave.id} triggerX must fit before clear`)
  this.require(wave.gateX >= wave.triggerX && wave.gateX <= level.stageClearX, `${wave.id} gateX must fit after trigger`)
  this.require(wave.spawns.length > 0 && wave.spawns.length <= 4, `${wave.id} must spawn 1-4 enemies`)
  wave.spawns.forEach((spawn, spawnIndex) => {
    this.require(enemyRoles.has(spawn.role), `${wave.id} spawn ${spawnIndex} has unknown role: ${spawn.role}`)
  })
})
```

- [x] **Step 3: Add reusable wave spawning**

In `SpawnSystem`, add:

```ts
spawnWave(level: LevelData, spawns: EnemySpawnData[], referenceX: number) {
  return spawns.map((spawn, index) => {
    const def = this.enemyDefs.find((enemy) => enemy.id === spawn.role)
    if (!def) throw new Error(`Unknown enemy role: ${spawn.role}`)
    return new Enemy(this.scene, this.entryX(spawn.x, referenceX, level.worldWidth, index), spawn.lane, def, this.animations, this.combat)
  })
}
```

Make `spawnEnemies(level)` call `spawnWave(level, level.enemyWaves, level.playerSpawn.x)`.

- [x] **Step 4: Add encounter flow in `WorldScene`**

Add scene fields:

```ts
private spawner!: SpawnSystem
private encounterWaveIndex = 0
private activeEncounterId?: string
private activeEncounterGateX?: number
```

Use `this.spawner` during create. If `this.level.encounterWaves` exists, start with no enemies and call `handleEncounterFlow()` once after player creation; otherwise keep legacy spawning.

In update, after `player.updatePlayer(...)`, call `handleEncounterFlow()` before enemy updates.

Implement:

```ts
private handleEncounterFlow() {
  const waves = this.level.encounterWaves
  if (!waves?.length || this.bossSpawned) return
  if (this.activeEncounterId && this.enemies.some((enemy) => enemy.hp > 0)) {
    if (this.activeEncounterGateX !== undefined && this.player.x > this.activeEncounterGateX) this.player.x = this.activeEncounterGateX
    return
  }
  if (this.activeEncounterId) {
    this.activeEncounterId = undefined
    this.activeEncounterGateX = undefined
    this.events.emit('message', 'MOVE')
  }
  const next = waves[this.encounterWaveIndex]
  if (!next || this.player.x < next.triggerX) return
  this.enemies.push(...this.spawner.spawnWave(this.level, next.spawns, this.player.x))
  this.encounterWaveIndex += 1
  this.activeEncounterId = next.id
  this.activeEncounterGateX = next.gateX
  this.events.emit('message', 'FIGHT')
}
```

Update `hasLivingThreats()` so pending encounter waves block exit readiness until all waves are spawned/cleared, unless `bossSpawned` is already true.

Expose debug:

```ts
encounter: {
  activeId: this.activeEncounterId ?? null,
  waveIndex: this.encounterWaveIndex,
  totalWaves: this.level.encounterWaves?.length ?? 0,
  gateX: this.activeEncounterGateX ?? null,
}
```

- [x] **Step 5: Tune stage 1 into two encounter pockets**

Add to `public/data/levels/stage-01-metro-arcade.json`:

```json
"encounterWaves": [
  {
    "id": "casino-door-open",
    "triggerX": 76,
    "gateX": 214,
    "spawns": [
      { "x": 242, "lane": 0.7, "role": "striker" },
      { "x": 317, "lane": 0.76, "role": "runner" }
    ]
  },
  {
    "id": "casino-flank-pressure",
    "triggerX": 246,
    "gateX": 390,
    "spawns": [
      { "x": 392, "lane": 0.68, "role": "bruiser" },
      { "x": 449, "lane": 0.78, "role": "thrower" }
    ]
  }
]
```

- [x] **Step 6: Add Playwright regression coverage**

Create `tests/e2e/encounter-flow.spec.ts` with tests that assert:
- stage 1 starts with only first encounter wave active,
- player is held at the first gate while enemies are alive,
- clearing first wave releases the player and later triggers the second wave,
- exit is not ready while encounter waves remain.

- [x] **Step 7: Run verification**

Run:

```bash
npm run test:e2e -- tests/e2e/encounter-flow.spec.ts tests/e2e/enemy-facing.spec.ts --project=desktop --workers=1
npm run build
npm test
npm run test:assets
npm run test:e2e -- --project=desktop --workers=1
```

Capture a before/after gameplay screenshot around the first wave and compare against the reference audit.

- [x] **Step 8: Commit**

Commit tracked plan, audit, and code/test changes only. Do not commit the `.mov` recording or loose screenshots.

```bash
git add docs/reference/return-of-double-dragon-reference-audit.md docs/superpowers/plans/2026-07-13-reference-feel-loop.md src/game/data/types.ts src/game/systems/DataValidationSystem.ts src/game/systems/SpawnSystem.ts src/game/scenes/WorldScene.ts public/data/levels/stage-01-metro-arcade.json tests/e2e/encounter-flow.spec.ts tests/e2e/enemy-facing.spec.ts
git commit -m "add staged encounter pockets"
```

### Next Loop Candidates

- Add enemy spacing/flanking slots so threats surround the player like the reference instead of stacking.
- Add a compact elevator/arena encounter template.
- Add weapon enemy behavior and stronger weapon silhouettes.
- Add launch/throw reactions with large readable body displacement.
