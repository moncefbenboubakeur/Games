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

  const timeline = await page.evaluate(async () => {
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ active: boolean; alpha: number; hp: number; hurt: (amount: number, knockback: number) => boolean }>
    }
    world.enemies[0]?.hurt(999, 0)

    const sample = () => world.enemies.map((enemy) => ({
      active: enemy.active,
      alpha: enemy.alpha,
      hp: enemy.hp,
    }))

    await waitFrame()
    const immediate = sample()
    await wait(700)
    const lingering = sample()
    await wait(1_200)
    const cleared = sample()
    return { immediate, lingering, cleared }
  })

  expect(timeline.immediate.some((enemy) => enemy.hp <= 0 && enemy.active)).toBe(true)
  expect(timeline.lingering.some((enemy) => enemy.hp <= 0 && enemy.active)).toBe(true)
  expect(timeline.cleared.every((enemy) => enemy.hp > 0)).toBe(true)
})
