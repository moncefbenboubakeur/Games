import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const gameId = process.argv[2]
if (!gameId) {
  console.error('Usage: node tools/smoke-game.mjs <game-id>')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const games = JSON.parse(readFileSync(resolve(root, 'games.json'), 'utf8'))
const game = games.find((entry) => entry.id === gameId)
if (!game) {
  console.error(`Unknown game id: ${gameId}`)
  process.exit(1)
}

const gameDir = resolve(root, game.path)
const server = spawn(game.startCommand, {
  cwd: gameDir,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: String(game.port) },
})

let output = ''
server.stdout.on('data', (chunk) => { output += chunk.toString() })
server.stderr.on('data', (chunk) => { output += chunk.toString() })

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}

async function waitForServer(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await sleep(250)
  }
  throw new Error(`Server did not become ready at ${url}\n${output}`)
}

async function main() {
  await waitForServer(game.entryUrl)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto(game.entryUrl, { waitUntil: 'networkidle' })
  const startButton = page.locator('#start-play')
  if (await startButton.count()) await startButton.click()
  await page.waitForTimeout(1000)

  mkdirSync(resolve(root, 'test-results'), { recursive: true })
  const screenshot = resolve(root, 'test-results', `${game.id}-smoke.png`)
  await page.screenshot({ path: screenshot, fullPage: false })

  const state = await page.evaluate(() => ({
    title: document.title,
    hasCanvas: !!document.querySelector('canvas'),
    player: typeof player !== 'undefined' && player ? { x: Math.round(player.x), hp: player.hp } : null,
    level: typeof level !== 'undefined' && level ? level.name : null,
    enemies: typeof enemies !== 'undefined' && Array.isArray(enemies) ? enemies.filter((enemy) => enemy.hp > 0).length : null,
    assets: typeof assets !== 'undefined'
      ? Object.fromEntries(Object.entries(assets).map(([key, value]) => [
        key,
        {
          loaded: !!(value.complete && value.naturalWidth),
          src: value.src,
        },
      ]))
      : null,
    youtubeImports: performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.includes('/Youtube++') || name.includes('/public/games/')),
  }))

  await browser.close()

  const failedAssets = state.assets
    ? Object.entries(state.assets).filter(([, value]) => !value.loaded).map(([key]) => key)
    : []
  const failures = [
    ...errors.map((error) => `console/page error: ${error}`),
    !state.hasCanvas && 'missing canvas',
    !state.player && 'missing player state',
    !state.level && 'missing level state',
    failedAssets.length > 0 && `failed assets: ${failedAssets.join(', ')}`,
    state.youtubeImports.length > 0 && `imports from Youtube++/public games: ${state.youtubeImports.join(', ')}`,
  ].filter(Boolean)

  console.log(JSON.stringify({ game: game.id, state, screenshot, failures }, null, 2))
  if (failures.length) process.exit(1)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => {
    server.kill('SIGTERM')
  })
