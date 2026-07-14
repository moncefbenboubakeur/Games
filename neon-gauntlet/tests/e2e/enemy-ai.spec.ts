import { expect, test } from 'playwright/test'

test.setTimeout(90_000)

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => !!window.__NEON_GAME__ && typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

test('enemies chase instead of attacking empty air when the player is far away', async ({ page }) => {
  await startGame(page)

  const setup = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; telegraphMs: number; x: number }>
      player: { lane: number; x: number }
    }
    const enemy = world.enemies[0]
    world.player.x = 70
    world.player.lane = 0.72
    enemy.x = 360
    enemy.cooldownMs = -1
    enemy.telegraphMs = 0
    enemy.attackMs = 0
    return { startX: enemy.x }
  })

  await page.waitForTimeout(250)

  const state = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; telegraphMs: number; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies[0]
    return {
      enemyX: enemy.x,
      playerX: world.player.x,
      attackMs: enemy.attackMs,
      telegraphMs: enemy.telegraphMs,
    }
  })

  expect(state.playerX).toBeLessThan(state.enemyX - 100)
  expect(state.enemyX).toBeLessThan(setup.startX)
  expect(state.telegraphMs).toBe(0)
  expect(state.attackMs).toBe(0)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.enemies[0]?.aiState)).not.toBe('telegraph')
})

test('enemy walk animation uses a complete stepping cycle only while moving', async ({ page }) => {
  await startGame(page)

  const idleFrame = await page.evaluate(async () => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{
        attackMs: number
        cooldownMs: number
        frame: { name: string }
        lane: number
        telegraphMs: number
        updateEnemy: (dt: number, player: unknown, worldWidth: number) => void
        x: number
      }>
      level: { worldWidth: number }
      player: { lane: number; x: number }
    }
    const enemy = world.enemies[0]
    enemy.x = 120
    world.player.x = enemy.x
    world.player.lane = enemy.lane
    enemy.cooldownMs = 9999
    enemy.telegraphMs = 0
    enemy.attackMs = 0
    enemy.updateEnemy(16, world.player, world.level.worldWidth)
    await new Promise((resolve) => setTimeout(resolve, 180))
    return enemy.frame.name
  })
  expect(idleFrame).toBe('enemy-idle-0')

  const walkingFrames = await page.evaluate(async () => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; frame: { name: string }; lane: number; telegraphMs: number; x: number }>
      player: { lane: number; x: number }
    }
    const enemy = world.enemies[0]
    world.player.x = 70
    world.player.lane = enemy.lane
    enemy.x = 360
    enemy.cooldownMs = 9999
    enemy.telegraphMs = 0
    enemy.attackMs = 0
    const frames: string[] = []
    for (let i = 0; i < 22; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 90))
      frames.push(enemy.frame.name)
    }
    return frames
  })

  expect(new Set(walkingFrames)).toEqual(new Set(['enemy-walk-0', 'enemy-walk-1', 'enemy-walk-2', 'enemy-walk-3']))
})

test('combat staging keeps same-side enemies from stacking on the player', async ({ page }) => {
  await startGame(page)

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; lane: number; telegraphMs: number; x: number }>
      player: { lane: number; x: number }
    }
    world.player.x = 70
    world.player.lane = 0.72
    world.enemies[0].x = 360
    world.enemies[0].lane = 0.72
    world.enemies[0].cooldownMs = 9999
    world.enemies[0].telegraphMs = 0
    world.enemies[0].attackMs = 0
    world.enemies[1].x = 420
    world.enemies[1].lane = 0.72
    world.enemies[1].cooldownMs = 9999
    world.enemies[1].telegraphMs = 0
    world.enemies[1].attackMs = 0
  })

  await page.waitForTimeout(700)

  const state = await page.evaluate(() => {
    const enemies = window.__NEON_DEBUG__?.enemies.slice(0, 2) ?? []
    return {
      separation: Math.abs((enemies[0]?.x ?? 0) - (enemies[1]?.x ?? 0)),
      states: enemies.map((enemy) => enemy.aiState),
      reasons: enemies.map((enemy) => enemy.aiReason),
    }
  })

  expect(state.separation).toBeGreaterThanOrEqual(32)
  expect(state.states).not.toContain('telegraph')
  expect(state.reasons).toContain('closing-distance')
})

test('enemies cancel their windup if the player escapes before the hit frame', async ({ page }) => {
  await startGame(page)

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; destroy: () => void; lane: number; telegraphMs: number; x: number }>
      player: { hp: number; lane: number; x: number }
    }
    const enemy = world.enemies[0]
    world.enemies.slice(1).forEach((other) => other.destroy())
    world.enemies = [enemy]
    world.player.hp = 150
    world.player.x = 190
    world.player.lane = 0.72
    enemy.x = 222
    enemy.lane = 0.72
    enemy.cooldownMs = 9999
    enemy.telegraphMs = 260
    enemy.attackMs = 0
  })

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      player: { lane: number; x: number }
    }
    world.player.x = 72
    world.player.lane = 0.72
  })
  await page.waitForTimeout(360)

  const state = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; frame: { name: string }; telegraphMs: number }>
      player: { hp: number }
    }
    return {
      attackMs: world.enemies[0].attackMs,
      frame: world.enemies[0].frame.name,
      telegraphMs: world.enemies[0].telegraphMs,
      playerHp: world.player.hp,
    }
  })

  expect(state.telegraphMs).toBe(0)
  expect(state.attackMs).toBe(0)
  expect(state.frame.startsWith('enemy-guard')).toBe(false)
  expect(state.playerHp).toBe(150)
})

test('far enemies do not randomly guard when there is no threat', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; lane: number; telegraphMs: number; x: number }>
      player: { lane: number; x: number }
    }
    const enemy = world.enemies[0]
    world.player.x = 60
    world.player.lane = 0.72
    enemy.x = 430
    enemy.lane = 0.72
    enemy.attackMs = 0
    enemy.telegraphMs = 0
    enemy.cooldownMs = 9999
  })
  await page.waitForTimeout(300)

  const state = await page.evaluate(() => window.__NEON_DEBUG__?.enemies[0])
  expect(state?.aiState).toBe('pursue')
  expect(state?.aiReason).toBe('closing-distance')
})

test('spawned bosses use boss-specific textures', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => typeof window.__NEON_START_LEVEL__ === 'function')
  await page.evaluate(() => window.__NEON_START_LEVEL__?.('stage-04-china-night-market'))
  await page.waitForFunction(() => window.__NEON_DEBUG__?.level?.id === 'stage-04-china-night-market')
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      handleBossSpawn: () => void
      level: { boss: { spawnAfterX: number } }
      player: { x: number }
    }
    world.player.x = world.level.boss.spawnAfterX + 4
    world.handleBossSpawn()
  })

  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.boss?.id)).toBe('lantern-mai')
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.enemies.find((enemy) => enemy.texture === 'lantern-mai-sheet')?.texture)).toBe('lantern-mai-sheet')
})
