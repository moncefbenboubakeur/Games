import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => !!window.__NEON_GAME__ && typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

async function triggerSecondStageOneWave(page: import('playwright/test').Page) {
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ destroy: () => void; hp: number }>
    }
    world.enemies.forEach((enemy) => {
      enemy.hp = 0
      enemy.destroy()
    })
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.encounter.activeId)).toBe(null)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      player: { x: number }
    }
    world.player.x = 250
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.encounter.activeId)).toBe('casino-flank-pressure')
}

function expectedScaleSign(face: -1 | 1, sourceFacing: 'left' | 'right') {
  return sourceFacing === 'right' ? face : face === -1 ? 1 : -1
}

test('initial enemies enter from outside the screen instead of popping into view', async ({ page }) => {
  await startGame(page)

  const spawnXs = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ x: number }>
    }
    return world.enemies.map((enemy) => enemy.x)
  })

  expect(spawnXs.length).toBeGreaterThan(0)
  expect(spawnXs.every((x) => x > 426)).toBe(true)
})

test('enemy kick frames point toward the player', async ({ page }) => {
  await startGame(page)
  await triggerSecondStageOneWave(page)
  await page.waitForTimeout(250)

  const walkingLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ face: -1 | 1; scaleX: number; texture: { key: string }; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies.find((candidate) => candidate.texture.key === 'bruiser-sheet')
    if (!enemy) throw new Error('bruiser missing')
    return { enemyX: enemy.x, playerX: world.player.x, face: enemy.face, scaleX: enemy.scaleX, texture: enemy.texture.key }
  })
  expect(walkingLeft.playerX).toBeLessThan(walkingLeft.enemyX)
  expect(walkingLeft.face).toBe(-1)
  expect(Math.sign(walkingLeft.scaleX)).toBe(expectedScaleSign(walkingLeft.face, 'left'))

  const kickLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; face: -1 | 1; scaleX: number; telegraphMs: number; texture: { key: string }; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies.find((candidate) => candidate.texture.key === 'bruiser-sheet')
    if (!enemy) throw new Error('bruiser missing')
    world.player.x = enemy.x - 80
    enemy.telegraphMs = 0
    enemy.attackMs = 260
    return { enemyX: enemy.x, playerX: world.player.x }
  })
  expect(kickLeft.playerX).toBeLessThan(kickLeft.enemyX)
  await page.waitForTimeout(90)

  const attackLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ face: -1 | 1; scaleX: number; texture: { key: string }; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies.find((candidate) => candidate.texture.key === 'bruiser-sheet')
    if (!enemy) throw new Error('bruiser missing')
    return { enemyX: enemy.x, playerX: world.player.x, face: enemy.face, scaleX: enemy.scaleX, texture: enemy.texture.key }
  })
  expect(attackLeft.playerX).toBeLessThan(attackLeft.enemyX)
  expect(attackLeft.face).toBe(-1)
  expect(Math.sign(attackLeft.scaleX)).toBe(expectedScaleSign(attackLeft.face, 'right'))

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; telegraphMs: number; texture: { key: string }; x: number }>
      player: { x: number }
      level: { worldWidth: number }
    }
    const enemy = world.enemies.find((candidate) => candidate.texture.key === 'bruiser-sheet')
    if (!enemy) throw new Error('bruiser missing')
    enemy.x = 360
    world.player.x = Math.min(enemy.x + 120, world.level.worldWidth - 40)
    enemy.telegraphMs = 0
    enemy.attackMs = 260
  })
  await page.waitForTimeout(90)

  const attackRight = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ face: -1 | 1; scaleX: number; texture: { key: string }; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies.find((candidate) => candidate.texture.key === 'bruiser-sheet')
    if (!enemy) throw new Error('bruiser missing')
    return { enemyX: enemy.x, playerX: world.player.x, face: enemy.face, scaleX: enemy.scaleX, texture: enemy.texture.key }
  })
  expect(attackRight.playerX).toBeGreaterThan(attackRight.enemyX)
  expect(attackRight.face).toBe(1)
  expect(Math.sign(attackRight.scaleX)).toBe(expectedScaleSign(attackRight.face, 'right'))
})

test('switchblade sora walk and attacks face the player', async ({ page }) => {
  await startGame(page)

  const bossFacingLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { attackMs: number; face: -1 | 1; scaleX: number; telegraphMs: number; texture: { key: string }; x: number }
      bossSpawned: boolean
      encounterWaveIndex: number
      activeEncounterId?: string
      activeEncounterGateX?: number
      enemies: Array<{ destroy: () => void }>
      handleBossSpawn: () => void
      level: { boss: { spawnAfterX: number }; encounterWaves?: unknown[] }
      player: { lane: number; x: number }
    }
    world.enemies.forEach((enemy) => enemy.destroy())
    world.enemies = []
    world.encounterWaveIndex = world.level.encounterWaves?.length ?? 0
    world.activeEncounterId = undefined
    world.activeEncounterGateX = undefined
    world.player.x = world.level.boss.spawnAfterX + 4
    world.handleBossSpawn()
    if (!world.boss) throw new Error('boss did not spawn')
    world.player.x = world.boss.x - 120
    world.player.lane = 0.72
    world.boss.telegraphMs = 0
    world.boss.attackMs = 0
    return { bossX: world.boss.x, face: world.boss.face, playerX: world.player.x, scaleX: world.boss.scaleX, texture: world.boss.texture.key }
  })
  await page.waitForTimeout(180)
  const walkLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { face: -1 | 1; scaleX: number; texture: { key: string }; x: number }
      player: { x: number }
    }
    const boss = world.boss
    if (!boss) throw new Error('boss missing')
    return { bossX: boss.x, face: boss.face, playerX: world.player.x, scaleX: boss.scaleX, texture: boss.texture.key }
  })

  expect(bossFacingLeft.texture).toBe('switchblade-sora-sheet')
  expect(walkLeft.playerX).toBeLessThan(walkLeft.bossX)
  expect(walkLeft.face).toBe(-1)
  expect(Math.sign(walkLeft.scaleX)).toBe(expectedScaleSign(walkLeft.face, 'right'))

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { attackMs: number; telegraphMs: number; x: number }
      player: { x: number }
    }
    if (!world.boss) throw new Error('boss missing')
    world.player.x = world.boss.x - 60
    world.boss.telegraphMs = 0
    world.boss.attackMs = 260
  })
  await page.waitForTimeout(90)

  const attackLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { face: -1 | 1; scaleX: number; texture: { key: string }; x: number }
      player: { x: number }
    }
    const boss = world.boss
    if (!boss) throw new Error('boss missing')
    return { bossX: boss.x, face: boss.face, playerX: world.player.x, scaleX: boss.scaleX, texture: boss.texture.key }
  })
  expect(attackLeft.playerX).toBeLessThan(attackLeft.bossX)
  expect(attackLeft.face).toBe(-1)
  expect(Math.sign(attackLeft.scaleX)).toBe(expectedScaleSign(attackLeft.face, 'right'))
})
