Fetch today's tide predictions for San Francisco from the NOAA API and report when slack tide is occurring at Torpedo Wharf, Crissy Field, and Baker Beach.

## Instructions

1. Fetch tide predictions from NOAA using this URL:
   https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=web_services&begin_date=TODAY&end_date=TODAY&datum=MLLW&station=9414290&time_zone=lst_ldt&interval=hilo&units=english&format=json

   Replace TODAY with today's date in YYYYMMDD format (e.g. 20260427).

2. Parse the high and low tide times from the response.

3. Slack tide occurs approximately halfway between each consecutive high and low tide. Calculate the midpoint time between each pair of consecutive highs and lows — those are the slack tide windows. Slack tide typically lasts about 1 hour, so use ± 30 minutes around the midpoint as the usable window.

4. Report the results clearly in this format:

---
🌊 **Slack Tide Today — Torpedo Wharf, Crissy Field & Baker Beach**
*(All three spots share essentially the same tide, based on NOAA Station 9414290 — San Francisco)*

First, show the day's full tide schedule as a mini timeline using emoji to make it easy to scan:

🕐 **Today's Tide Schedule**
Use 🔵 for High tide and ⚪ for Low tide, one line per event, e.g.:
⚪ Low — 3:26 AM (1.2 ft)
🔵 High — 9:24 AM (4.5 ft)
...

Then show the slack tide windows table. Use 🟢 for flooding (Low→High) and 🟠 for ebbing (High→Low):

| 🕐 Slack Start | 🕐 Slack End | ↕️ Direction | 🌊 Type |
|---|---|---|---|
| [midpoint − 30 min] | [midpoint + 30 min] | L→H | 🟢 Flooding |
| [midpoint − 30 min] | [midpoint + 30 min] | H→L | 🟠 Ebbing |
| ... | ... | ... | ... |

Include whether the water is transitioning from High→Low (ebbing) or Low→High (flooding) for each slack, since that affects conditions at each spot differently.

Add a brief note at the bottom about what slack tide means for each location, using emoji for each spot:
- 🎣 **Torpedo Wharf** — good for fishing, calm water
- 🏊 **Crissy Field** — best for swimming/wading, minimal current
- 🏖️ **Baker Beach** — safest entry/exit, reduced rip current risk

Then add a crabbing section. For each Low tide, calculate the best crabbing window as 90 minutes before to 60 minutes after the Low tide. Show separate recommendations for Torpedo Wharf and Baker Beach:

🦀 **Best Crabbing Times**

| 🕐 Crab Start | 🕐 Peak (Low Tide) | 🕐 Crab End | 📏 Low Height |
|---|---|---|---|
| [low − 90 min] | [low time] | [low + 60 min] | [height] ft |
| ... | ... | ... | ... |

- 🦀 **Torpedo Wharf** — work the pilings right at low water; crabs concentrate in the shallows
- 🦀 **Baker Beach** — wade the sandy flats 90 min before low tide as crabs move with the ebb
---
