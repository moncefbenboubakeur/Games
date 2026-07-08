import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const animationsPath = path.join(root, 'public/data/animations.json')
const outputDir = path.join(root, 'docs/contact-sheets')

const textureFiles = {
  'player-sheet': '../../public/assets/sprites/player-sheet.png',
  'enemy-sheet': '../../public/assets/sprites/enemy-rival-sheet.png',
}

const svgEscape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
})[char])

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function frameSignature(frame) {
  return `${frame.x},${frame.y},${frame.w},${frame.h},${frame.ax},${frame.ay}`
}

function analyzeFrames(frames) {
  const warnings = []
  const signatures = new Map()
  frames.forEach((frame, index) => {
    const signature = frameSignature(frame)
    if (signatures.has(signature)) warnings.push(`Frame ${index} duplicates frame ${signatures.get(signature)} rectangle/anchor metadata.`)
    signatures.set(signature, index)
  })

  if (frames.length >= 4) {
    const first = frameSignature(frames[0])
    const third = frameSignature(frames[2])
    const second = frameSignature(frames[1])
    const fourth = frameSignature(frames[3])
    if (first === third && second === fourth) warnings.push('Four-frame cycle is two metadata poses repeated as 1/3 and 2/4.')
  }

  return warnings
}

function makeContactSheet({ actor, action, texture, imageHref, frames }) {
  const cellW = 230
  const cellH = 300
  const gap = 22
  const pad = 28
  const headerH = 86
  const width = pad * 2 + frames.length * cellW + Math.max(0, frames.length - 1) * gap
  const height = headerH + cellH + pad
  const warnings = analyzeFrames(frames)

  const frameGroups = frames.map((frame, index) => {
    const cellX = pad + index * (cellW + gap)
    const cellY = headerH
    const scale = Math.min((cellW - 28) / frame.w, (cellH - 82) / frame.h, 1.35)
    const drawW = Math.round(frame.w * scale)
    const drawH = Math.round(frame.h * scale)
    const drawX = cellX + Math.round((cellW - drawW) / 2)
    const drawY = cellY + 32 + Math.round((cellH - 82 - drawH) / 2)
    const clipId = `${actor}-${action}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '-')

    return `
      <g>
        <rect x="${cellX}" y="${cellY}" width="${cellW}" height="${cellH}" rx="10" fill="#171a1f" stroke="#303844" stroke-width="2"/>
        <text x="${cellX + 14}" y="${cellY + 24}" fill="#e8f0ff" font-size="15" font-family="Menlo, Consolas, monospace">${index}: ${svgEscape(frame.name)}</text>
        <g transform="translate(${drawX} ${drawY}) scale(${scale})">
          <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
            <rect x="0" y="0" width="${frame.w}" height="${frame.h}"/>
          </clipPath>
          <image href="${svgEscape(imageHref)}" x="${-frame.x}" y="${-frame.y}" clip-path="url(#${clipId})" style="image-rendering: pixelated"/>
          <rect x="0" y="0" width="${frame.w}" height="${frame.h}" fill="none" stroke="#46d9ff" stroke-width="${1.5 / scale}"/>
          ${frame.hurtbox ? `<rect x="${frame.hurtbox.x}" y="${frame.hurtbox.y}" width="${frame.hurtbox.w}" height="${frame.hurtbox.h}" fill="rgba(255,92,138,0.18)" stroke="#ff5c8a" stroke-width="${1.2 / scale}"/>` : ''}
          <line x1="0" y1="${frame.ay}" x2="${frame.w}" y2="${frame.ay}" stroke="#ffd166" stroke-width="${1 / scale}" stroke-dasharray="${5 / scale} ${4 / scale}"/>
          <circle cx="${frame.ax}" cy="${frame.ay}" r="${4 / scale}" fill="#ff5c8a"/>
        </g>
        <text x="${cellX + 14}" y="${cellY + cellH - 42}" fill="#aab6ca" font-size="13" font-family="Menlo, Consolas, monospace">rect ${frame.x},${frame.y},${frame.w},${frame.h}</text>
        <text x="${cellX + 14}" y="${cellY + cellH - 20}" fill="#aab6ca" font-size="13" font-family="Menlo, Consolas, monospace">anchor ${frame.ax},${frame.ay}</text>
      </g>`
  }).join('\n')

  const warningText = warnings.length ? warnings.join(' ') : 'No repeated metadata rectangles detected. Human visual review is still required.'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#090b10"/>
  <text x="${pad}" y="34" fill="#ffffff" font-size="24" font-family="Menlo, Consolas, monospace">${svgEscape(actor)} / ${svgEscape(action)}</text>
  <text x="${pad}" y="61" fill="#8fa0b8" font-size="15" font-family="Menlo, Consolas, monospace">texture: ${svgEscape(texture)} | frames: ${frames.length} | ${svgEscape(warningText)}</text>
  ${frameGroups}
</svg>
`
}

function makeIndex(entries) {
  const links = entries.map((entry) => `- [${entry.actor} / ${entry.action}](${entry.file}) - ${entry.frames} frame(s)${entry.warnings.length ? ` - WARNING: ${entry.warnings.join(' ')}` : ''}`).join('\n')
  return `# Neon Gauntlet Contact Sheets

Generated from \`public/data/animations.json\`.

These sheets show the exact crop rectangles currently wired into the game. They do not prove the animation is good; they make the visual review concrete.

${links}
`
}

function run() {
  ensureDir(outputDir)
  const animations = loadJson(animationsPath)
  const entries = []

  Object.entries(animations).forEach(([actor, actorData]) => {
    const imageHref = textureFiles[actorData.texture]
    if (!imageHref) throw new Error(`No texture file mapping for ${actorData.texture}`)

    Object.entries(actorData.animations).forEach(([action, frames]) => {
      const file = `${actor}-${action}.svg`
      const svg = makeContactSheet({ actor, action, texture: actorData.texture, imageHref, frames })
      fs.writeFileSync(path.join(outputDir, file), svg)
      entries.push({ actor, action, file, frames: frames.length, warnings: analyzeFrames(frames) })
    })
  })

  fs.writeFileSync(path.join(outputDir, 'README.md'), makeIndex(entries))
  console.log(`Generated ${entries.length} contact sheets in ${path.relative(root, outputDir)}`)
}

run()
