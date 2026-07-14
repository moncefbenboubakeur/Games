import { expect, test } from 'playwright/test'

async function startGame(page: import('playwright/test').Page, options: { touchControls?: boolean } = {}) {
  await page.goto(options.touchControls ? '/?touchControls=1' : '/')
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
  await page.evaluate(() => window.focus())
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
  await expect
    .poll(() => page.evaluate(() => window.__NEON_DEBUG__?.input?.normalized.right))
    .toBe(false)
  expect(await page.evaluate(() => window.__NEON_DEBUG__?.input?.keyboard.windowKeys)).toEqual([])
})

test('keyboard J P and Enter all trigger punch', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => window.focus())

  for (const key of ['KeyJ', 'KeyP', 'Enter']) {
    const before = await page.evaluate(() => window.__NEON_DEBUG__?.player.combo || 0)
    await page.keyboard.press(key)
    await expect
      .poll(() => page.evaluate(() => window.__NEON_DEBUG__?.combat?.playerAttack?.kind || null))
      .toBe('punch')
    const after = await page.evaluate(() => window.__NEON_DEBUG__?.player.combo || 0)
    expect(after, `${key} should increment combo through punch`).toBeGreaterThan(before)
    await page.waitForTimeout(360)
  }
})

test('keyboard L toggles guard up and down', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => window.focus())

  await page.keyboard.press('KeyL')
  await expect.poll(() => page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      player?: { frame: { name: string }; guard: boolean }
    }
    return { frame: world.player?.frame.name, guard: world.player?.guard }
  })).toMatchObject({ frame: expect.stringMatching(/^player-guard/), guard: true })

  await page.keyboard.press('KeyL')
  await expect.poll(() => page.evaluate(() => {
    const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
      player?: { frame: { name: string }; guard: boolean }
    }
    return { frame: world.player?.frame.name, guard: world.player?.guard }
  })).toMatchObject({ frame: 'player-idle-0', guard: false })
})

test('touch direction buttons stop moving after pointer release', async ({ page }) => {
  await startGame(page, { touchControls: true })
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

test('touch buttons trigger only their intended actions', async ({ page }) => {
  test.setTimeout(90_000)
  await startGame(page, { touchControls: true })
  const canvas = await page.locator('canvas').boundingBox()
  if (!canvas) throw new Error('Missing game canvas')
  const screen = (x: number, y: number) => ({
    x: canvas.x + (x / 426) * canvas.width,
    y: canvas.y + (y / 240) * canvas.height,
  })
  const buttons: Array<[number, number, string]> = [
    [63, 179, 'up'],
    [63, 223, 'down'],
    [39, 201, 'left'],
    [87, 201, 'right'],
    [314, 195, 'punch'],
    [350, 195, 'kick'],
    [332, 220, 'jump'],
    [386, 212, 'guard'],
  ]

  for (const [x, y, action] of buttons) {
    const point = screen(x, y)
    await page.mouse.move(point.x, point.y)
    await page.mouse.down()
    await page.waitForTimeout(10)
    const activeActions = await page.evaluate(() => {
      const world = window.__NEON_GAME__?.scene.getScene('WorldScene') as unknown as {
        inputSystem?: { held: Record<string, boolean> }
      }
      return Object.entries(world.inputSystem?.held || {})
        .filter(([, active]) => active)
        .map(([name]) => name)
    })
    expect(activeActions, `${action} should be the only active touch action`).toEqual([action])
    await page.mouse.up()
    await page.waitForTimeout(10)
  }
})

test('desktop play does not show touch controls over the map', async ({ page }) => {
  await startGame(page)
  const visibleLabels = await page.evaluate(() => {
    const ui = window.__NEON_GAME__?.scene.getScene('UIScene') as unknown as {
      children: { list: Array<{ type?: string; text?: string; visible?: boolean; alpha?: number }> }
    }
    return ui.children.list
      .filter((item) => item.type === 'Text' && item.visible !== false && (item.alpha ?? 1) > 0.05)
      .map((item) => item.text || '')
  })

  expect(visibleLabels).not.toContain('MOVE')
  expect(visibleLabels).not.toContain('COMBO')
  expect(visibleLabels).not.toContain('PUNCH')
  expect(visibleLabels).not.toContain('KICK')
})

test('gamepad analog movement stops when centered', async ({ page }) => {
  await startGame(page)
  const start = await playerX(page)

  await page.evaluate(() => {
    window.__NEON_TEST_GAMEPAD__ = { axes: [1, 0], buttons: [] }
  })
  await page.waitForTimeout(900)
  await page.evaluate(() => {
    window.__NEON_TEST_GAMEPAD__ = { axes: [0, 0], buttons: [] }
  })
  await page.waitForTimeout(120)
  const afterRelease = await playerX(page)
  await page.waitForTimeout(500)
  const later = await playerX(page)

  expect(afterRelease).toBeGreaterThan(start + 8)
  expect(later).toBeLessThanOrEqual(afterRelease + 2)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.input?.normalized.right)).toBe(false)
  await expect.poll(() => page.evaluate(() => window.__NEON_DEBUG__?.input?.gamepad.connected)).toBe(true)
})

test('gamepad action buttons are edge triggered, not spammed while held', async ({ page }) => {
  await startGame(page)

  await page.evaluate(() => {
    window.__NEON_TEST_GAMEPAD__ = { axes: [0, 0], buttons: Array.from({ length: 16 }, (_, index) => index === 2) }
  })
  await page.waitForTimeout(380)
  const heldCombo = await page.evaluate(() => window.__NEON_DEBUG__?.player.combo)
  expect(heldCombo).toBe(1)

  await page.evaluate(() => {
    window.__NEON_TEST_GAMEPAD__ = { axes: [0, 0], buttons: [] }
  })
  await page.waitForTimeout(60)
  await page.evaluate(() => {
    window.__NEON_TEST_GAMEPAD__ = { axes: [0, 0], buttons: Array.from({ length: 16 }, (_, index) => index === 2) }
  })
  await page.waitForTimeout(80)
  const secondPressCombo = await page.evaluate(() => window.__NEON_DEBUG__?.player.combo)
  expect(secondPressCombo).toBe(2)
})
