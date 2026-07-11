// NOAA tide prediction stations. Golden Gate is the SF Bay reference station;
// Yerba Buena Island sits right beside Clipper Cove for spot-accurate tides.
export const TIDE_STATIONS = {
  goldengate: {
    id: '9414290',
    name: 'Golden Gate',
    covers: 'Torpedo Wharf · Baker Beach · Crissy Field',
  },
  yerbabuena: {
    id: '9414863',
    name: 'Yerba Buena Is.',
    covers: 'Clipper Cove Beach',
  },
}

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

export function getCrabbingWindows(predictions) {
  return predictions
    .filter(p => p.type === 'L')
    .map(low => {
      const lowMin = toMinutes(low.t)
      return {
        start: minutesToDisplay(lowMin - 90),
        peak: minutesToDisplay(lowMin),
        end: minutesToDisplay(lowMin + 60),
        height: parseFloat(low.v).toFixed(1),
      }
    })
}
