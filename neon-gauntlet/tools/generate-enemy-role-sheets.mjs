import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'public/assets/sprites/enemy-rival-sheet.png')
const outDir = path.join(root, 'public/assets/sprites/enemies')
const dimensions = execFileSync('magick', [source, '-format', '%wx%h', 'info:'], { encoding: 'utf8' }).trim()

const roles = [
  { id: 'striker', file: 'striker-sheet.png', modulate: '104,116,98', color: '#ff5cab', colorize: '5' },
  { id: 'runner', file: 'runner-sheet.png', modulate: '112,126,158', color: '#50e7ff', colorize: '8' },
  { id: 'bruiser', file: 'bruiser-sheet.png', modulate: '92,108,42', color: '#ffd166', colorize: '11' },
  { id: 'thrower', file: 'thrower-sheet.png', modulate: '108,122,285', color: '#a78bfa', colorize: '9' },
]

fs.mkdirSync(outDir, { recursive: true })

for (const role of roles) {
  const output = path.join(outDir, role.file)
  execFileSync('magick', [
    '-size',
    dimensions,
    'xc:none',
    '(',
      source,
      '-alpha',
      'on',
      '-fuzz',
      '7%',
      '-transparent',
      '#00ff00',
      '-modulate',
      role.modulate,
      '-fill',
      role.color,
      '-colorize',
      role.colorize,
      '-unsharp',
      '0x0.75+0.75+0.02',
    ')',
    '-compose',
    'over',
    '-composite',
    '-unsharp',
    '0x0.75+0.75+0.02',
    '-depth',
    '8',
    '-strip',
    `PNG32:${output}`,
  ], { stdio: 'inherit' })
  console.log(`${role.id}: ${path.relative(root, output)}`)
}
