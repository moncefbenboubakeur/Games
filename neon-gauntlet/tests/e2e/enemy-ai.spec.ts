import { expect, test } from 'playwright/test'

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
})

test('enemy walk animation uses a complete stepping cycle only while moving', async ({ page }) => {
  await startGame(page)

  const idleFrame = await page.evaluate(async () => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; frame: { name: string }; lane: number; telegraphMs: number; x: number }>
      player: { lane: number; x: number }
    }
    const enemy = world.enemies[0]
    world.player.x = enemy.x
    world.player.lane = enemy.lane
    enemy.cooldownMs = 9999
    enemy.telegraphMs = 0
    enemy.attackMs = 0
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
    for (let i = 0; i < 8; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 140))
      frames.push(enemy.frame.name)
    }
    return frames
  })

  expect(new Set(walkingFrames)).toEqual(new Set(['enemy-walk-0', 'enemy-walk-1', 'enemy-walk-2']))
  expect(walkingFrames.filter((frame) => frame === 'enemy-walk-1').length).toBeGreaterThanOrEqual(2)
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
      enemies: Array<{ attackMs: number; telegraphMs: number }>
      player: { hp: number }
    }
    return {
      attackMs: world.enemies[0].attackMs,
      telegraphMs: world.enemies[0].telegraphMs,
      playerHp: world.player.hp,
    }
  })

  expect(state.attackMs).toBe(0)
  expect(state.playerHp).toBe(150)
})
