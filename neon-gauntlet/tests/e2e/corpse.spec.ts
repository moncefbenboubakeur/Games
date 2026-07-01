import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => !!window.__NEON_GAME__ && typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

test('defeated enemies linger briefly as corpses then disappear', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ hp: number; hurt: (amount: number, knockback: number) => boolean }>
    }
    world.enemies[0]?.hurt(999, 0)
    ;(window as Window & { __NEON_DEATH_TEST_STARTED__?: number }).__NEON_DEATH_TEST_STARTED__ = performance.now()
  })

  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.enemies.find((enemy) => enemy.hp <= 0)?.active)).toBe(true)
  await page.waitForFunction(() => {
    const started = (window as Window & { __NEON_DEATH_TEST_STARTED__?: number }).__NEON_DEATH_TEST_STARTED__
    return !!started && performance.now() - started >= 700
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.enemies.some((enemy) => enemy.hp <= 0 && enemy.active))).toBe(true)

  await page.waitForFunction(() => {
    const started = (window as Window & { __NEON_DEATH_TEST_STARTED__?: number }).__NEON_DEATH_TEST_STARTED__
    return !!started && performance.now() - started >= 1_800
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.enemies.every((enemy) => enemy.hp > 0))).toBe(true)
})
