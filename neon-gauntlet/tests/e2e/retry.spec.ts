import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => !!window.__NEON_GAME__ && typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

test('enter retries from game over', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    window.__NEON_GAME__?.scene.stop('WorldScene')
    window.__NEON_GAME__?.scene.stop('UIScene')
    window.__NEON_GAME__?.scene.start('GameOverScene')
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_GAME__?.scene.isActive('GameOverScene'))).toBe(true)

  await page.keyboard.press('Enter')

  await expect.poll(() => page.evaluate(() => window.__NEON_GAME__?.scene.isActive('WorldScene'))).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.player?.hp)).toBe(150)
})
