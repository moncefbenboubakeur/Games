import fs from 'node:fs'

export const requiredLayers = ['BackgroundFar', 'BackgroundMid', 'Decor', 'Ground', 'Foreground', 'Collision', 'PlayerSpawn', 'EnemySpawns', 'BossSpawn', 'Triggers', 'CameraZones', 'Props', 'NPCs']
export const requiredTileLayers = ['BackgroundMid', 'Decor', 'Ground', 'Foreground']
export const allowedImageModes = ['scenePlate', 'parallaxPlate', 'tile']

export function loadMap(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function property(properties, name, fallback = undefined) {
  return properties?.find((item) => item.name === name)?.value ?? fallback
}

export function inspectMap(map) {
  const imageLayers = map.layers.filter((layer) => layer.type === 'imagelayer')
  const tileLayers = map.layers.filter((layer) => layer.type === 'tilelayer')
  const objectLayers = map.layers.filter((layer) => layer.type === 'objectgroup')
  const scenePlates = imageLayers.filter((layer) => layer.visible !== false && property(layer.properties, 'mode') === 'scenePlate')
  const parallaxPlates = imageLayers.filter((layer) => layer.visible !== false && property(layer.properties, 'mode') === 'parallaxPlate')
  const tiledImages = imageLayers.filter((layer) => layer.visible !== false && property(layer.properties, 'mode') === 'tile')
  const prototypeTileLayers = tileLayers.filter((layer) => property(layer.properties, 'prototype') === true)
  const visiblePrototypeTileLayers = prototypeTileLayers.filter((layer) => layer.visible !== false)
  const layerNames = new Set(map.layers.map((layer) => layer.name))
  const missingLayers = requiredLayers.filter((name) => !layerNames.has(name))

  return {
    mapSize: { width: map.width, height: map.height, tilewidth: map.tilewidth, tileheight: map.tileheight },
    tilesets: map.tilesets?.map((tileset) => tileset.name) || [],
    imageLayers: imageLayers.map((layer) => ({ name: layer.name, visible: layer.visible !== false, mode: property(layer.properties, 'mode', null) })),
    tileLayers: tileLayers.map((layer) => ({ name: layer.name, visible: layer.visible !== false, prototype: property(layer.properties, 'prototype') === true })),
    objectLayers: objectLayers.map((layer) => layer.name),
    scenePlates: scenePlates.map((layer) => layer.name),
    parallaxPlates: parallaxPlates.map((layer) => layer.name),
    tiledImages: tiledImages.map((layer) => layer.name),
    prototypeTileLayers: prototypeTileLayers.map((layer) => layer.name),
    visiblePrototypeTileLayers: visiblePrototypeTileLayers.map((layer) => layer.name),
    missingLayers,
  }
}

export function validateMapContract(map) {
  const errors = []
  const report = inspectMap(map)

  if (map.width <= 0 || map.height <= 0) errors.push('Map width/height must be positive.')
  if (map.tilewidth <= 0 || map.tileheight <= 0) errors.push('Map tile dimensions must be positive.')
  if (!Array.isArray(map.tilesets) || map.tilesets.length === 0) errors.push('Map needs at least one tileset, even if helper tiles are hidden.')
  report.missingLayers.forEach((name) => errors.push(`Missing required layer: ${name}`))

  report.imageLayers
    .filter((layer) => layer.visible)
    .forEach((layer) => {
      if (!layer.mode) errors.push(`Visible image layer needs mode property: ${layer.name}`)
      else if (!allowedImageModes.includes(layer.mode)) errors.push(`Invalid image layer mode for ${layer.name}: ${layer.mode}`)
    })

  if (report.scenePlates.length === 0) errors.push('Production map needs at least one visible scenePlate image layer.')

  requiredTileLayers.forEach((name) => {
    const layer = map.layers.find((item) => item.name === name)
    if (layer?.type !== 'tilelayer') errors.push(`Required helper layer must be a tilelayer: ${name}`)
    if (layer?.type === 'tilelayer') {
      if (layer.width !== map.width || layer.height !== map.height) errors.push(`${name} dimensions must match the map.`)
      if (!Array.isArray(layer.data) || layer.data.length !== map.width * map.height) errors.push(`${name} data length must match map dimensions.`)
      if (!layer.data?.some((tile) => tile > 0)) errors.push(`${name} needs at least one visible tile for editor/blockout use.`)
    }
  })

  if (report.visiblePrototypeTileLayers.length) {
    errors.push(`Prototype tile layers are visible: ${report.visiblePrototypeTileLayers.join(', ')}`)
  }

  return { ok: errors.length === 0, errors, report }
}
