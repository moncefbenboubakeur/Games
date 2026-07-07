import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const plan = JSON.parse(fs.readFileSync(path.join(root, 'public/data/level-production-plan.json'), 'utf8'))
const allowedStatuses = new Set(['concept', 'needs-scene-plate', 'needs-map', 'needs-boss', 'vertical-slice', 'production-approved'])
const errors = []

function fail(message) {
  errors.push(message)
}

function requireText(level, field) {
  if (!level[field] || typeof level[field] !== 'string' || !level[field].trim()) fail(`${level.id || '(missing id)'} missing ${field}`)
}

const levels = plan.levels || []
if (plan.targetLevelCount !== 10) fail('targetLevelCount must be 10.')
if (levels.length !== 10) fail(`Expected exactly 10 levels, found ${levels.length}.`)

const ids = new Set()
const orders = new Set()
const bossIds = new Set()
const placeholderBossStatuses = new Set(['concept', 'needs-boss'])

for (const level of levels) {
  if (ids.has(level.id)) fail(`Duplicate level id: ${level.id}`)
  ids.add(level.id)
  if (orders.has(level.order)) fail(`Duplicate order: ${level.order}`)
  orders.add(level.order)

  requireText(level, 'id')
  requireText(level, 'name')
  requireText(level, 'scenario')
  requireText(level, 'artTarget')
  requireText(level, 'scenePlatePrompt')
  requireText(level, 'gameplayHook')
  requireText(level, 'bossMechanic')
  requireText(level, 'productionStatus')
  requireText(level, 'nextHarnessStep')

  if (!allowedStatuses.has(level.productionStatus)) fail(`${level.id} invalid productionStatus: ${level.productionStatus}`)
  if (!level.boss?.id || !level.boss?.name) fail(`${level.id} boss id/name are required.`)
  if (level.boss?.id && !placeholderBossStatuses.has(level.productionStatus)) {
    if (bossIds.has(level.boss.id)) fail(`Duplicate boss id: ${level.boss.id}`)
    bossIds.add(level.boss.id)
  }
  if (level.productionStatus === 'production-approved') {
    fail(`${level.id} cannot be production-approved until art, licensing, map review, and boss implementation gates are automated.`)
  }
}

for (let order = 1; order <= 10; order += 1) {
  if (!orders.has(order)) fail(`Missing level order ${order}.`)
}

if (!ids.has('stage-01-metro-arcade')) fail('Stage 1 must remain in the production plan.')
const stage1 = levels.find((level) => level.id === 'stage-01-metro-arcade')
if (stage1 && stage1.productionStatus !== 'vertical-slice') fail('Stage 1 should be marked vertical-slice until production approval gates pass.')
if (!fs.existsSync(path.join(root, 'docs/reviews/map-previews/stage-01-metro-arcade/README.md'))) fail('Stage 1 review packet is required.')
if (!fs.existsSync(path.join(root, 'public/assets/maps/stage-01-metro-arcade.json'))) fail('Stage 1 map is required.')

console.log(JSON.stringify({
  manifest: 'public/data/level-production-plan.json',
  targetLevelCount: plan.targetLevelCount,
  levels: levels.map((level) => ({ order: level.order, id: level.id, status: level.productionStatus, boss: level.boss?.id })),
  errors,
}, null, 2))

if (errors.length) process.exit(1)
