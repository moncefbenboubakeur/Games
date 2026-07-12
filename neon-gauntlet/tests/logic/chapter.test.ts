import { describe, expect, it } from 'vitest'
import { CHINA_CHAPTER_LEVELS, nextChinaLevel } from '../../src/game/data/chinaChapter'

describe('chapter backbone', () => {
  it('wires the full ten-stage chapter in order', () => {
    expect(CHINA_CHAPTER_LEVELS.map((level) => level.id)).toEqual([
      'stage-01-metro-arcade',
      'stage-02-china-station',
      'stage-03-china-back-alley',
      'stage-04-china-night-market',
      'stage-05-solar-foundry',
      'stage-06-skybridge-district',
      'stage-07-data-garden',
      'stage-08-harbor-storm',
      'stage-09-broadcast-tower',
      'stage-10-neon-core',
    ])
  })

  it('continues after stage four and ends after stage ten', () => {
    expect(nextChinaLevel('stage-04-china-night-market')?.id).toBe('stage-05-solar-foundry')
    expect(nextChinaLevel('stage-09-broadcast-tower')?.id).toBe('stage-10-neon-core')
    expect(nextChinaLevel('stage-10-neon-core')).toBeUndefined()
  })
})
