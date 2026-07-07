import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateMapContract } from './lib/map-contract.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)

function arg(name, fallback = undefined) {
  const index = args.indexOf(name)
  if (index === -1) return fallback
  return args[index + 1] ?? fallback
}

function has(name) {
  return args.includes(name)
}

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeJson(file, data, dryRun) {
  if (dryRun) return
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

function writeText(file, data, dryRun) {
  if (dryRun) return
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, data)
}

function tileData(width, height, tile) {
  return Array(width * height).fill(tile)
}

function prop(name, type, value) {
  return { name, type, value }
}

function object(id, name, type, x, y, properties = [], width = 0, height = 0) {
  return { id, name, type, x, y, width, height, properties }
}

function placeholderScenePlate(levelId, levelName) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1408" height="240" viewBox="0 0 1408 240" shape-rendering="crispEdges">
  <rect width="1408" height="240" fill="#090b14"/>
  <rect y="0" width="1408" height="154" fill="#141226"/>
  <rect y="154" width="1408" height="86" fill="#16182b"/>
  <text x="48" y="70" fill="#5df2ff" font-family="Menlo, Consolas, monospace" font-size="28">${levelName}</text>
  <text x="48" y="104" fill="#ff5aa7" font-family="Menlo, Consolas, monospace" font-size="16">PLACEHOLDER SCENE PLATE - replace with production art</text>
  <text x="48" y="132" fill="#f7d36a" font-family="Menlo, Consolas, monospace" font-size="14">${levelId}</text>
  <rect x="0" y="176" width="1408" height="4" fill="#2e344f"/>
  <rect x="0" y="214" width="1408" height="3" fill="#35dff5"/>
</svg>
`
}

function buildLevel({ id, name, boss, width }) {
  return {
    id,
    name,
    worldWidth: width,
    background: `${id}-scene-plate`,
    music: 'stage-01',
    playerSpawn: { x: 76, lane: 0.72 },
    enemyWaves: [
      { x: 330, lane: 0.7, role: 'striker' },
      { x: 470, lane: 0.76, role: 'runner' },
      { x: 620, lane: 0.68, role: 'bruiser' },
    ],
    boss: { id: boss, x: Math.max(900, width - 280), lane: 0.72, spawnAfterX: Math.max(650, width - 550) },
    stageClearX: width - 80,
    map: `${id}-map`,
  }
}

function buildMap({ id, name, boss, width }) {
  const tilewidth = 16
  const tileheight = 16
  const mapWidth = Math.ceil(width / tilewidth)
  const mapHeight = 15
  const worldWidth = mapWidth * tilewidth
  return {
    type: 'map',
    version: '1.10',
    tiledversion: '1.10.2',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    width: mapWidth,
    height: mapHeight,
    tilewidth,
    tileheight,
    infinite: false,
    nextlayerid: 14,
    nextobjectid: 17,
    properties: [prop('backgroundTexture', 'string', `${id}-scene-plate`), prop('music', 'string', 'stage-01')],
    tilesets: [{
      firstgid: 1,
      name: 'metro-tiles',
      tilewidth,
      tileheight,
      spacing: 0,
      margin: 0,
      tilecount: 32,
      columns: 8,
      image: '../tilesets/metro-tiles.svg',
      imagewidth: 128,
      imageheight: 64,
    }],
    layers: [
      {
        id: 1,
        name: 'BackgroundFar',
        type: 'imagelayer',
        image: `../backgrounds/${id}-scene-plate.svg`,
        visible: true,
        opacity: 1,
        offsetx: 0,
        offsety: 0,
        properties: [prop('texture', 'string', `${id}-scene-plate`), prop('mode', 'string', 'scenePlate'), prop('depth', 'int', -110)],
      },
      { id: 2, name: 'BackgroundMid', type: 'tilelayer', visible: false, opacity: 1, x: 0, y: 0, width: mapWidth, height: mapHeight, data: tileData(mapWidth, mapHeight, 1), properties: [prop('prototype', 'bool', true), prop('depth', 'int', -90)] },
      { id: 3, name: 'Decor', type: 'tilelayer', visible: false, opacity: 1, x: 0, y: 0, width: mapWidth, height: mapHeight, data: tileData(mapWidth, mapHeight, 2), properties: [prop('prototype', 'bool', true), prop('depth', 'int', -30)] },
      { id: 4, name: 'Ground', type: 'tilelayer', visible: false, opacity: 1, x: 0, y: 0, width: mapWidth, height: mapHeight, data: tileData(mapWidth, mapHeight, 9), properties: [prop('prototype', 'bool', true), prop('depth', 'int', -8)] },
      { id: 5, name: 'Foreground', type: 'tilelayer', visible: false, opacity: 1, x: 0, y: 0, width: mapWidth, height: mapHeight, data: tileData(mapWidth, mapHeight, 21), properties: [prop('prototype', 'bool', true), prop('depth', 'int', 820)] },
      { id: 6, name: 'Collision', type: 'objectgroup', visible: false, objects: [object(1, 'floor', 'collision', 0, 184, [], worldWidth, 56)] },
      { id: 7, name: 'PlayerSpawn', type: 'objectgroup', visible: false, objects: [object(2, 'player', 'player_spawn', 76, 173, [prop('lane', 'float', 0.72)])] },
      {
        id: 8,
        name: 'EnemySpawns',
        type: 'objectgroup',
        visible: false,
        objects: [
          object(3, 'striker', 'enemy_spawn', 330, 168, [prop('role', 'string', 'striker'), prop('lane', 'float', 0.7)]),
          object(4, 'runner', 'enemy_spawn', 470, 182, [prop('role', 'string', 'runner'), prop('lane', 'float', 0.76)]),
          object(5, 'bruiser', 'enemy_spawn', 620, 163, [prop('role', 'string', 'bruiser'), prop('lane', 'float', 0.68)]),
        ],
      },
      { id: 9, name: 'BossSpawn', type: 'objectgroup', visible: false, objects: [object(6, boss, 'boss_spawn', Math.max(900, worldWidth - 280), 173, [prop('boss', 'string', boss), prop('lane', 'float', 0.72)])] },
      {
        id: 10,
        name: 'Triggers',
        type: 'objectgroup',
        visible: false,
        objects: [
          object(7, 'boss-trigger', 'boss_trigger', Math.max(650, worldWidth - 550), 0, [], 20, 240),
          object(8, 'stage-clear', 'stage_clear', worldWidth - 80, 0, [], 40, 240),
        ],
      },
      {
        id: 11,
        name: 'CameraZones',
        type: 'objectgroup',
        visible: false,
        objects: [
          object(9, 'main-camera-bounds', 'camera_bounds', 0, 0, [], worldWidth, 240),
          object(10, 'combat-lanes', 'lane_bounds', 0, 139, [], worldWidth, 72),
          object(11, 'stage-view', 'camera_zone', 0, 0, [], worldWidth, 240),
        ],
      },
      { id: 12, name: 'Props', type: 'objectgroup', visible: false, objects: [] },
      { id: 13, name: 'NPCs', type: 'objectgroup', visible: false, objects: [] },
    ],
  }
}

function reportMarkdown({ id, name, boss, width }) {
  return `# Generated Level: ${name}

- id: \`${id}\`
- boss: \`${boss}\`
- width: ${width}

## Generated Files

- \`public/data/levels/${id}.json\`
- \`public/assets/maps/${id}.json\`
- \`public/assets/backgrounds/${id}-scene-plate.svg\`

## Required Follow-Up

- Replace the placeholder scene plate with production-quality art.
- Add source/license/commercial-use status to \`public/data/assets.json\` and \`docs/asset-ledger.md\`.
- Capture responsive screenshots and compare against the target reference.
- Tune spawns, boss trigger, and stage-clear position after playtesting.
`
}

const id = arg('--id')
if (!id) {
  console.error('Usage: npm run create:level -- --id stage-02-rooftop-run [--name \"Rooftop Run\"] [--boss switchblade-sora] [--width 1408] [--dry-run] [--out .]')
  process.exit(1)
}

const name = arg('--name', titleCase(id.replace(/^stage-\d+-/, '')))
const boss = arg('--boss', 'switchblade-sora')
const width = Number(arg('--width', '1408'))
const dryRun = has('--dry-run')
const outRoot = path.resolve(root, arg('--out', '.'))
const level = buildLevel({ id, name, boss, width })
const map = buildMap({ id, name, boss, width })
const validation = validateMapContract(map)
if (!validation.ok) {
  console.error(`Generated map is invalid:\n${validation.errors.map((error) => `- ${error}`).join('\n')}`)
  process.exit(1)
}

const files = {
  level: path.join(outRoot, 'public/data/levels', `${id}.json`),
  map: path.join(outRoot, 'public/assets/maps', `${id}.json`),
  scenePlate: path.join(outRoot, 'public/assets/backgrounds', `${id}-scene-plate.svg`),
  report: path.join(outRoot, 'docs/generated-levels', `${id}.md`),
}

writeJson(files.level, level, dryRun)
writeJson(files.map, map, dryRun)
writeText(files.scenePlate, placeholderScenePlate(id, name), dryRun)
writeText(files.report, reportMarkdown({ id, name, boss, width }), dryRun)

console.log(JSON.stringify({
  dryRun,
  generated: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, path.relative(outRoot, file)])),
  mapContract: validation.report,
}, null, 2))
