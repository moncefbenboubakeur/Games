import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const audio = JSON.parse(fs.readFileSync(path.join(root, 'public/data/audio.json'), 'utf8'))
const sources = JSON.parse(fs.readFileSync(path.join(root, 'public/data/audio-sources.json'), 'utf8'))
const allowedStatuses = new Set(['placeholder', 'needs-review', 'production-approved'])
const failures = []

function requireValue(condition, message) {
  if (!condition) failures.push(message)
}

const expected = [
  ...Object.entries(audio.music).map(([key, cue]) => [`music:${key}`, cue.file]),
  ...Object.entries(audio.sfx).map(([key, cue]) => [`sfx:${key}`, cue.file]),
]

for (const [key, file] of expected) {
  const source = sources.cues?.[key]
  requireValue(Boolean(source), `${key} is missing from audio-sources manifest.`)
  if (!source) continue
  requireValue(source.file === file, `${key} source file does not match audio.json.`)
  ;['source', 'author', 'license', 'commercialUse', 'approvalStatus', 'replacementPlan'].forEach((field) => {
    requireValue(Boolean(source[field]), `${key} missing ${field}.`)
  })
  requireValue(allowedStatuses.has(source.approvalStatus), `${key} invalid approvalStatus: ${source.approvalStatus}`)
  if (source.approvalStatus === 'production-approved') {
    requireValue(!/unknown|blocked|placeholder/i.test(`${source.source} ${source.author} ${source.license} ${source.commercialUse}`), `${key} cannot be production-approved with blocked/unknown/placeholder metadata.`)
  }
}

if (failures.length) {
  console.error('Audio source validation failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(JSON.stringify({ manifest: 'public/data/audio-sources.json', cues: expected.map(([key]) => ({ key, status: sources.cues[key].approvalStatus, commercialUse: sources.cues[key].commercialUse })) }, null, 2))
