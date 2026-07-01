# Games Lab

Standalone game workspace for building and testing games outside the Youtube++ app.

Each game should live in its own folder and include every file it needs to run. Do not import files from `../Youtube++`; copy or build shared harness code into this repo first.

## Games

- `neon-gauntlet/` - standalone export of Neon Gauntlet.

## Run A Game

```sh
cd neon-gauntlet
npm start
```

Then open the local URL printed by the server.

## Verify A Game

```sh
npm run smoke:neon
```

For Neon Gauntlet's full local checks:

```sh
cd neon-gauntlet
npm run test
npm run build
npm run test:screenshots
```
