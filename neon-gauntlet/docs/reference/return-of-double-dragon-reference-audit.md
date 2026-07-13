# Return of Double Dragon Reference Audit

Source recording:
`public/assets/Screen Recording 2026-07-13 at 22.53.26.mov`

Reference target:
SNES-era side-scrolling beat-'em-up with dense pixel-art staging, readable combat lanes, enemies entering as a wave, and animation that always supports the actor's intent.

## Observed Timing Windows

- `40s-130s`: casino street stage with dense signage, multiple enemy types, edge entries, knockdowns, sword enemy, and throws.
- `140s-190s`: transition to outdoor/elevator zone with fewer enemies and more spatial breathing room.
- `200s-230s`: elevator arena. Small arena, enemies enter from edges/doors, camera framing is locked, and pressure comes from limited space.
- `250s-300s`: interior red-carpet stage with higher contrast, stronger vertical architecture, weapon enemy, and more staged enemy composition.

## Visual Quality Rules

- Backgrounds are not just backdrops. They are layered stage sets with signs, pillars, windows, doors, machines, railings, foreground floor pattern, and strong readable silhouettes.
- The playable floor is visually distinct from the decorative background. The player always understands where feet can stand.
- The HUD is large, arcade-like, and part of the style. It uses portraits, thick borders, strong colors, and score/health information that feels like a cabinet overlay.
- Characters are large compared with the stage, roughly occupying the bottom third of the screen.
- Enemy silhouettes are immediately readable by role: knife/sword enemy, heavy enemy, crouching/low enemy, fast striker.

## Combat Behavior Rules

- Enemies do not pop into the center. They enter from the screen edges or from credible stage openings.
- Enemies stage themselves around the player instead of stacking directly on top of each other.
- A typical encounter keeps 2-4 threats visible, with at least one enemy held at the edge as pressure.
- Attacks are short, readable commitments. The actor faces the target before and during the strike.
- Knockdowns linger long enough to read the hit, then the player can reorient.
- Weapon attacks have strong silhouettes and obvious directionality.
- Throws/launches are high-impact moments with big body displacement.

## Animation Rules

- Walk cycles use clear alternating feet and stable ground contact.
- Attack poses exaggerate the striking limb and keep the body direction coherent.
- Hurt/knockdown frames are distinct from idle/walk frames; the player can read impact immediately.
- Enemies with weapons keep the weapon visible in idle, approach, and strike frames.
- Actors do not guard or attack randomly when far away. Their visible action must match their reason.

## Camera And Level Flow

- The camera mostly scrolls horizontally, then locks or slows during encounter pockets.
- The game alternates between long street movement and compact arena fights.
- Stage transitions are visually staged: elevator platform, doorway/interior shift, or hard cut to a new set.
- Each area has its own readable identity, not just a recolored version of the previous map.

## Neon Gauntlet Implications

- Enemy and boss spawning should always happen from screen edges, doors, elevators, alleys, or other credible entry points.
- Add encounter pockets: lock/slow camera until the current wave is cleared, then show `GO >>>`.
- Improve enemy AI spacing so enemies flank, wait, or pressure from range instead of clustering.
- Keep boss and enemy facing metadata per sheet/action; never infer direction globally without visual proof.
- Bosses need unique sheets with weapon/pose identity, not resized or tinted regular enemies.
- Add weapon enemy behavior and big launch/throw reactions for a closer beat-'em-up feel.
- Stage maps need foreground/floor readability and dense background detail, but no confusing active props unless their purpose is clear.

## Verification Checklist

- Generate contact sheets for every imported actor animation before using it.
- Capture side-by-side screenshots of Neon Gauntlet vs this reference at matching moments:
  - first enemy wave
  - weapon enemy attack
  - knockdown
  - boss entrance
  - compact arena fight
- Browser-test enemy edge entry and facing.
- Visually review that every attack points toward the target in the captured screenshots.
- Do not mark a build ready until the visual result is compared against this reference recording.
