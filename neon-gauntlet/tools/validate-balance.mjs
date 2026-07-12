import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const balance = JSON.parse(fs.readFileSync(path.join(root, 'public/data/balance.json'), 'utf8'))
const enemies = JSON.parse(fs.readFileSync(path.join(root, 'public/data/enemies.json'), 'utf8')).roles
const bosses = JSON.parse(fs.readFileSync(path.join(root, 'public/data/bosses.json'), 'utf8')).bosses
const failures = []
const reports = []

const enemyById = new Map(enemies.map((enemy) => [enemy.id, enemy]))
const bossById = new Map(bosses.map((boss) => [boss.id, boss]))
const weights = balance.threatWeights

function fail(message) {
  failures.push(message)
}

function inRange(value, range) {
  return value >= range.min && value <= range.max
}

function levelThreat(level, boss) {
  const uniqueRoles = new Set(level.enemyWaves.map((spawn) => spawn.role))
  const enemyThreat = level.enemyWaves.reduce((sum, spawn) => {
    const enemy = enemyById.get(spawn.role)
    if (!enemy) return sum
    return sum + enemy.hp * weights.enemyHp + enemy.damage * weights.enemyDamage
  }, 0)
  return Math.round(
    enemyThreat +
      boss.hp * weights.bossHp +
      boss.damage * weights.bossDamage +
      boss.speed * weights.bossSpeed +
      (1000 / ((boss.cooldownMinMs + boss.cooldownMaxMs) / 2)) * weights.bossCooldownPressure +
      (boss.phases?.length || 0) * weights.bossPhase +
      uniqueRoles.size * weights.uniqueRole,
  )
}

for (const target of balance.stages) {
  const levelPath = path.join(root, 'public/data/levels', `${target.id}.json`)
  if (!fs.existsSync(levelPath)) {
    fail(`${target.id} level file is missing`)
    continue
  }

  const level = JSON.parse(fs.readFileSync(levelPath, 'utf8'))
  const boss = bossById.get(level.boss.id)
  if (!boss) {
    fail(`${target.id} references unknown boss ${level.boss.id}`)
    continue
  }

  const roles = level.enemyWaves.map((spawn) => spawn.role)
  const uniqueRoles = new Set(roles)
  const threat = levelThreat(level, boss)
  reports.push({ id: target.id, threat, enemyCount: roles.length, uniqueRoles: uniqueRoles.size, boss: boss.id })

  if (level.enemyWaves.length !== target.enemyCount) {
    fail(`${target.id} expected ${target.enemyCount} enemies but has ${level.enemyWaves.length}`)
  }
  if (uniqueRoles.size < target.minUniqueRoles) {
    fail(`${target.id} expected at least ${target.minUniqueRoles} unique enemy roles but has ${uniqueRoles.size}`)
  }
  for (const role of target.requiredRoles) {
    if (!uniqueRoles.has(role)) fail(`${target.id} missing required role ${role}`)
  }
  if (!inRange(boss.hp, target.bossHp)) {
    fail(`${target.id} boss hp ${boss.hp} outside ${target.bossHp.min}-${target.bossHp.max}`)
  }
  if (!inRange(boss.damage, target.bossDamage)) {
    fail(`${target.id} boss damage ${boss.damage} outside ${target.bossDamage.min}-${target.bossDamage.max}`)
  }
  if ((boss.phases?.length || 0) < target.minBossPhases) {
    fail(`${target.id} boss needs at least ${target.minBossPhases} phases but has ${boss.phases?.length || 0}`)
  }
  if (level.worldWidth < target.minWorldWidth) {
    fail(`${target.id} worldWidth ${level.worldWidth} below ${target.minWorldWidth}`)
  }
  if (level.stageClearX > level.worldWidth || level.stageClearX < level.worldWidth - 80) {
    fail(`${target.id} stageClearX ${level.stageClearX} should sit near world end ${level.worldWidth}`)
  }
  for (const spawn of level.enemyWaves) {
    if (!enemyById.has(spawn.role)) fail(`${target.id} has unknown enemy role ${spawn.role}`)
    if (spawn.x < level.playerSpawn.x + 80 || spawn.x > level.stageClearX - 20) {
      fail(`${target.id} ${spawn.role} spawn at x=${spawn.x} is outside the playable pacing band`)
    }
    if (spawn.lane < 0.56 || spawn.lane > 0.84) {
      fail(`${target.id} ${spawn.role} lane ${spawn.lane} is outside readable brawler lanes`)
    }
  }
}

for (let index = 1; index < reports.length; index += 1) {
  const previous = reports[index - 1]
  const current = reports[index]
  if (current.threat < previous.threat - 30) {
    fail(`${current.id} threat ${current.threat} drops too far below ${previous.id} threat ${previous.threat}`)
  }
}

if (failures.length) {
  console.error('Balance validation failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  console.error(JSON.stringify({ reports }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({ stages: reports }, null, 2))
