import { expect, test } from 'playwright/test'

test.setTimeout(90_000)

async function startGame(page: import('playwright/test').Page, levelId = 'stage-01-metro-arcade') {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => typeof window.__NEON_START_LEVEL__ === 'function')
  await page.evaluate((id) => window.__NEON_START_LEVEL__?.(id), levelId)
  await page.waitForFunction((id) => window.__NEON_DEBUG__?.level?.id === id, levelId)
}

async function triggerSecondStageOneWave(page: import('playwright/test').Page) {
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
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      player: { x: number }
    }
    world.player.x = 250
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.encounter.activeId)).toBe('casino-flank-pressure')
}

test('stage world systems spawn hazards props and purposeful NPCs', async ({ page }) => {
  await startGame(page)
  const world = await page.evaluate(() => window.__NEON_DEBUG__?.world)
  expect(world?.hazards.length).toBeGreaterThanOrEqual(1)
  expect(world?.props.length).toBeGreaterThanOrEqual(1)
  expect(world?.npcs.length).toBeGreaterThanOrEqual(1)
  expect(world?.npcs[0].purpose).toContain('background')
})

test('placeholder world extras stay hidden during normal map rendering', async ({ page }) => {
  await startGame(page)
  const worldObjects = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      children: {
        list: Array<{ name?: string; type?: string; visible?: boolean; alpha?: number }>
      }
    }
    return world.children.list
      .filter((item) => item.name?.includes('placeholder-hidden'))
      .map((item) => ({
        name: item.name,
        type: item.type,
        visible: item.visible,
        alpha: item.alpha,
      }))
  })

  expect(worldObjects.length).toBeGreaterThan(0)
  expect(worldObjects.every((item) => item.type === 'Container')).toBe(true)
  expect(worldObjects.every((item) => item.visible === false || item.alpha === 0)).toBe(true)
})

test('passive hazards do not paint permanent placeholder objects over the map', async ({ page }) => {
  await startGame(page)
  const hazards = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      hazards: { update: (time: number, player: unknown) => void }
      player: unknown
      children: {
        list: Array<{ name?: string; type?: string; visible?: boolean; alpha?: number }>
      }
    }
    world.hazards.update(0, world.player)
    return world.children.list
      .filter((item) => item.name?.startsWith('hazard-body'))
      .map((item) => ({
        name: item.name,
        type: item.type,
        visible: item.visible,
        alpha: item.alpha,
      }))
  })

  expect(hazards.length).toBeGreaterThan(0)
  expect(hazards.every((item) => item.type === 'Container')).toBe(true)
  expect(hazards.every((item) => item.visible === false || item.alpha === 0)).toBe(true)
})

test('placeholder hazards do not hurt the player until final readable art exists', async ({ page }) => {
  await startGame(page)
  const result = await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      hazards: { update: (time: number, player: unknown) => void }
      player: { hp: number; invincibleMs: number; lane: number; x: number }
    }
    const hazard = window.__NEON_DEBUG__?.world?.hazards[0]
    if (!hazard) throw new Error('hazard missing')
    world.player.hp = 150
    world.player.invincibleMs = 0
    world.player.x = hazard.x
    world.player.lane = hazard.lane
    world.hazards.update(60_000, world.player)
    return { hp: world.player.hp }
  })

  expect(result.hp).toBe(150)
})

test('enemy roles use role-specific textures', async ({ page }) => {
  await startGame(page)
  const firstWaveTextures = await page.evaluate(() => window.__NEON_DEBUG__?.enemies.map((enemy) => enemy.texture) ?? [])
  await triggerSecondStageOneWave(page)
  const secondWaveTextures = await page.evaluate(() => window.__NEON_DEBUG__?.enemies.map((enemy) => enemy.texture) ?? [])
  const textures = [...firstWaveTextures, ...secondWaveTextures]
  expect(new Set(textures)).toEqual(new Set(['striker-sheet', 'runner-sheet', 'bruiser-sheet', 'thrower-sheet']))
})

test('throwers create real projectiles instead of fake contact hits', async ({ page }) => {
  await startGame(page)
  await triggerSecondStageOneWave(page)
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      enemies: Array<{ attackMs: number; cooldownMs: number; def: { id: string }; destroy: () => void; lane: number; telegraphMs: number; x: number }>
      player: { hp: number; lane: number; x: number }
    }
    const thrower = world.enemies.find((enemy) => enemy.def.id === 'thrower')
    if (!thrower) throw new Error('thrower missing')
    world.enemies.filter((enemy) => enemy !== thrower).forEach((enemy) => enemy.destroy())
    world.enemies = [thrower]
    world.player.hp = 150
    thrower.x = 340
    world.player.x = thrower.x - 96
    world.player.lane = thrower.lane
    thrower.cooldownMs = 9999
    thrower.telegraphMs = 35
    thrower.attackMs = 0
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.world?.projectiles.count), { timeout: 4000 }).toBeGreaterThan(0)
  const hp = await page.evaluate(() => window.__NEON_DEBUG__?.player.hp)
  expect(hp).toBe(150)
})

test('bosses enter data-driven phase states', async ({ page }) => {
  await startGame(page, 'stage-04-china-night-market')
  await page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      boss?: { hp: number; updateEnemy: (dt: number, player: unknown, worldWidth: number) => void }
      enemies: Array<{ destroy: () => void }>
      handleBossSpawn: () => void
      level: { boss: { spawnAfterX: number }; worldWidth: number }
      player: { x: number }
    }
    world.enemies.forEach((enemy) => enemy.destroy())
    world.enemies = []
    world.player.x = world.level.boss.spawnAfterX + 4
    world.handleBossSpawn()
    if (!world.boss) throw new Error('boss missing')
    world.boss.hp = 70
    world.boss.updateEnemy(16, world.player, world.level.worldWidth)
  })
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.boss?.phase)).toBe('final-lantern')
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.world?.projectiles.count)).toBeGreaterThanOrEqual(3)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.enemies.some((enemy) => enemy.texture === 'thrower-sheet'))).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.world?.hazards.find((hazard) => hazard.id === 'rolling-market-cart')?.forcedActive)).toBe(true)
})
