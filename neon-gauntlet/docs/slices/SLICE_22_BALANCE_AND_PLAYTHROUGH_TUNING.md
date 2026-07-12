# Slice 22: Balance And Playthrough Tuning

## Goal

Turn the ten-stage vertical slice into a more intentional playthrough curve with explicit automated balance checks.

## Scope

- Add `public/data/balance.json` as the stage-by-stage balance contract.
- Add `tools/validate-balance.mjs` to inspect level data, enemy role mix, boss stats, phase counts, stage length, and computed threat curve.
- Add `npm run test:balance`.
- Tune enemy counts/role variety for stages 3 and 7-10.
- Tune boss HP/damage and final-boss phase count so stage difficulty rises toward the finale.

## Quality Rules

- Difficulty should rise without turning early stages into unfair walls.
- Role variety must increase as stages get longer.
- Final boss should stand out mechanically with an extra phase.
- This is data balancing, not final human playtest approval.
- Do not touch `Youtube++`.
- Do not commit `public/assets/backgrounds/Temp/`.

## Implementation Plan

1. Add a balance contract with exact stage enemy counts, boss stat ranges, minimum role diversity, and phase expectations.
2. Add a validator that computes per-stage threat and checks the contract.
3. Tune level enemy waves to match the contract.
4. Tune boss stats and add a final low-HP phase to `zero-volt-ren`.
5. Run the validator, level validation, unit tests, build, commit, and push.

## Verification

- `npm run test:balance`
- `npm run test:levels`
- `npm test`
- `npm run build`

## Done Means

- Every stage has an explicit balance target.
- The computed threat curve does not accidentally go backward.
- Later stages have stronger role variety and boss pressure.
- The final boss has a distinct third phase.
