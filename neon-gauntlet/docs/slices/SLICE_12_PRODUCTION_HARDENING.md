# Slice 12: Production Hardening Pass

## Goal

Address the next six production gaps in one coordinated pass:

1. Improve boss sprite quality with separate boss sprite sheets, not runtime-tinted regular enemies.
2. Add visual baselines for punch, kick, jump, enemy actions, and boss states.
3. Add explicit per-frame hitbox/hurtbox metadata.
4. Build stronger AI/NPC/world behavior rules.
5. Add real audio/music sourcing and approval gates.
6. Clean asset licensing before production release.

## Quality Bar

This slice follows `game-quality-craft`: every visible actor must behave believably, and no approval can be faked. If an asset is generated, derived, unknown, or not commercially cleared, the repo must say so and block production approval.

## Scope

### Boss Sprites

- Generate repeatable, separate boss sprite sheets under `public/assets/sprites/bosses/`.
- Wire bosses to their own texture keys.
- Remove runtime tinting as the boss identity system.
- Mark these boss sheets as prototype-derived art that still needs artist replacement or formal approval.

### Visual Baselines

- Extend Playwright visual baseline tests beyond idle.
- Cover player punch, kick, jump.
- Cover enemy walk, punch, kick, guard/hurt/down style states.
- Cover boss spawn/identity state.

### Combat Metadata

- Add per-frame attack hitbox timing metadata.
- Add actor hurtbox metadata that can be inspected and validated.
- Keep fallback compatibility for existing combat code while moving toward frame-aware combat.

### AI/NPC/World Rules

- Add AI behavior guardrails in data/code:
  - do not telegraph/attack off-lane or out of range,
  - keep pursuit spacing believable,
  - do not guard randomly far from the player,
  - expose AI debug state for tests.
- Add an NPC/world-behavior data contract so future background actors and passersby follow the same believability standard.

### Audio and Licensing

- Create an audio sourcing manifest with source, author, license, approval, and replacement status.
- Add a validation gate for audio sourcing.
- Add a release-readiness gate that blocks production release when assets are unknown, blocked, placeholder, or only needs-review.
- Keep current audio usable in development, but do not claim release approval.

## Non-Goals

- Do not mark any current art/audio as production-approved without proof.
- Do not touch the `Youtube++` app.
- Do not use the raw `public/assets/backgrounds/Temp/` folder as committed production input.
- Do not pretend generated/derived boss sheets are final hand-authored SNES-quality art.

## Implementation Plan

1. Add a repeatable boss-sheet generator using ImageMagick.
2. Generate four distinct boss texture files and update boss data.
3. Extend animation/runtime code so bosses use their own texture keys.
4. Add visual baseline tests and update snapshots.
5. Extend combat data/types/validation for per-frame attack and hurtbox metadata.
6. Add AI debug fields and stricter behavior checks.
7. Add NPC/world-behavior data and validation.
8. Add audio source manifest and validation.
9. Add release gate that proves production is still blocked until licensing is cleaned.
10. Run full verification, commit, and push.

## Verification

- `npm run boss-sheets`
- `npm run contact-sheets`
- `npm run test:assets`
- `npm run test:levels`
- `npm run test:map-art`
- `npm run test:maps`
- `npm run test:audio`
- `npm run test:release`
- `npm test`
- focused Playwright e2e checks
- `npm run update:screenshots`
- `npm run test:screenshots`
- `npm run build`

## Done Means

- Bosses no longer use `setTint` on the regular enemy sheet for identity.
- New visual baselines exist for player, enemy, and boss action states.
- Hitbox/hurtbox metadata is explicit and validated.
- AI tests cover the believability rules.
- Audio and licensing gates exist and block production release honestly.
