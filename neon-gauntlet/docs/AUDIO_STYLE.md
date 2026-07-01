# Audio Style

Neon Gauntlet should sound like a compact 16-bit arcade brawler: punchy hits, short UI bleeps, and looping synth bass music that does not distract from action.

## Current Audio

The current files are generated original placeholder WAV files:

- `public/assets/audio/music/stage-01-loop.wav`
- `public/assets/audio/sfx/punch.wav`
- `public/assets/audio/sfx/kick.wav`
- `public/assets/audio/sfx/hit.wav`
- `public/assets/audio/sfx/jump.wav`
- `public/assets/audio/sfx/hurt.wav`
- `public/assets/audio/sfx/guard.wav`
- `public/assets/audio/sfx/stage-clear.wav`

## Target Audio

Replace placeholders with commercial-safe original or licensed assets:

- Stage music loop: OGG preferred, WAV acceptable for short loops.
- SFX: WAV for short effects.
- Keep files small for mobile.
- Unlock audio on first user gesture.
- Always provide mute.

## Event Mapping

Audio events are data-driven through `public/data/audio.json`.
