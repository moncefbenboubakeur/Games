# Slice 7: China Long Background Intake

## Goal

Promote the user-provided long China background plates from the temporary intake folder into stable game assets, then wire them into the harness as real level plates instead of fixed one-screen backdrops.

## Source Folder

Only use:

`public/assets/backgrounds/Temp/long/Asia/China/`

Do not use older short/temp/background experiments for this slice.

## Promoted Assets

| Level | Stable asset | Source size | Logical world width |
| --- | --- | ---: | ---: |
| `stage-01-metro-arcade` | `public/assets/backgrounds/china/stage-01-metro-arcade.png` | 1916x821 | 576 |
| `stage-02-china-station` | `public/assets/backgrounds/china/stage-02-china-station.png` | 1916x821 | 576 |
| `stage-03-china-back-alley` | `public/assets/backgrounds/china/stage-03-china-back-alley.png` | 2172x724 | 720 |
| `stage-04-china-night-market` | `public/assets/backgrounds/china/stage-04-china-night-market.png` | 2172x724 | 720 |

The logical world width preserves each image aspect ratio at the game's 240px internal height. This avoids the previous stretched-map look, but it also means these files are still short for full brawler stages. For longer stages, the source art should be wider at the same height ratio.

## Implementation Plan

1. Promote the four China PNGs into `public/assets/backgrounds/china/` with stable level-based names.
2. Register each plate in `public/data/map-art.json`.
3. Register each plate in `public/data/assets.json`.
4. Replace Stage 1's active background with the China arcade plate.
5. Generate Tiled-style map JSON for all four China levels.
6. Generate level data JSON for all four China levels.
7. Update `scenePlate` rendering so level plates scroll with the camera instead of being fixed to the viewport.
8. Expand `npm run test:maps` so it validates every map file.
9. Run the full validation stack and capture visual review screenshots.

## Verification

Required before the slice is considered done:

- `npm run test:levels`
- `npm run test:map-art`
- `npm run test:maps`
- `npm run test:assets`
- `npm test`
- `npm run build`
- focused browser/visual check of Stage 1 using the China arcade plate

## Follow-Up

- Add runtime level selection/loading for the new China maps.
- Replace placeholder boss assignments for stages 2-4.
- If the user wants longer scrolling stages, request wider plates or split plate chunks, ideally with a visual width of at least 3-5 gameplay screens.
