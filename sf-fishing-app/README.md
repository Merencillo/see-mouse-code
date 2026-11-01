# 🦀🎣 Mouse’s Fav Spots

A mobile-friendly web app for planning fishing and crabbing trips around the
San Francisco Bay. It pulls live tide predictions and weather, then works out
the best windows for each spot — grouped into tabs so you can check tides,
wind, slack water, crabbing, fishing, and common catches at a glance.

Built with React + Vite + Tailwind. No backend, no API keys — everything runs
in the browser against free public APIs.

## Features

- **Tabbed sections** — 🌊 Tides · 🌬️ Weather · ⚓ Slack · 🦀 Crab · 🎣 Fish · 🐟 Catches
- **Today / 5-day forecast** — a range toggle plus a day picker; the selected
  day drives every tab
- **Per-station tides** — spots are tied to the nearest NOAA station for
  spot-accurate high/low times:
  - **Golden Gate** (`9414290`) — Torpedo Wharf, Baker Beach, Crissy Field
  - **Yerba Buena Is.** (`9414782`) — Clipper Cove Beach, Bimla Rhinehart Vista Point
  - **Sausalito** (`9414806`) — Fort Baker / Horseshoe Bay
  - **Ocean Beach** (`9414275`) — Ocean Beach
  - **Oyster Point** (`9414392`) — Oyster Point Pier

  Golden Gate and Yerba Buena are the *primary* stations and drive the Tides
  and Slack tabs; the rest are fetched only to serve their crabbing spots.
- **Slack tide windows** — low-current periods (±30 min around each tide
  midpoint), ideal for boating and easy casting
- **Best crabbing times** — windows around each low tide, **scored out of 100**
  and ranked so the day's best window is called out, plus per-spot legality:
  - **Scoring** blends how far the tide actually drops (50 pts), moon phase
    (15), the day's peak wind (20), and daylight for access (15). Each window
    shows the reasons behind its rating.
  - **Dungeness season banner** — open/closed with a countdown to the next
    first-Saturday-in-November opener
  - **Size & bag limits** for Dungeness (5¾ in · 10/day) and rock crab
    (4 in · 35/day)
  - **Water-body legality** — Dungeness may not be taken inside SF or San Pablo
    bays at all, so bay spots are flagged rock-crab-only
  - **Gear restriction notice** — recreational crab traps are closed for
    2026–27 (hoop nets, loop traps, or hands only)
- **Best fishing times** — per-location windows rated off slack tide, with
  tips for each spot
- **Wind & weather** — current conditions plus a 5-day outlook for the Golden
  Gate and Treasure Island areas, with a wind-based "friendliness" verdict
  (Calm / Breezy / Windy / Rough)
- **Common catches** — species you're likely to hook at each spot, drawn as
  hand-made pixel-art sprites

## Tech stack

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- ESLint

## Data sources

- **Tides** — [NOAA CO-OPS Tides & Currents API](https://api.tidesandcurrents.noaa.gov/api/prod/)
  (hi/lo predictions, MLLW datum, English units)
- **Weather** — [Open-Meteo Forecast API](https://open-meteo.com/) (current
  conditions, hourly outlook, and 5-day daily forecast; no API key required)

Both are free and called directly from the client.

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## Project structure

```
src/
├── App.jsx                     # data fetching, range/day + tab state, per-day derivations
├── components/
│   ├── Header.jsx
│   ├── TideTimeline.jsx        # Tides tab — per-station hi/lo cards
│   ├── WeatherSection.jsx      # Weather tab — per-area conditions + outlook
│   ├── SlackWindows.jsx        # Slack tab — per-station slack windows
│   ├── CrabbingSection.jsx     # Crab tab — per-spot windows + moon phase
│   ├── FishingSection.jsx      # Fish tab — per-spot windows + tips
│   ├── CatchesSection.jsx      # Catches tab — species by location
│   └── PixelSprite.jsx         # renders pixel-art sprites as crisp SVG
└── utils/
    ├── tideUtils.js            # NOAA fetch, station registry, slack/crab/fish windows
    ├── weatherUtils.js         # Open-Meteo fetch, wind verdict, locations
    ├── moonPhase.js            # moon phase from a synodic-period calc
    └── pixelSprites.js         # sprite grids, species palettes, catches data
```

## How it works

On load, the app fetches 5 days of tide predictions for every station and a
5-day weather forecast for each area up front, so switching the range or day
is instant. Stations are fetched in parallel and failures are dropped
individually — only Golden Gate, the reference station, is required. For the selected day it groups predictions by station and derives
slack, crabbing, and fishing windows on the fly. Weather is treated as a
nice-to-have — if an area's request fails it simply drops out rather than
blocking the tide-driven core.

## Disclaimer

Tide, weather, and catch information is for planning only and may be
inaccurate. The crab regulations in `src/utils/crabRegs.js` were checked
against CDFW on **2026-11-01** and are **not** fetched live — CDFW changes gear
rules mid-season and closes areas for domoic acid, so re-check the links in the
Crab tab before every trip. Always follow
[CDFW fishing regulations](https://wildlife.ca.gov/Fishing) — licenses, size
and bag limits, and seasons — before you head out.
