# Slice 9: China Level Identity

## Goal

Make the four China backgrounds play like four different areas instead of one repeated prototype. This slice is data-first: unique enemy waves, unique boss identities, and a readable area title overlay when each background starts.

## Scope

- Keep the four existing China plates.
- Keep the stitched `GO >>>` progression from the previous slice.
- Add unique bosses for stages 2-4.
- Tune enemy wave roles, lanes, and spawn spacing per level.
- Update map object layers so runtime data matches the level JSON.
- Add a short area title overlay at level start and after transitions.
- Update plan/status metadata to reflect that China stages now have named bosses.

## Non-Goals

- Do not create new sprite art in this slice.
- Do not invent complex boss AI here. Slice 10 owns boss behavior.
- Do not touch the main `Youtube++` repo.

## Verification

- `npm run test:levels`
- `npm run test:maps`
- `npm test`
- focused e2e smoke for progression/title state
- `npm run build`

## Quality Bar

Each area should communicate a different situation:

- Stage 1: arcade intro, balanced crew.
- Stage 2: station ambush, fast side pressure.
- Stage 3: back alley, tighter heavy pressure.
- Stage 4: night market, swarm pacing before the final China boss.
