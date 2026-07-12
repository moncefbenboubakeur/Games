import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const reviewsRoot = path.join(root, 'docs/reviews/map-previews')
const levelProductionPlan = JSON.parse(fs.readFileSync(path.join(root, 'public/data/level-production-plan.json'), 'utf8'))
const requiredFiles = ['README.md', 'desktop.png', 'phone.png', 'tv.png']
const failures = []

for (const level of levelProductionPlan.levels || []) {
  const packetDir = path.join(reviewsRoot, level.id)
  for (const file of requiredFiles) {
    const target = path.join(packetDir, file)
    if (!fs.existsSync(target)) {
      failures.push(`${level.id} missing ${file}`)
      continue
    }
    if (fs.statSync(target).size <= 0) {
      failures.push(`${level.id} has empty ${file}`)
    }
  }

  const readme = path.join(packetDir, 'README.md')
  if (fs.existsSync(readme)) {
    const body = fs.readFileSync(readme, 'utf8')
    if (!body.includes(`Runtime level verified during capture: \`${level.id}\`.`)) {
      failures.push(`${level.id} README does not confirm runtime level capture`)
    }
    if (!body.includes(`production status: ${level.productionStatus}`)) {
      failures.push(`${level.id} README does not include production status`)
    }
    if (!body.includes(`boss: ${level.boss?.id || 'unknown'}`)) {
      failures.push(`${level.id} README does not include boss id`)
    }
  }
}

const index = path.join(reviewsRoot, 'README.md')
if (!fs.existsSync(index)) {
  failures.push('map preview index README.md is missing')
} else {
  const body = fs.readFileSync(index, 'utf8')
  for (const level of levelProductionPlan.levels || []) {
    if (!body.includes(`| ${level.order} | ${level.id} |`)) {
      failures.push(`map preview index missing ${level.id}`)
    }
  }
}

if (failures.length) {
  console.error('Review packet validation failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(JSON.stringify({ packets: levelProductionPlan.levels.length, requiredFiles }, null, 2))
