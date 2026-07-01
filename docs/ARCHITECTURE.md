# Architecture

## Repo Layout

```text
Games/
  games.json
  package.json
  docs/
  tools/
  test-results/
  neon-gauntlet/
    index.html
    serve.mjs
    _harness.js
    _game.css
    neon/assets/
```

## New Phaser Game Layout

Use this structure for new games:

```text
game-name/
  package.json
  index.html
  vite.config.ts
  src/
    game/
      main.ts
      config.ts
      scenes/
      entities/
      systems/
      data/
  public/
    assets/
      sprites/
      tilesets/
      maps/
      audio/
      ui/
  docs/
    GAME_SPEC.md
    STORY.md
    CHARACTERS.md
    STYLE_GUIDE.md
    AUDIO_STYLE.md
    TASKS.md
    LICENSES.md
```

## Game Data

Prefer JSON for content:

- enemies
- items
- levels
- dialogue
- animation metadata
- audio cues

This lets agents add content without rewriting core engine code.

## Rendering Rules

- Treat the game like a console screen, not a responsive website.
- Use a fixed internal resolution.
- Scale the canvas/screen with integer or pixel-safe scaling.
- Use `image-rendering: pixelated`.
- Snap camera and actor positions to pixels.
- Avoid layout-driven movement.

## Testing Rules

Use browser smoke tests for visual games:

- start a game server
- load the URL
- start gameplay
- assert no console errors
- assert assets load
- save a screenshot

For Phaser/TypeScript games, add unit tests for pure logic such as damage, inventory, collectibles, and door unlock rules.
