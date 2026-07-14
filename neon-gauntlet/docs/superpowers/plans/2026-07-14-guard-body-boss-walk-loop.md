# Guard Body Blocking And Boss Walk Loop Plan

**Goal:** Fix three player-visible believability/control bugs:

1. Switchblade Sora's walk cycle must look like alternating legs, not a funny repeated gait.
2. Keyboard guard (`L`) must behave like a toggle: press once to guard, press again to lower hands.
3. The hero must not pass straight through living enemies on the same lane; he must route above/below or defeat them.

## Root-Cause Evidence To Collect

- Generate or inspect the exact live boss walk frames, not the full sheet.
- Reproduce guard state using keyboard `L` press/release/press.
- Reproduce player crossing through a living same-lane enemy group.

## Implementation Steps

- [x] Add failing e2e tests for guard toggle and enemy body blocking.
- [x] Add/fix a boss walk-cycle test that catches repeated/funny frame sequencing.
- [x] Implement guard toggle in `InputSystem`/`Player` without breaking touch held guard.
- [x] Add player-vs-living-threat horizontal body blocking after player movement.
- [x] Fix boss walk frame sequencing or metadata based on exact frame evidence.
- [x] Verify focused tests, visual screenshot/contact sheet, build, full desktop e2e.
- [ ] Commit and push scoped files only.
