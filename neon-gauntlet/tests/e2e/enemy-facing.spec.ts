import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => !!window.__NEON_GAME__ && typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

test('enemy kick frames point toward the player', async ({ page }) => {
  await startGame(page)
  await page.waitForTimeout(250)

  const walkingLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ face: -1 | 1; scaleX: number; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies[2]
    return { enemyX: enemy.x, playerX: world.player.x, face: enemy.face, scaleX: enemy.scaleX }
  })
  expect(walkingLeft.playerX).toBeLessThan(walkingLeft.enemyX)
  expect(walkingLeft.face).toBe(-1)
  expect(walkingLeft.scaleX).toBeGreaterThan(0)

  const kickLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; face: -1 | 1; scaleX: number; telegraphMs: number; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies[2]
    world.player.x = enemy.x - 80
    enemy.telegraphMs = 0
    enemy.attackMs = 240
    return { enemyX: enemy.x, playerX: world.player.x }
  })
  expect(kickLeft.playerX).toBeLessThan(kickLeft.enemyX)
  await page.waitForTimeout(250)

  const attackLeft = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ face: -1 | 1; scaleX: number; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies[2]
    return { enemyX: enemy.x, playerX: world.player.x, face: enemy.face, scaleX: enemy.scaleX }
  })
  expect(attackLeft.playerX).toBeLessThan(attackLeft.enemyX)
  expect(attackLeft.face).toBe(-1)
  expect(attackLeft.scaleX).toBeLessThan(0)

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; telegraphMs: number; x: number }>
      player: { x: number }
      level: { worldWidth: number }
    }
    const enemy = world.enemies[2]
    world.player.x = Math.min(enemy.x + 120, world.level.worldWidth - 40)
    enemy.telegraphMs = 0
    enemy.attackMs = 240
  })
  await page.waitForTimeout(250)

  const attackRight = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ face: -1 | 1; scaleX: number; x: number }>
      player: { x: number }
    }
    const enemy = world.enemies[2]
    return { enemyX: enemy.x, playerX: world.player.x, face: enemy.face, scaleX: enemy.scaleX }
  })
  expect(attackRight.playerX).toBeGreaterThan(attackRight.enemyX)
  expect(attackRight.face).toBe(1)
  expect(attackRight.scaleX).toBeGreaterThan(0)
})
