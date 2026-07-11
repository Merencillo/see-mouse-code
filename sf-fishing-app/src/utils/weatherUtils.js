// Fishing areas we report weather for. Coordinates are the on-the-water
// spots (Golden Gate near NOAA station 9414290; Treasure Island covers
// Clipper Cove Beach and Yerba Buena Island).
export const WEATHER_LOCATIONS = [
  {
    id: 'goldengate',
    name: 'Golden Gate',
    covers: 'Torpedo Wharf · Baker Beach · Crissy Field',
    lat: 37.806,
    lon: -122.465,
  },
  {
    id: 'treasureisland',
    name: 'Treasure Island',
    covers: 'Clipper Cove Beach · Yerba Buena Is.',
    lat: 37.813,
    lon: -122.366,
  },
]

// WMO weather interpretation codes → emoji + label
// https://open-meteo.com/en/docs
function weatherCodeInfo(code) {
  if (code === 0) return { emoji: '☀️', label: 'Clear' }
  if (code <= 2) return { emoji: '🌤️', label: 'Mostly clear' }
  if (code === 3) return { emoji: '☁️', label: 'Overcast' }
  if (code <= 48) return { emoji: '🌫️', label: 'Fog' }
  if (code <= 57) return { emoji: '🌦️', label: 'Drizzle' }
  if (code <= 67) return { emoji: '🌧️', label: 'Rain' }
  if (code <= 77) return { emoji: '🌨️', label: 'Snow' }
  if (code <= 82) return { emoji: '🌧️', label: 'Rain showers' }
  if (code <= 99) return { emoji: '⛈️', label: 'Thunderstorm' }
  return { emoji: '🌊', label: 'Unknown' }
}

// Wind speed (mph) → crabbing/casting friendliness verdict
export function windVerdict(mph) {
  if (mph < 10) return { label: 'Calm', tone: 'good', tip: 'Great conditions — easy casting and steady traps.' }
  if (mph < 18) return { label: 'Breezy', tone: 'ok', tip: 'Manageable, but dress warm and watch your line.' }
  if (mph < 25) return { label: 'Windy', tone: 'warn', tip: 'Choppy water and tougher casting — pick sheltered spots.' }
  return { label: 'Rough', tone: 'bad', tip: 'Small-craft caution — a tough, gusty day out there.' }
}

// Wind direction (degrees) → 16-point compass label
export function windDirection(deg) {
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return points[Math.round(deg / 22.5) % 16]
}

function formatHour(iso) {
  const h = new Date(iso).getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}${ampm}`
}

// Build a compact "later today" outlook: up to 4 upcoming daylight-ish hours
function buildOutlook(hourly) {
  if (!hourly?.time) return []
  const now = Date.now()
  const rows = hourly.time
    .map((iso, i) => ({
      iso,
      hour: new Date(iso).getHours(),
      temp: Math.round(hourly.temperature_2m[i]),
      wind: Math.round(hourly.wind_speed_10m[i]),
      code: hourly.weather_code[i],
    }))
    .filter(r => new Date(r.iso).getTime() >= now && r.hour >= 5 && r.hour <= 21)

  // Sample every 3 hours, cap at 4 entries
  return rows
    .filter((_, i) => i % 3 === 0)
    .slice(0, 4)
    .map(r => ({
      time: formatHour(r.iso),
      temp: r.temp,
      wind: r.wind,
      ...weatherCodeInfo(r.code),
    }))
}

export async function fetchWeather({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,wind_speed_10m,weather_code',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'America/Los_Angeles',
    forecast_days: '1',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  const data = await res.json()
  if (data.error) throw new Error(data.reason || 'Weather request failed')

  const c = data.current
  return {
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    windSpeed: Math.round(c.wind_speed_10m),
    windGusts: Math.round(c.wind_gusts_10m),
    windDir: windDirection(c.wind_direction_10m),
    ...weatherCodeInfo(c.weather_code),
    outlook: buildOutlook(data.hourly),
  }
}
