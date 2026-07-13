# Neon Gauntlet Audit Fix Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fix the concrete issues found by the July 13 self-play audit, then rerun the same mechanical and visual tests until the build is internally consistent.

**Architecture:** Keep the game in the existing Phaser + TypeScript + Vite harness. Make low-risk improvements to input normalization, HUD/touch-control presentation, and screenshot baselines without changing level data or unrelated assets. Treat missing final production art/licensing as explicit remaining blockers, not as silently fixed work.

**Tech Stack:** Phaser, TypeScript, Vite, Playwright, Vitest, ImageMagick tooling already present in the repo.

## Global Constraints

- Work only in `/Volumes/My Book Duo-1/Dev/Games/neon-gauntlet`.
- Do not touch `Youtube++`.
- Do not close or restart user browser windows.
- Do not claim visual quality is fixed until screenshots and tests are inspected.
- Keep unrelated untracked files out of commits.
- Final production release remains blocked until approved art/licensing replaces prototype-derived assets.

---

## File Structure

- `src/game/systems/InputSystem.ts`: add `P` as an accepted keyboard punch alias so PC controls match the visible `P` label.
- `src/game/scenes/MenuScene.ts`: update keyboard help text to mention both `J/P` for punch and keep jump as `Space`.
- `src/game/scenes/UIScene.ts`: reduce HUD noise, make touch controls less intrusive, and make labels accurately describe action and keyboard aliases.
- `tests/e2e/input.spec.ts`: add coverage proving both `J` and `P` trigger punch and touch controls remain accurate.
- `tests/e2e/visual.spec.ts-snapshots/*.png`: refresh only after the actual current visuals are intentional.
- `docs/superpowers/plans/2026-07-13-audit-fix-loop.md`: track this plan.

## Task 1: Fix PC Action Key Mismatch

**Files:**
- Modify: `src/game/systems/InputSystem.ts`
- Modify: `src/game/scenes/MenuScene.ts`
- Modify: `tests/e2e/input.spec.ts`

**Interfaces:**
- Consumes: existing `InputSystem.actionForKey(key: string)` and `InputSystem.update()`.
- Produces: `P`, `p`, `J`, `j`, and `Enter` all trigger `NormalizedInput.punch`.

- [x] **Step 1: Add a failing input test**

Add this test to `tests/e2e/input.spec.ts`:

```ts
test('keyboard J P and Enter all trigger punch', async ({ page }) => {
  await startGame(page)
  await page.evaluate(() => window.focus())

  for (const key of ['KeyJ', 'KeyP', 'Enter']) {
    const before = await page.evaluate(() => window.__NEON_DEBUG__?.player.combo || 0)
    await page.keyboard.press(key)
    await expect
      .poll(() => page.evaluate(() => window.__NEON_DEBUG__?.combat?.playerAttack?.kind || null))
      .toBe('punch')
    const after = await page.evaluate(() => window.__NEON_DEBUG__?.player.combo || 0)
    expect(after, `${key} should increment combo through punch`).toBeGreaterThan(before)
    await page.waitForTimeout(360)
  }
})
```

- [x] **Step 2: Run the focused test and confirm current `KeyP` fails**

Run:

```bash
npm run test:e2e -- tests/e2e/input.spec.ts --project=desktop --workers=1
```

Expected before implementation: the new `KeyP` assertion fails.

- [x] **Step 3: Implement `P` as punch**

In `src/game/systems/InputSystem.ts`, add Phaser key registration:

```ts
punchP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
```

Update `next.punch` to include:

```ts
Phaser.Input.Keyboard.JustDown(this.keys.punchP)
```

Update `actionForKey()` to map:

```ts
case 'p':
case 'P':
  return 'punch'
```

- [x] **Step 4: Update menu help**

In `src/game/scenes/MenuScene.ts`, change the help line to:

```ts
'MOVE WASD/ARROWS  PUNCH J/P/ENTER  KICK K  JUMP SPACE  GUARD L'
```

- [x] **Step 5: Verify input**

Run:

```bash
npm run test:e2e -- tests/e2e/input.spec.ts --project=desktop --workers=1
```

Expected: all input tests pass.

## Task 2: Reduce HUD And Touch-Control Visual Noise

**Files:**
- Modify: `src/game/scenes/UIScene.ts`
- Modify: `tests/e2e/input.spec.ts`

**Interfaces:**
- Consumes: existing `UIScene.createTouchControls()` and `createTouchButton()`.
- Produces: same touch-control hit targets and actions, with less opaque panels, clearer captions, and less noisy HUD text.

- [x] **Step 1: Keep touch hit targets tested**

Update touch-coordinate test data in `tests/e2e/input.spec.ts` only if button centers move. Expected active action arrays must stay exactly one action at a time.

- [x] **Step 2: Make HUD text cleaner**

In `src/game/scenes/UIScene.ts`:

```ts
this.scoreText = this.add.text(18, 34, 'SCORE 000000', { fontFamily: 'monospace', fontSize: '10px', color: '#61ff6a', stroke: '#081020', strokeThickness: 2 })
this.levelText = this.add.text(18, 49, '', { fontFamily: 'monospace', fontSize: '7px', color: '#ffd166', stroke: '#081020', strokeThickness: 2 })
this.bossText = this.add.text(GAME_WIDTH - 16, 14, '', { fontFamily: 'monospace', fontSize: '8px', color: '#fff', stroke: '#081020', strokeThickness: 2 }).setOrigin(1, 0)
```

- [x] **Step 3: Make touch overlay less intrusive**

In `src/game/scenes/UIScene.ts`, reduce panel alpha and button glow alpha, and use captions that match keyboard aliases:

```ts
leftPanel.fillStyle(0x050711, 0.24)
rightPanel.fillStyle(0x050711, 0.24)
this.createTouchButton(input, GAME_WIDTH - 112, GAME_HEIGHT - 45, 'P', 'punch', 0xff5c8a, 14, 'J/P')
```

- [x] **Step 4: Verify touch controls**

Run:

```bash
npm run test:e2e -- tests/e2e/input.spec.ts --project=desktop --workers=1
```

Expected: touch and keyboard input tests pass.

## Task 3: Refresh Visual Baselines After Intentional Visual State

**Files:**
- Modify: `tests/e2e/visual.spec.ts-snapshots/*.png`

**Interfaces:**
- Consumes: stable current gameplay state after Tasks 1-2.
- Produces: screenshot baselines that match the current intended UI/art.

- [x] **Step 1: Update screenshots**

Run:

```bash
npm run update:screenshots -- --project=desktop --workers=1
```

Expected: Playwright writes updated desktop snapshots for idle, player actions, enemy states, and boss state.

- [x] **Step 2: Verify screenshots**

Run:

```bash
npm run test:screenshots -- --project=desktop --workers=1
```

Expected: all visual screenshot tests pass.

- [x] **Step 3: Inspect updated screenshots**

Open or render:

```bash
find tests/e2e/visual.spec.ts-snapshots -name '*desktop-darwin.png' | sort
```

Expected: no colored-box placeholders, no action facing mismatch, no obviously broken character frame.

## Task 4: Full Audit Loop

**Files:**
- No production file changes unless a failing check points to a real bug.

**Interfaces:**
- Consumes: all changes from Tasks 1-3.
- Produces: final evidence for whether the current harness is internally consistent.

- [x] **Step 1: Run full browser suite**

Run:

```bash
npm run test:e2e -- tests/e2e/input.spec.ts tests/e2e/enemy-ai.spec.ts tests/e2e/enemy-facing.spec.ts tests/e2e/corpse.spec.ts tests/e2e/world-systems.spec.ts tests/e2e/visual.spec.ts tests/e2e/all-stages.spec.ts --project=desktop --workers=1
```

Expected: all tests pass.

- [x] **Step 2: Run non-browser gates**

Run:

```bash
npm run test:assets
npm test
npm run build
npm run test:release
```

Expected: all commands exit successfully. `test:release` may still report `releaseReady: false`; that is acceptable only if blockers are final asset/licensing/production approval blockers.

- [x] **Step 3: Repeat if failures remain**

For each failure:

1. Identify whether it is mechanical, visual-baseline drift, or missing production asset.
2. Fix mechanical bugs in code/tests.
3. Refresh visual baselines only after screenshot inspection.
4. Rerun the failed command.

## Self-Review

- Spec coverage: plan covers controls, HUD/touch polish, visual baselines, mechanical audit rerun, and release blocker honesty.
- Placeholder scan: no task uses TBD/TODO; all commands and files are explicit.
- Type consistency: `NormalizedInput.punch`, `InputSystem.actionForKey`, and test access through `window.__NEON_DEBUG__` match existing code.
