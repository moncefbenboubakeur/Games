import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
}

async function playerX(page: import('playwright/test').Page) {
  return page.evaluate(() => window.__NEON_DEBUG__?.player?.x || 0)
}

test('keyboard arrows stop moving after key release', async ({ page }) => {
  await startGame(page)
  await page.locator('canvas').click({ position: { x: 300, y: 300 } })
  const start = await playerX(page)

  await page.keyboard.down('ArrowRight')
  await page.waitForTimeout(1_000)
  await page.keyboard.up('ArrowRight')
  await page.waitForTimeout(120)
  const afterRelease = await playerX(page)
  await page.waitForTimeout(900)
  const later = await playerX(page)

  expect(afterRelease).toBeGreaterThan(start + 8)
  expect(later).toBeLessThanOrEqual(afterRelease + 2)
})

test('touch direction buttons stop moving after pointer release', async ({ page }) => {
  await startGame(page)
  const canvas = await page.locator('canvas').boundingBox()
  if (!canvas) throw new Error('Missing game canvas')
  const screen = (x: number, y: number) => ({
    x: canvas.x + (x / 426) * canvas.width,
    y: canvas.y + (y / 240) * canvas.height,
  })
  const rightButton = screen(87, 201)
  const start = await playerX(page)

  await page.mouse.move(rightButton.x, rightButton.y)
  await page.mouse.down()
  await page.waitForTimeout(1_000)
  await page.mouse.up()
  await page.waitForTimeout(120)
  const afterRelease = await playerX(page)
  await page.waitForTimeout(900)
  const later = await playerX(page)

  expect(afterRelease).toBeGreaterThan(start + 8)
  expect(later).toBeLessThanOrEqual(afterRelease + 2)
})
