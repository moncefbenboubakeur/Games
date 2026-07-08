import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const animationsPath = path.join(root, 'public/data/animations.json')
const contactSheetDir = path.join(root, 'docs/contact-sheets')

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function frameSignature(frame) {
  return `${frame.x},${frame.y},${frame.w},${frame.h},${frame.ax},${frame.ay}`
}

function findRepeatedFrames(actor, action, frames) {
  const failures = []
  const signatures = new Map()
  frames.forEach((frame, index) => {
    if (!frame.hurtbox) failures.push(`${actor}.${action}[${index}] is missing hurtbox metadata`)
    const signature = frameSignature(frame)
    if (signatures.has(signature)) failures.push(`${actor}.${action}[${index}] duplicates frame ${signatures.get(signature)}`)
    signatures.set(signature, index)
  })

  if (frames.length >= 4) {
    const one = frameSignature(frames[0])
    const two = frameSignature(frames[1])
    const three = frameSignature(frames[2])
    const four = frameSignature(frames[3])
    if (one === three && two === four) failures.push(`${actor}.${action} repeats two poses as frames 1/3 and 2/4`)
  }

  return failures
}

function run() {
  const animations = loadJson(animationsPath)
  const failures = []

  Object.entries(animations).forEach(([actor, actorData]) => {
    Object.entries(actorData.animations).forEach(([action, frames]) => {
      const contactSheet = path.join(contactSheetDir, `${actor}-${action}.svg`)
      if (!fs.existsSync(contactSheet)) failures.push(`Missing contact sheet: docs/contact-sheets/${actor}-${action}.svg`)
      failures.push(...findRepeatedFrames(actor, action, frames))
    })
  })

  if (failures.length) {
    console.error('Contact-sheet validation failed:')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }

  console.log('Contact-sheet validation passed.')
}

run()
