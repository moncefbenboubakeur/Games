import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const strict = process.argv.includes('--strict')

const assets = JSON.parse(fs.readFileSync(path.join(root, 'public/data/assets.json'), 'utf8'))
const mapArt = JSON.parse(fs.readFileSync(path.join(root, 'public/data/map-art.json'), 'utf8'))
const audioSources = JSON.parse(fs.readFileSync(path.join(root, 'public/data/audio-sources.json'), 'utf8'))
const levelProductionPlan = JSON.parse(fs.readFileSync(path.join(root, 'public/data/level-production-plan.json'), 'utf8'))

const blockers = []

function blocked(value) {
  return /unknown|blocked|placeholder|pending|needs-review|prototype/i.test(String(value))
}

Object.entries(assets.textures || {}).forEach(([key, asset]) => {
  if (blocked(`${asset.status} ${asset.source} ${asset.author} ${asset.license} ${asset.commercialUse}`)) {
    blockers.push({ kind: 'texture', key, reason: `${asset.status}; ${asset.commercialUse}` })
  }
})

Object.entries(assets.audio || {}).forEach(([key, asset]) => {
  if (blocked(`${asset.status} ${asset.source} ${asset.author} ${asset.license} ${asset.commercialUse}`)) {
    blockers.push({ kind: 'audio-ledger', key, reason: `${asset.status}; ${asset.commercialUse}` })
  }
})

for (const asset of mapArt.assets || []) {
  if (asset.approvalStatus !== 'production-approved' || blocked(`${asset.source} ${asset.author} ${asset.license} ${asset.commercialUse}`)) {
    blockers.push({ kind: 'map-art', key: asset.key, reason: `${asset.approvalStatus}; ${asset.commercialUse}` })
  }
}

Object.entries(audioSources.cues || {}).forEach(([key, cue]) => {
  if (cue.approvalStatus !== 'production-approved' || blocked(`${cue.source} ${cue.author} ${cue.license} ${cue.commercialUse}`)) {
    blockers.push({ kind: 'audio-source', key, reason: `${cue.approvalStatus}; ${cue.commercialUse}` })
  }
})

for (const level of levelProductionPlan.levels || []) {
  if (level.productionStatus !== 'production-approved') {
    blockers.push({
      kind: 'level-production',
      key: level.id,
      reason: `${level.productionStatus}; boss=${level.boss?.id || 'missing'}; next=${level.nextHarnessStep || 'missing next step'}`,
    })
  }
}

const report = {
  releaseReady: blockers.length === 0,
  blockerCount: blockers.length,
  blockers,
}

console.log(JSON.stringify(report, null, 2))

if (strict && blockers.length) process.exit(1)
