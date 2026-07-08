import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'public/assets/sprites/enemy-rival-sheet.png')
const outDir = path.join(root, 'public/assets/sprites/bosses')
const dimensions = execFileSync('magick', [source, '-format', '%wx%h', 'info:'], { encoding: 'utf8' }).trim()

const bosses = [
  {
    id: 'switchblade-sora',
    file: 'switchblade-sora-sheet.png',
    modulate: '104,118,96',
    color: '#ffd166',
    colorize: '9',
  },
  {
    id: 'turnstile-ren',
    file: 'turnstile-ren-sheet.png',
    modulate: '108,126,155',
    color: '#6ee7ff',
    colorize: '11',
  },
  {
    id: 'iron-wei',
    file: 'iron-wei-sheet.png',
    modulate: '92,112,34',
    color: '#ff9f43',
    colorize: '13',
  },
  {
    id: 'lantern-mai',
    file: 'lantern-mai-sheet.png',
    modulate: '110,132,310',
    color: '#ff5cab',
    colorize: '12',
  },
]

fs.mkdirSync(outDir, { recursive: true })

for (const boss of bosses) {
  const output = path.join(outDir, boss.file)
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
      boss.modulate,
      '-fill',
      boss.color,
      '-colorize',
      boss.colorize,
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
  console.log(`${boss.id}: ${path.relative(root, output)}`)
}
