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
