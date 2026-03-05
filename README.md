# Backyard Defense (HTML PvZ-style Clone)

Single-level Plants-vs-Zombies-inspired clone built with plain HTML/CSS/JS ES modules.

## Highlights

- No audio system.
- Runtime-generated SVG graphics rasterized into a bitmap atlas.
- Deterministic 60 FPS fixed-step game loop.
- 5x9 lawn grid, 6 plants, 5 zombies, scripted waves, lawnmowers, win/lose states.
- Settings persistence in `localStorage` (`difficulty`, `muted` placeholder).

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Test

```bash
npm run test:unit
npm run test:e2e
```
