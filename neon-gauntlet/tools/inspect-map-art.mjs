import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectMap, loadMap, validateMapContract } from './lib/map-contract.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const check = args.includes('--check')
const all = args.includes('--all')
const mapArg = args.find((arg) => !arg.startsWith('--')) || 'public/assets/maps/stage-01-metro-arcade.json'

function inspectFile(file) {
  const map = loadMap(file)
  const result = check ? validateMapContract(map) : { ok: true, errors: [], report: inspectMap(map) }
  return {
    map: path.relative(root, file),
    productionSafe: result.ok,
    ...result.report,
    errors: result.errors,
  }
}

const mapFiles = all
  ? fs.readdirSync(path.join(root, 'public/assets/maps'))
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => path.join(root, 'public/assets/maps', file))
  : [path.resolve(root, mapArg)]

const reports = mapFiles.map(inspectFile)

console.log(JSON.stringify(all ? { maps: reports } : reports[0], null, 2))

if (check && reports.some((report) => !report.productionSafe)) process.exit(1)
