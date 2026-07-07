import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const manifestPath = path.join(root, 'public/data/map-art.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const allowedRoles = new Set(['scenePlate', 'parallaxPlate', 'foregroundPlate', 'tileset', 'prefab'])
const allowedStatuses = new Set(['prototype', 'needs-review', 'production-approved'])
const errors = []

function requireValue(condition, message) {
  if (!condition) errors.push(message)
}

function projectPath(file) {
  return path.join(root, file.replace(/^\//, 'public/'))
}

for (const asset of manifest.assets || []) {
  const label = asset.key || '(missing key)'
  requireValue(Boolean(asset.key), 'Asset key is required.')
  requireValue(Boolean(asset.file), `${label} file is required.`)
  requireValue(Boolean(asset.map), `${label} map is required.`)
  requireValue(allowedRoles.has(asset.role), `${label} role is invalid: ${asset.role}`)
  requireValue(allowedStatuses.has(asset.approvalStatus), `${label} approvalStatus is invalid: ${asset.approvalStatus}`)
  requireValue(asset.width > 0 && asset.height > 0, `${label} dimensions must be positive.`)
  requireValue(Boolean(asset.source), `${label} source is required.`)
  requireValue(Boolean(asset.author), `${label} author is required.`)
  requireValue(Boolean(asset.license), `${label} license is required.`)
  requireValue(Boolean(asset.commercialUse), `${label} commercialUse is required.`)
  requireValue(Boolean(asset.reviewNotes), `${label} reviewNotes are required.`)

  if (asset.file) requireValue(fs.existsSync(projectPath(asset.file)), `${label} file does not exist: ${asset.file}`)
  if (asset.role === 'scenePlate') {
    requireValue(asset.width >= 426 && asset.height >= 240, `${label} scenePlate must be at least the game viewport size.`)
  }
  if (asset.approvalStatus === 'production-approved') {
    requireValue(!/unknown|blocked/i.test(`${asset.source} ${asset.author} ${asset.license} ${asset.commercialUse}`), `${label} cannot be production-approved with unknown/blocked metadata.`)
  }
}

console.log(JSON.stringify({
  manifest: 'public/data/map-art.json',
  assets: (manifest.assets || []).map((asset) => ({ key: asset.key, role: asset.role, approvalStatus: asset.approvalStatus, commercialUse: asset.commercialUse })),
  errors,
}, null, 2))

if (errors.length) process.exit(1)
