import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectMap, loadMap, validateMapContract } from './lib/map-contract.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const check = args.includes('--check')
const mapArg = args.find((arg) => !arg.startsWith('--')) || 'public/assets/maps/stage-01-metro-arcade.json'
const mapFile = path.resolve(root, mapArg)
const map = loadMap(mapFile)
const result = check ? validateMapContract(map) : { ok: true, errors: [], report: inspectMap(map) }

console.log(JSON.stringify({
  map: path.relative(root, mapFile),
  productionSafe: result.ok,
  ...result.report,
  errors: result.errors,
}, null, 2))

if (check && !result.ok) process.exit(1)
