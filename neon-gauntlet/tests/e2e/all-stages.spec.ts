import { expect, test } from 'playwright/test'

const stages = [
  ['stage-01-metro-arcade', 'switchblade-sora'],
  ['stage-02-china-station', 'turnstile-ren'],
  ['stage-03-china-back-alley', 'iron-wei'],
  ['stage-04-china-night-market', 'lantern-mai'],
  ['stage-05-solar-foundry', 'forge-aya'],
  ['stage-06-skybridge-district', 'drone-queen-nova'],
  ['stage-07-data-garden', 'cipher-iris'],
  ['stage-08-harbor-storm', 'harbor-hale'],
  ['stage-09-broadcast-tower', 'signal-vex'],
  ['stage-10-neon-core', 'zero-volt-ren'],
] as const

test.describe('all stage smoke coverage', () => {
  test.setTimeout(120_000)

  for (const [levelId, bossId] of stages) {
    test(`${levelId} starts with required world systems`, async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('canvas')
      await page.waitForFunction(() => typeof window.__NEON_START_LEVEL__ === 'function')
      await page.evaluate((id) => window.__NEON_START_LEVEL__?.(id), levelId)
      await page.waitForFunction((id) => window.__NEON_DEBUG__?.level?.id === id, levelId)

      const state = await page.evaluate(() => window.__NEON_DEBUG__)
      expect(state?.level.id).toBe(levelId)
      expect(state?.level.boss?.id).toBe(bossId)
      expect(state?.player.hp).toBe(150)
      expect(state?.enemies.length).toBeGreaterThanOrEqual(1)
      expect(state?.world?.hazards.length).toBeGreaterThanOrEqual(1)
      expect(state?.world?.props.length).toBeGreaterThanOrEqual(1)
      expect(state?.world?.npcs.length).toBeGreaterThanOrEqual(1)
      expect(state?.assets.scenePlates).toBeGreaterThanOrEqual(1)
      expect(state?.assets.renderedTileLayers).toBe(0)
      expect(state?.assets.prototypeTileLayersVisible).toBe(0)
    })
  }
})
