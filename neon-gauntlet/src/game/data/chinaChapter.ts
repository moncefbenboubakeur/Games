export interface ChapterLevelRef {
  id: string
  levelKey: string
  mapKey: string
  tilemapKey: string
  backgroundKey: string
  backgroundFile: string
  levelFile: string
  mapFile: string
}

export const CHINA_CHAPTER_LEVELS: ChapterLevelRef[] = [
  {
    id: 'stage-01-metro-arcade',
    levelKey: 'stage-01',
    mapKey: 'stage-01-map',
    tilemapKey: 'stage-01-tilemap',
    backgroundKey: 'stage-01-metro-arcade-bg',
    backgroundFile: '/assets/backgrounds/china/stage-01-metro-arcade.png',
    levelFile: '/data/levels/stage-01-metro-arcade.json',
    mapFile: '/assets/maps/stage-01-metro-arcade.json',
  },
  {
    id: 'stage-02-china-station',
    levelKey: 'stage-02',
    mapKey: 'stage-02-map',
    tilemapKey: 'stage-02-tilemap',
    backgroundKey: 'stage-02-china-station-bg',
    backgroundFile: '/assets/backgrounds/china/stage-02-china-station.png',
    levelFile: '/data/levels/stage-02-china-station.json',
    mapFile: '/assets/maps/stage-02-china-station.json',
  },
  {
    id: 'stage-03-china-back-alley',
    levelKey: 'stage-03',
    mapKey: 'stage-03-map',
    tilemapKey: 'stage-03-tilemap',
    backgroundKey: 'stage-03-china-back-alley-bg',
    backgroundFile: '/assets/backgrounds/china/stage-03-china-back-alley.png',
    levelFile: '/data/levels/stage-03-china-back-alley.json',
    mapFile: '/assets/maps/stage-03-china-back-alley.json',
  },
  {
    id: 'stage-04-china-night-market',
    levelKey: 'stage-04',
    mapKey: 'stage-04-map',
    tilemapKey: 'stage-04-tilemap',
    backgroundKey: 'stage-04-china-night-market-bg',
    backgroundFile: '/assets/backgrounds/china/stage-04-china-night-market.png',
    levelFile: '/data/levels/stage-04-china-night-market.json',
    mapFile: '/assets/maps/stage-04-china-night-market.json',
  },
]

export function firstChinaLevel() {
  return CHINA_CHAPTER_LEVELS[0]
}

export function chinaLevelById(id: string | undefined) {
  return CHINA_CHAPTER_LEVELS.find((level) => level.id === id) || firstChinaLevel()
}

export function chinaLevelIndex(id: string | undefined) {
  return Math.max(0, CHINA_CHAPTER_LEVELS.findIndex((level) => level.id === id))
}

export function nextChinaLevel(id: string | undefined) {
  const index = chinaLevelIndex(id)
  return CHINA_CHAPTER_LEVELS[index + 1]
}
