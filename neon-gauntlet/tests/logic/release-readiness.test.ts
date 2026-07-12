import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

interface ReleaseReport {
  releaseReady: boolean
  blockerCount: number
  blockers: Array<{ kind: string; key: string; reason: string }>
}

describe('release readiness gate', () => {
  it('reports unfinished level production as explicit blockers', () => {
    const output = execFileSync('node', ['tools/check-release-readiness.mjs'], { encoding: 'utf8' })
    const report = JSON.parse(output) as ReleaseReport
    const levelBlockers = report.blockers.filter((blocker) => blocker.kind === 'level-production')

    expect(report.releaseReady).toBe(false)
    expect(levelBlockers).toHaveLength(10)
    expect(levelBlockers.map((blocker) => blocker.key)).toContain('stage-10-neon-core')
    expect(levelBlockers.every((blocker) => blocker.reason.includes('vertical-slice'))).toBe(true)
    expect(report.blockerCount).toBe(report.blockers.length)
  })
})
