import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const sampleRate = 22050
const twoPi = Math.PI * 2

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
}

function clamp(value, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function note(name) {
  const match = /^([A-G]#?)(-?\d)$/.exec(name)
  if (!match) throw new Error(`Invalid note: ${name}`)
  const [, pitch, octaveText] = match
  const octave = Number(octaveText)
  const semitones = {
    C: -9,
    'C#': -8,
    D: -7,
    'D#': -6,
    E: -5,
    F: -4,
    'F#': -3,
    G: -2,
    'G#': -1,
    A: 0,
    'A#': 1,
    B: 2,
  }
  return 440 * 2 ** ((semitones[pitch] + (octave - 4) * 12) / 12)
}

function envelope(t, duration, attack = 0.01, release = 0.08) {
  const attackGain = attack <= 0 ? 1 : Math.min(1, t / attack)
  const releaseGain = release <= 0 ? 1 : Math.min(1, (duration - t) / release)
  return clamp(Math.min(attackGain, releaseGain), 0, 1)
}

function square(freq, t, duty = 0.5) {
  return (t * freq) % 1 < duty ? 1 : -1
}

function triangle(freq, t) {
  return 2 * Math.abs(2 * ((t * freq) % 1) - 1) - 1
}

function sine(freq, t) {
  return Math.sin(twoPi * freq * t)
}

function seededNoise(seed) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0xffffffff * 2 - 1
  }
}

function createBuffer(duration) {
  return new Float32Array(Math.ceil(duration * sampleRate))
}

function addTone(buffer, start, duration, freq, options = {}) {
  const startIndex = Math.floor(start * sampleRate)
  const endIndex = Math.min(buffer.length, Math.floor((start + duration) * sampleRate))
  const wave = options.wave || 'square'
  const gain = options.gain ?? 0.35
  const attack = options.attack ?? 0.01
  const release = options.release ?? 0.08
  const slideTo = options.slideTo || freq
  const duty = options.duty ?? 0.5
  for (let i = startIndex; i < endIndex; i += 1) {
    const localT = (i - startIndex) / sampleRate
    const progress = localT / duration
    const hz = freq + (slideTo - freq) * progress
    let sample = 0
    if (wave === 'triangle') sample = triangle(hz, localT)
    else if (wave === 'sine') sample = sine(hz, localT)
    else sample = square(hz, localT, duty)
    buffer[i] = clamp(buffer[i] + sample * envelope(localT, duration, attack, release) * gain)
  }
}

function addNoise(buffer, start, duration, options = {}) {
  const startIndex = Math.floor(start * sampleRate)
  const endIndex = Math.min(buffer.length, Math.floor((start + duration) * sampleRate))
  const noise = seededNoise(options.seed ?? 7)
  const gain = options.gain ?? 0.3
  const attack = options.attack ?? 0.002
  const release = options.release ?? 0.06
  let previous = 0
  for (let i = startIndex; i < endIndex; i += 1) {
    const localT = (i - startIndex) / sampleRate
    const raw = noise()
    const filtered = previous * (options.lowPass ?? 0.55) + raw * (1 - (options.lowPass ?? 0.55))
    previous = filtered
    buffer[i] = clamp(buffer[i] + filtered * envelope(localT, duration, attack, release) * gain)
  }
}

function addKickDrum(buffer, start) {
  addTone(buffer, start, 0.18, 96, { slideTo: 44, wave: 'sine', gain: 0.56, attack: 0.001, release: 0.16 })
  addNoise(buffer, start, 0.035, { seed: 19, gain: 0.2, release: 0.025, lowPass: 0.2 })
}

function addSnare(buffer, start) {
  addNoise(buffer, start, 0.11, { seed: 41, gain: 0.28, release: 0.08, lowPass: 0.35 })
  addTone(buffer, start, 0.08, 185, { wave: 'triangle', gain: 0.12, attack: 0.002, release: 0.06 })
}

function addHat(buffer, start) {
  addNoise(buffer, start, 0.045, { seed: 89 + Math.floor(start * 100), gain: 0.1, release: 0.035, lowPass: 0.08 })
}

function renderStageLoop() {
  const bpm = 124
  const beat = 60 / bpm
  const bars = 8
  const duration = beat * 4 * bars
  const buffer = createBuffer(duration)
  const bass = ['F#2', 'F#2', 'A2', 'C#3', 'E2', 'E2', 'A2', 'B2']
  const lead = ['F#4', 'A4', 'C#5', 'E5', 'C#5', 'B4', 'A4', 'E4', 'F#4', 'A4', 'B4', 'C#5', 'E5', 'C#5', 'B4', 'A4']

  for (let bar = 0; bar < bars; bar += 1) {
    const barStart = bar * beat * 4
    for (let step = 0; step < 8; step += 1) {
      const t = barStart + step * beat * 0.5
      addTone(buffer, t, beat * 0.42, note(bass[(bar + step) % bass.length]), {
        wave: 'square',
        duty: 0.34,
        gain: 0.16,
        attack: 0.004,
        release: 0.055,
      })
      addHat(buffer, t)
    }

    addKickDrum(buffer, barStart)
    addKickDrum(buffer, barStart + beat * 2)
    addSnare(buffer, barStart + beat)
    addSnare(buffer, barStart + beat * 3)

    for (let step = 0; step < 8; step += 1) {
      if ((bar + step) % 3 === 0) continue
      addTone(buffer, barStart + step * beat * 0.5, beat * 0.38, note(lead[(bar * 2 + step) % lead.length]), {
        wave: 'triangle',
        gain: 0.1,
        attack: 0.006,
        release: 0.075,
      })
    }
  }

  addTone(buffer, 0, duration, note('F#3'), { wave: 'sine', gain: 0.035, attack: 0.1, release: 0.1 })
  return buffer
}

function renderPunch() {
  const buffer = createBuffer(0.2)
  addNoise(buffer, 0, 0.075, { seed: 101, gain: 0.42, release: 0.055, lowPass: 0.22 })
  addTone(buffer, 0.012, 0.11, 170, { slideTo: 96, wave: 'triangle', gain: 0.24, attack: 0.001, release: 0.075 })
  return buffer
}

function renderKick() {
  const buffer = createBuffer(0.26)
  addNoise(buffer, 0.01, 0.09, { seed: 203, gain: 0.34, release: 0.07, lowPass: 0.18 })
  addTone(buffer, 0, 0.18, 240, { slideTo: 72, wave: 'sine', gain: 0.34, attack: 0.001, release: 0.13 })
  return buffer
}

function renderHit() {
  const buffer = createBuffer(0.23)
  addNoise(buffer, 0, 0.11, { seed: 307, gain: 0.5, release: 0.08, lowPass: 0.32 })
  addTone(buffer, 0, 0.12, 90, { slideTo: 48, wave: 'triangle', gain: 0.28, attack: 0.001, release: 0.1 })
  return buffer
}

function renderJump() {
  const buffer = createBuffer(0.28)
  addTone(buffer, 0, 0.22, 230, { slideTo: 620, wave: 'triangle', gain: 0.26, attack: 0.002, release: 0.12 })
  addNoise(buffer, 0, 0.05, { seed: 409, gain: 0.08, release: 0.035, lowPass: 0.3 })
  return buffer
}

function renderHurt() {
  const buffer = createBuffer(0.34)
  addTone(buffer, 0, 0.12, 430, { slideTo: 250, wave: 'square', duty: 0.42, gain: 0.18, attack: 0.002, release: 0.09 })
  addTone(buffer, 0.09, 0.18, 220, { slideTo: 130, wave: 'triangle', gain: 0.23, attack: 0.002, release: 0.14 })
  addNoise(buffer, 0.03, 0.12, { seed: 503, gain: 0.18, release: 0.08, lowPass: 0.45 })
  return buffer
}

function renderGuard() {
  const buffer = createBuffer(0.16)
  addTone(buffer, 0, 0.12, 760, { slideTo: 540, wave: 'square', duty: 0.18, gain: 0.2, attack: 0.001, release: 0.08 })
  addNoise(buffer, 0, 0.06, { seed: 607, gain: 0.16, release: 0.04, lowPass: 0.12 })
  return buffer
}

function renderStageClear() {
  const buffer = createBuffer(1.18)
  const notes = ['F#4', 'A4', 'C#5', 'F#5', 'E5', 'C#5', 'F#5']
  notes.forEach((pitch, index) => {
    addTone(buffer, index * 0.12, 0.18, note(pitch), { wave: index % 2 ? 'triangle' : 'square', duty: 0.42, gain: 0.2, attack: 0.005, release: 0.08 })
  })
  addTone(buffer, 0.72, 0.42, note('F#3'), { wave: 'sine', gain: 0.14, attack: 0.02, release: 0.18 })
  return buffer
}

function writeWav(file, samples) {
  ensureDir(file)
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.round(clamp(samples[i] * 0.88) * 32767)
    buffer.writeInt16LE(sample, 44 + i * 2)
  }
  fs.writeFileSync(file, buffer)
}

const cues = [
  ['public/assets/audio/music/stage-01-loop.wav', renderStageLoop],
  ['public/assets/audio/sfx/punch.wav', renderPunch],
  ['public/assets/audio/sfx/kick.wav', renderKick],
  ['public/assets/audio/sfx/hit.wav', renderHit],
  ['public/assets/audio/sfx/jump.wav', renderJump],
  ['public/assets/audio/sfx/hurt.wav', renderHurt],
  ['public/assets/audio/sfx/guard.wav', renderGuard],
  ['public/assets/audio/sfx/stage-clear.wav', renderStageClear],
]

for (const [relativeFile, render] of cues) {
  const file = path.join(root, relativeFile)
  writeWav(file, render())
  console.log(`generated ${relativeFile}`)
}
