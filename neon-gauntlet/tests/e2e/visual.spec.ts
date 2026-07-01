import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
  await page.evaluate(() => window.__NEON_FREEZE__?.())
}

test('stage 1 idle baseline', async ({ page }) => {
  await startGame(page)
  await expect(page.locator('canvas')).toHaveScreenshot('stage-01-idle.png')
})

test('gameplay state is available for agents', async ({ page }) => {
  await startGame(page)
  const state = await page.evaluate(() => window.__NEON_DEBUG__)
  expect(state?.player?.hp).toBe(150)
  expect(state?.level?.name).toBe('Metro Arcade')
  expect(state?.enemies.length).toBeGreaterThanOrEqual(4)
})
