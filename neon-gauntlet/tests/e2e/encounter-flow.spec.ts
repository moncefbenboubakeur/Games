import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => !!window.__NEON_GAME__ && typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

test('stage one starts with a staged opening wave, not the full enemy roster', async ({ page }) => {
  await startGame(page)

  const state = await page.evaluate(() => window.__NEON_DEBUG__)

  expect(state?.encounter.totalWaves).toBe(2)
  expect(state?.encounter.activeId).toBe('casino-door-open')
  expect(state?.encounter.waveIndex).toBe(1)
  expect(state?.encounter.gateX).toBe(214)
  expect(state?.enemies.filter((enemy) => enemy.hp > 0)).toHaveLength(2)
  expect(state?.enemies.map((enemy) => enemy.texture).sort()).toEqual(['runner-sheet', 'striker-sheet'])
})

test('active encounter gates player movement until the wave is clear', async ({ page }) => {
  await startGame(page)

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      activeEncounterGateX: number
      player: { x: number }
    }
    world.player.x = world.activeEncounterGateX + 72
  })
  await page.waitForTimeout(120)

  const state = await page.evaluate(() => window.__NEON_DEBUG__)
  expect(state?.player.x).toBeLessThanOrEqual(214)
  expect(state?.encounter.activeId).toBe('casino-door-open')
  expect(state?.level.exitReady).toBe(false)
})

test('clearing one pocket releases movement and later triggers the next pocket', async ({ page }) => {
  await startGame(page)

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
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level.exitReady)).toBe(false)

  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      player: { x: number }
    }
    world.player.x = 250
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.encounter.activeId)).toBe('casino-flank-pressure')

  const state = await page.evaluate(() => window.__NEON_DEBUG__)
  expect(state?.encounter.gateX).toBe(390)
  expect(state?.enemies.filter((enemy) => enemy.hp > 0)).toHaveLength(2)
  expect(state?.enemies.map((enemy) => enemy.texture).sort()).toEqual(['bruiser-sheet', 'thrower-sheet'])
})
