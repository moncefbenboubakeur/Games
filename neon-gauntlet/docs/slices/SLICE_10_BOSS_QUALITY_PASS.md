# Slice 10: Boss Quality Pass

## Goal

Make China bosses feel distinct without breaking the visual rules: no attacking empty air, no wrong-facing attacks, no random guarding far from the player, and no behavior that contradicts the sprite state.

## Scope

- Extend boss data with behavior tuning fields.
- Let bosses choose movement style, preferred attack, range, lane speed, telegraph timing, and scale from data.
- Keep all bosses inside the existing `Boss`/`Enemy` modular flow.
- Add tests proving boss definitions are unique and wired to China levels.
- Add e2e checks that a later-stage boss spawns with the expected identity.

## Non-Goals

- Do not generate new boss sprite sheets in this slice.
- Do not add projectiles or multi-phase bosses yet.
- Do not mark art or bosses production-approved.

## Verification

- `npm run test:levels`
- `npm run test:maps`
- `npm test`
- focused e2e boss/progression checks
- `npm run build`

## Boss Intent

- `switchblade-sora`: balanced intro pressure.
- `turnstile-ren`: quick station boss with punch pressure and fast lane tracking.
- `iron-wei`: slower alley boss with heavy kick pressure.
- `lantern-mai`: final China chapter boss with fast movement, higher HP, and tighter cooldown windows.
