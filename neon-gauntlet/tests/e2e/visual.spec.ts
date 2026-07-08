import { expect, test } from 'playwright/test'

const screenshotOptions = { timeout: 30_000 }

test.setTimeout(90_000)

async function startGame(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => typeof window.__NEON_START__ === 'function')
  await page.evaluate(() => window.__NEON_START__?.())
  await page.waitForFunction(() => !!window.__NEON_DEBUG__?.player)
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.__NEON_FREEZE__?.())
}

async function startLiveGame(page: import('playwright/test').Page, levelId = 'stage-01-metro-arcade') {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => typeof window.__NEON_START_LEVEL__ === 'function')
  await page.evaluate((id) => window.__NEON_START_LEVEL__?.(id), levelId)
  await page.waitForFunction((id) => window.__NEON_DEBUG__?.level?.id === id, levelId)
  await page.waitForTimeout(1200)
}

async function freeze(page: import('playwright/test').Page) {
  await page.evaluate(() => window.__NEON_FREEZE__?.())
  await page.waitForTimeout(80)
}

test('stage 1 idle baseline', async ({ page }) => {
  await startGame(page)
  await page.waitForTimeout(250)
  await expect(page.locator('canvas')).toHaveScreenshot('stage-01-idle.png', screenshotOptions)
})

test('player punch baseline', async ({ page }) => {
  await startLiveGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ destroy: () => void }>
      level: { worldWidth: number }
      player: { attackKind: 'punch'; attackMs: number; updatePlayer: (dt: number, input: Record<string, boolean>, width: number) => void; x: number }
    }
    world.enemies.forEach((enemy) => enemy.destroy())
    world.player.x = 142
    world.player.attackKind = 'punch'
    world.player.attackMs = 145
    world.player.updatePlayer(0, {}, world.level.worldWidth)
  })
  await freeze(page)
  await expect(page.locator('canvas')).toHaveScreenshot('player-punch.png', screenshotOptions)
})

test('player kick baseline', async ({ page }) => {
  await startLiveGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ destroy: () => void }>
      level: { worldWidth: number }
      player: { attackKind: 'kick'; attackMs: number; updatePlayer: (dt: number, input: Record<string, boolean>, width: number) => void; x: number }
    }
    world.enemies.forEach((enemy) => enemy.destroy())
    world.player.x = 142
    world.player.attackKind = 'kick'
    world.player.attackMs = 105
    world.player.updatePlayer(0, {}, world.level.worldWidth)
  })
  await freeze(page)
  await expect(page.locator('canvas')).toHaveScreenshot('player-kick.png', screenshotOptions)
})

test('player jump baseline', async ({ page }) => {
  await startLiveGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ destroy: () => void }>
      level: { worldWidth: number }
      player: { updatePlayer: (dt: number, input: Record<string, boolean>, width: number) => void; x: number; z: number }
    }
    world.enemies.forEach((enemy) => enemy.destroy())
    world.player.x = 142
    world.player.z = 62
    world.player.updatePlayer(0, {}, world.level.worldWidth)
  })
  await freeze(page)
  await expect(page.locator('canvas')).toHaveScreenshot('player-jump.png', screenshotOptions)
})

test('enemy action baseline', async ({ page }) => {
  await startLiveGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; destroy: () => void; telegraphMs: number; updateFrame: () => void; x: number }>
      player: { x: number }
    }
    world.enemies.slice(1).forEach((enemy) => enemy.destroy())
    const enemy = world.enemies[0]
    world.player.x = 110
    enemy.x = 190
    enemy.telegraphMs = 0
    enemy.attackMs = 205
    enemy.updateFrame()
  })
  await freeze(page)
  await expect(page.locator('canvas')).toHaveScreenshot('enemy-punch-state.png', screenshotOptions)
})

test('enemy hurt/down baseline', async ({ page }) => {
  await startLiveGame(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ destroy: () => void; hp: number; updateFrame: (force?: 'down') => void; x: number }>
      player: { x: number }
    }
    world.enemies.slice(1).forEach((enemy) => enemy.destroy())
    const enemy = world.enemies[0]
    world.player.x = 110
    enemy.x = 210
    enemy.hp = 0
    enemy.updateFrame('down')
  })
  await freeze(page)
  await expect(page.locator('canvas')).toHaveScreenshot('enemy-down-state.png', screenshotOptions)
})

test('boss state baseline', async ({ page }) => {
  await startLiveGame(page, 'stage-04-china-night-market')
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { attackMs: number; telegraphMs: number; updateFrame: () => void; x: number }
      bossSpawned: boolean
      enemies: Array<{ destroy: () => void }>
      handleBossSpawn: () => void
      level: { boss: { spawnAfterX: number } }
      player: { x: number }
    }
    world.enemies.forEach((enemy) => enemy.destroy())
    world.player.x = world.level.boss.spawnAfterX + 4
    world.handleBossSpawn()
    if (world.boss) {
      world.boss.x = world.player.x + 70
      world.boss.telegraphMs = 0
      world.boss.attackMs = 210
      world.boss.updateFrame()
    }
  })
  await freeze(page)
  await expect(page.locator('canvas')).toHaveScreenshot('boss-attack-state.png', screenshotOptions)
})

test('gameplay state is available for agents', async ({ page }) => {
  await startGame(page)
  const state = await page.evaluate(() => window.__NEON_DEBUG__)
  expect(state?.player?.hp).toBe(150)
  expect(state?.level?.name).toBe('China Metro Arcade')
  expect(state?.enemies.length).toBeGreaterThanOrEqual(4)
  expect(state?.assets.stage1).toBe(true)
  expect(state?.assets.tileset).toBe(true)
  expect(state?.assets.tileLayers).toBeGreaterThanOrEqual(4)
  expect(state?.assets.scenePlates).toBeGreaterThanOrEqual(1)
  expect(state?.assets.renderedTileLayers).toBe(0)
  expect(state?.assets.prototypeTileLayersVisible).toBe(0)
})
