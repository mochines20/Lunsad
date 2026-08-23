# LUNSAD — Launch Your Knowledge

Knowledge-powered vertical space adventure. Every correct answer = thrust (ship climbs), every wrong answer = altitude loss + energy damage. Vanilla HTML/CSS/JS, no build step, no dependencies beyond Google Fonts.

## Run

```bash
python3 -m http.server 12000   # serves index.html; previews on the work-1 host
```

## Structure

- `index.html` — all screens: landing, onboard (mock auth), hangar (home), game, results, flight-map modal
- `css/styles.css` — full styling; Chakra Petch (display) + Space Mono (telemetry)
- `js/data.js` — `ZONES` (8 altitude bands with sky gradients + fact pools), `QUESTIONS` (30, difficulty 1–3), `FACTS` (zone-themed), `TUNING`
- `js/app.js` — screen flow, world builder, quiz loop, boosters, streaks, WebAudio SFX, localStorage persistence (`lunsad_profile`)

## Key mechanics

- World is a single tall column (`#world-inner`, height `WORLD_TOP`); camera = `translateY(altitude)`, ship stays fixed
- Thrust: +800/+1600/+2400 by difficulty, ×2 with BOOST, +10%/streak up to ×1.5
- Wrong answer: −1,000m (SHIELD blocks), −1 energy; 3 energy total; 0 = mission failed
- Boosters per mission: RADAR ×2, SCAN ×2, BOOST ×1, SHIELD ×1, WARP ×1 (skip, −300m)
- Round: 10 questions (3 easy → 4 medium → 3 hard), 30s each, timeout = wrong
- Stardust (✨) persists across missions; flight map shows best altitude per zone

## Notes

- DUO mode is a locked placeholder
- Auth buttons are mock (go straight to pilot setup)
- Emojis render as boxes in headless test browsers without emoji fonts — fine on real devices

## Pixel Art Theme (retro arcade)
- All visual assets are pixel art defined in js/data.js as char grids (PXART)
  with a shared palette (PAL); px() renders them to crisp SVG rects
  (shape-rendering=crispEdges, CSS image-rendering: pixelated).
- Ship flame rows (below flameFrom) render in <g class="px-flame"> for
  stepped flicker animation.
- To inject art into HTML: <div data-px="ship" data-cls="ship-svg"></div>
  (hydrated at init in app.js).
- UI font: Press Start 2P (--font-pixel) for titles/buttons/HUD;
  Space Mono/Chakra Petch for body. All panels are square (no border-radius)
  with hard offset shadows.

## UI/UX Improvement Pass
- PXICON set in data.js (heart/heartEmpty/dust/radar/scan/bolt/shield/warp/
  medalS/rocket/bulb) rendered via pxIcon(); hydrate with [data-icn] slots.
- HUD energy = pixel hearts (renderEnergy(), blinks when 1 left);
  stardust = pixel star icon with bump animation on gain.
- Keyboard: 1-4 answer, R/S/B/H/W boosts, Esc abort, Enter/Space advances
  landing/hangar/results screens. kbd badges shown on options and boosts.
- Fact toast types out with blinking block cursor + tick sfx.
- NEW RECORD blink tag on results (isRecord = finalAlt > prev bestAlt).
- CRT stepped screen transitions (crtIn), stepped zone banner, attract-mode
  blinking START button, red blinking low-timer bar, wrong-answer shake.
