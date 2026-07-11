import { useState, useEffect } from 'react'
import Header from './components/Header'
import TideTimeline from './components/TideTimeline'
import WeatherSection from './components/WeatherSection'
import SlackWindows from './components/SlackWindows'
import FishingSection from './components/FishingSection'
import CrabbingSection from './components/CrabbingSection'
import {
  getSlackWindows,
  getFishingWindows,
  getCrabbingWindows,
  fetchPredictions,
  groupByDay,
  TIDE_STATIONS,
} from './utils/tideUtils'
import { getMoonPhase } from './utils/moonPhase'
import { fetchWeather, WEATHER_LOCATIONS, FORECAST_DAYS } from './utils/weatherUtils'
import './App.css'

const TABS = [
  { id: 'tides', label: 'Tides', emoji: '🌊' },
  { id: 'weather', label: 'Weather', emoji: '🌬️' },
  { id: 'slack', label: 'Slack', emoji: '⚓' },
  { id: 'crab', label: 'Crab', emoji: '🦀' },
  { id: 'fish', label: 'Fish', emoji: '🎣' },
]

const RANGES = [
  { days: 1, label: 'Today' },
  { days: 5, label: '5 Days' },
]

// Date pieces for an offset from today, in the formats NOAA and the UI need.
function dateParts(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return { param: `${y}${m}${day}`, date: `${y}-${m}-${day}`, dateObj: d }
}

function buildDays(count) {
  return Array.from({ length: count }, (_, i) => {
    const { date, dateObj } = dateParts(i)
    return {
      index: i,
      date,
      label: i === 0
        ? 'Today'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
    }
  })
}

export default function App() {
  const [predictions, setPredictions] = useState(null)
  const [clipperTides, setClipperTides] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rangeDays, setRangeDays] = useState(1)
  const [selectedDay, setSelectedDay] = useState(0)
  const [activeTab, setActiveTab] = useState('tides')

  useEffect(() => {
    const begin = dateParts(0).param
    const end = dateParts(FORECAST_DAYS - 1).param
    // Golden Gate is the reference station and drives the core of the app.
    fetchPredictions(TIDE_STATIONS.goldengate.id, begin, end)
      .then(setPredictions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const begin = dateParts(0).param
    const end = dateParts(FORECAST_DAYS - 1).param
    // Yerba Buena Island gives spot-accurate tides for Clipper Cove — optional,
    // so a failure just falls back to Golden Gate rather than blocking the app.
    fetchPredictions(TIDE_STATIONS.yerbabuena.id, begin, end)
      .then(setClipperTides)
      .catch(() => setClipperTides(null))
  }, [])

  useEffect(() => {
    // Weather is a nice-to-have — fetch each area in parallel and drop any
    // that fail rather than blocking the tide-driven core of the app.
    Promise.all(
      WEATHER_LOCATIONS.map(loc =>
        fetchWeather(loc)
          .then(data => ({ ...loc, weather: data }))
          .catch(() => null)
      )
    ).then(results => setWeather(results.filter(Boolean)))
  }, [])

  const days = buildDays(rangeDays)
  const dayIndex = Math.min(selectedDay, days.length - 1)
  const activeDate = days[dayIndex].date

  // Resolve the selected day's hi/lo predictions for each station.
  const goldByDate = predictions ? groupByDay(predictions) : new Map()
  const clipByDate = clipperTides ? groupByDay(clipperTides) : new Map()
  const dayPreds = goldByDate.get(activeDate) || []
  const dayClip = clipByDate.get(activeDate) || null

  const moonPhase = getMoonPhase(new Date(`${activeDate}T12:00:00`))

  // Per-station predictions for the selected day, paired with station metadata.
  const stationDays = [
    { key: 'goldengate', ...TIDE_STATIONS.goldengate, predictions: dayPreds },
    { key: 'yerbabuena', ...TIDE_STATIONS.yerbabuena, predictions: dayClip || [] },
  ].filter(s => s.predictions.length)

  // Tide + Slack cards per station — mirrors the Weather tab's per-location layout.
  const tideReports = stationDays
  const slackReports = stationDays.map(s => ({ ...s, windows: getSlackWindows(s.predictions) }))

  const crabWindowsByStation = {}
  const fishWindowsByStation = {}
  for (const s of slackReports) {
    crabWindowsByStation[s.key] = getCrabbingWindows(s.predictions)
    fishWindowsByStation[s.key] = getFishingWindows(s.windows)
  }

  // Build weather cards for the selected day: live "now" for today, daily
  // hi/lo + max wind for future days.
  const weatherReports = (weather || []).map(loc => {
    const day = loc.weather.days[dayIndex] || loc.weather.days.at(-1)
    const isToday = dayIndex === 0
    const data = isToday
      ? { isToday: true, ...loc.weather.current, outlook: loc.weather.outlook }
      : {
          isToday: false,
          emoji: day.emoji,
          label: day.label,
          tempHi: day.tempHi,
          tempLo: day.tempLo,
          windSpeed: day.windMax,
          windGusts: day.gustMax,
          windDir: day.windDir,
        }
    return { id: loc.id, name: loc.name, covers: loc.covers, data }
  })

  function selectRange(count) {
    setRangeDays(count)
    setSelectedDay(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-orange-50">
      <Header />
      <div className="max-w-md mx-auto px-4 pb-8">
        {loading && (
          <div className="text-center py-16 text-sky-500 text-lg animate-pulse">
            🌊 Loading tide data...
          </div>
        )}
        {error && (
          <div className="bg-red-50 rounded-2xl p-4 text-red-600 text-center mt-4">
            ⚠️ Couldn't load tide data: {error}
          </div>
        )}
        {predictions && (
          <>
            {/* Forecast range */}
            <div className="flex gap-2 mt-4">
              {RANGES.map(r => (
                <button
                  key={r.days}
                  onClick={() => selectRange(r.days)}
                  className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    rangeDays === r.days
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-sky-600 border border-sky-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Day picker */}
            {rangeDays > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {days.map(d => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDay(d.index)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      dayIndex === d.index
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}

            {/* Section tabs */}
            <nav className="flex mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold transition-colors ${
                    activeTab === t.id
                      ? 'text-sky-700 bg-sky-50 border-b-2 border-sky-500'
                      : 'text-gray-400 border-b-2 border-transparent'
                  }`}
                >
                  <span className="text-lg leading-none mb-0.5">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Active section */}
            {activeTab === 'tides' && (
              <TideTimeline reports={tideReports} label={days[dayIndex].label} />
            )}
            {activeTab === 'weather' && (
              weather === null
                ? <div className="text-center py-10 text-sky-400 animate-pulse">🌬️ Loading weather...</div>
                : weatherReports.length > 0
                  ? <WeatherSection reports={weatherReports} />
                  : <div className="bg-white rounded-2xl shadow-md p-4 mt-4 text-center text-gray-400">Weather unavailable right now.</div>
            )}
            {activeTab === 'slack' && <SlackWindows reports={slackReports} />}
            {activeTab === 'crab' && (
              <CrabbingSection windowsByStation={crabWindowsByStation} moonPhase={moonPhase} />
            )}
            {activeTab === 'fish' && <FishingSection windowsByStation={fishWindowsByStation} />}
          </>
        )}
      </div>
    </div>
  )
}
