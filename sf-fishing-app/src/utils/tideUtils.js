// NOAA tide prediction stations. Golden Gate is the SF Bay reference station;
// the rest are the nearest station to a spot we actually fish, so high/low
// times line up with the ground in front of you.
//
// `primary` stations drive the Tides and Slack tabs. The others are fetched
// only to serve their crabbing spots, so those tabs stay readable.
// `weatherKey` points at the nearest WEATHER_LOCATIONS entry — a wind proxy
// for window scoring, not a forecast for the spot itself.
export const TIDE_STATIONS = {
  goldengate: {
    id: '9414290',
    name: 'Golden Gate',
    covers: 'Torpedo Wharf · Baker Beach · Crissy Field',
    primary: true,
    weatherKey: 'goldengate',
  },
  yerbabuena: {
    id: '9414782',
    name: 'Yerba Buena Is.',
    covers: 'Clipper Cove Beach · Bimla Rhinehart Vista Pt.',
    primary: true,
    weatherKey: 'treasureisland',
  },
  sausalito: {
    id: '9414806',
    name: 'Sausalito',
    covers: 'Fort Baker · Horseshoe Bay',
    weatherKey: 'goldengate',
  },
  oceanbeach: {
    id: '9414275',
    name: 'Ocean Beach',
    covers: 'Ocean Beach',
    weatherKey: 'goldengate',
  },
  oysterpoint: {
    id: '9414392',
    name: 'Oyster Point',
    covers: 'Oyster Point Pier',
    weatherKey: 'treasureisland',
  },
}

export const PRIMARY_STATION_KEYS = Object.keys(TIDE_STATIONS).filter(
  k => TIDE_STATIONS[k].primary
)

export async function fetchPredictions(stationId, beginParam, endParam = beginParam) {
  const res = await fetch(
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=web_services&begin_date=${beginParam}&end_date=${endParam}&datum=MLLW&station=${stationId}&time_zone=lst_ldt&interval=hilo&units=english&format=json`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.predictions
}

// Split a flat hi/lo prediction list into a Map of 'YYYY-MM-DD' -> predictions[].
export function groupByDay(predictions) {
  const byDate = new Map()
  for (const p of predictions) {
    const date = p.t.split(' ')[0]
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date).push(p)
  }
  return byDate
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(' ')[1].split(':').map(Number)
  return h * 60 + m
}

export function formatTime(timeStr) {
  const [h, m] = timeStr.split(' ')[1].split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 || 12
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`
}

function minutesToDisplay(minutes) {
  const total = ((minutes % 1440) + 1440) % 1440
  const h = Math.floor(total / 60)
  const m = total % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 || 12
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`
}

export function getSlackWindows(predictions) {
  return predictions.slice(0, -1).map((curr, i) => {
    const next = predictions[i + 1]
    const mid = Math.round((toMinutes(curr.t) + toMinutes(next.t)) / 2)
    return {
      start: minutesToDisplay(mid - 30),
      end: minutesToDisplay(mid + 30),
      direction: curr.type === 'L' ? 'L→H' : 'H→L',
      type: curr.type === 'L' ? 'Flooding' : 'Ebbing',
      isFlooding: curr.type === 'L',
    }
  })
}

export function getFishingWindows(slackWindows) {
  return slackWindows.map(w => ({
    ...w,
    rating: w.isFlooding ? 'Excellent' : 'Good',
    tip: w.isFlooding
      ? 'Baitfish move in with the flood — prime feeding window'
      : 'Calm water and minimal current — easy casting',
  }))
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

// Scoring weights, out of 100 total.
const MAX_TIDE_POINTS = 50
const MAX_MOON_POINTS = 15
const MAX_WIND_POINTS = 20
const MAX_LIGHT_POINTS = 15

// A low of -2 ft MLLW is about as good as it gets here; +3 ft barely uncovers
// anything. Scale between them.
const BEST_LOW_FT = -2
const WORST_LOW_FT = 3

function tidePoints(height) {
  const span = WORST_LOW_FT - BEST_LOW_FT
  return clamp(((WORST_LOW_FT - height) / span) * MAX_TIDE_POINTS, 0, MAX_TIDE_POINTS)
}

function windPoints(mph) {
  if (mph == null) return MAX_WIND_POINTS * 0.6 // unknown — don't reward or punish
  if (mph < 10) return MAX_WIND_POINTS
  if (mph < 18) return MAX_WIND_POINTS * 0.65
  if (mph < 25) return MAX_WIND_POINTS * 0.3
  return 0
}

// Daylight is about access, not crab behaviour — they feed fine after dark, so
// a night window loses a little convenience, not its rating.
function lightPoints(minutes) {
  if (minutes >= 7 * 60 && minutes <= 18 * 60) return MAX_LIGHT_POINTS
  if (minutes >= 5 * 60 && minutes <= 20 * 60) return MAX_LIGHT_POINTS * 0.7
  return MAX_LIGHT_POINTS * 0.35
}

function isNight(minutes) {
  return minutes < 5 * 60 || minutes > 20 * 60
}

function ratingFor(score) {
  if (score >= 70) return { label: 'Prime', tone: 'prime' }
  if (score >= 50) return { label: 'Good', tone: 'good' }
  return { label: 'Fair', tone: 'fair' }
}

/**
 * Crabbing windows for a day's hi/lo predictions, scored and ranked.
 *
 * Each low tide gives one window (90 min before the low through 60 min after).
 * The score blends how far the tide actually drops, the moon phase's effect on
 * tidal range, the day's wind — which decides whether a hoop net is workable
 * from shore — and whether you'd be out there in the dark.
 */
export function getCrabbingWindows(predictions, { moonPhase, windMax } = {}) {
  const windows = predictions
    .filter(p => p.type === 'L')
    .map(low => {
      const lowMin = toMinutes(low.t)
      const height = parseFloat(low.v)
      const reasons = []

      const tide = tidePoints(height)
      if (height <= 0) reasons.push(`Minus tide (${height.toFixed(1)} ft) — maximum exposed ground`)
      else if (height < 1.5) reasons.push(`Good ${height.toFixed(1)} ft drop`)
      else reasons.push(`Only drops to ${height.toFixed(1)} ft — shallow low`)

      const moon = moonPhase?.crabbingBonus ? MAX_MOON_POINTS : MAX_MOON_POINTS * 0.4
      if (moonPhase?.crabbingBonus) reasons.push(`${moonPhase.name} — bigger tidal swing`)

      const wind = windPoints(windMax)
      if (windMax != null) {
        if (windMax < 10) reasons.push(`Calm — ${windMax} mph wind`)
        else if (windMax < 18) reasons.push(`Breezy — ${windMax} mph wind`)
        else reasons.push(`Windy — ${windMax} mph, hard on a hoop net`)
      }

      const light = lightPoints(lowMin)
      const night = isNight(lowMin)
      if (night) reasons.push('After dark — bring a headlamp')

      const score = Math.round(tide + moon + wind + light)
      return {
        start: minutesToDisplay(lowMin - 90),
        peak: minutesToDisplay(lowMin),
        end: minutesToDisplay(lowMin + 60),
        height: height.toFixed(1),
        score,
        night,
        reasons,
        ...ratingFor(score),
      }
    })

  // Flag the day's single best window, keeping the list in clock order.
  const best = windows.reduce((a, b) => (b.score > (a?.score ?? -1) ? b : a), null)
  return windows.map(w => ({ ...w, isBest: w === best && windows.length > 1 }))
}
