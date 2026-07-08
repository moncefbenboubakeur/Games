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

test('exit arrow appears after threats are cleared', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { hp: number }
      bossSpawned: boolean
      enemies: Array<{ hp: number; destroy: () => void }>
    }
    world.bossSpawned = true
    world.boss = undefined
    world.enemies.forEach((enemy) => {
      enemy.hp = 0
      enemy.destroy()
    })
  })

  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level?.exitReady)).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level?.id)).toBe('stage-01-metro-arcade')
})

test('walking into the blinking exit advances to the next China background', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { hp: number }
      bossSpawned: boolean
      enemies: Array<{ hp: number; destroy: () => void }>
      level: { stageClearX: number }
      player: { x: number }
    }
    world.bossSpawned = true
    world.boss = undefined
    world.enemies.forEach((enemy) => {
      enemy.hp = 0
      enemy.destroy()
    })
    world.player.x = world.level.stageClearX + 2
  })
  await expect.poll(() => page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as { stageCleared: boolean }
    return world.stageCleared
  })).toBe(true)

  await expect.poll(() => page.evaluate(() => window.__NEON_GAME__?.scene.isActive('WorldScene'))).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level?.id), { timeout: 5000 }).toBe('stage-02-china-station')
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level?.boss?.id)).toBe('turnstile-ren')
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.player?.hp)).toBe(150)
})

test('final China background clears to the replay screen', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    window.__NEON_GAME__?.scene.stop('WorldScene')
    window.__NEON_GAME__?.scene.stop('UIScene')
    window.__NEON_GAME__?.scene.start('WorldScene', { levelId: 'stage-04-china-night-market' })
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level?.id)).toBe('stage-04-china-night-market')
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.level?.boss?.id)).toBe('lantern-mai')
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { hp: number }
      bossSpawned: boolean
      enemies: Array<{ hp: number; destroy: () => void }>
      level: { stageClearX: number }
      player: { x: number }
    }
    world.bossSpawned = true
    world.boss = undefined
    world.enemies.forEach((enemy) => {
      enemy.hp = 0
      enemy.destroy()
    })
    world.player.x = world.level.stageClearX + 2
  })

  await expect.poll(() => page.evaluate(() => window.__NEON_GAME__?.scene.isActive('StageClearScene'))).toBe(true)
})

test('click replays from stage clear', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => {
    window.__NEON_GAME__?.scene.stop('WorldScene')
    window.__NEON_GAME__?.scene.stop('UIScene')
    window.__NEON_GAME__?.scene.start('StageClearScene', { score: 345 })
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_GAME__?.scene.isActive('StageClearScene'))).toBe(true)

  await page.mouse.click(720, 740)

  await expect.poll(() => page.evaluate(() => window.__NEON_GAME__?.scene.isActive('WorldScene'))).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.player?.hp)).toBe(150)
})
