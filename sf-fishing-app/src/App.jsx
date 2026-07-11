import { useState, useEffect } from 'react'
import Header from './components/Header'
import TideTimeline from './components/TideTimeline'
import WeatherSection from './components/WeatherSection'
import SlackWindows from './components/SlackWindows'
import FishingSection from './components/FishingSection'
import CrabbingSection from './components/CrabbingSection'
import { getSlackWindows, getFishingWindows, getCrabbingWindows, fetchPredictions, TIDE_STATIONS } from './utils/tideUtils'
import { getMoonPhase } from './utils/moonPhase'
import { fetchWeather, WEATHER_LOCATIONS } from './utils/weatherUtils'
import './App.css'

function getTodayParam() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

export default function App() {
  const [predictions, setPredictions] = useState(null)
  const [clipperTides, setClipperTides] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const today = getTodayParam()
    // Golden Gate is the reference station and drives the core of the app.
    fetchPredictions(TIDE_STATIONS.goldengate.id, today)
      .then(setPredictions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const today = getTodayParam()
    // Yerba Buena Island gives spot-accurate tides for Clipper Cove — optional,
    // so a failure just falls back to Golden Gate rather than blocking the app.
    fetchPredictions(TIDE_STATIONS.yerbabuena.id, today)
      .then(setClipperTides)
      .catch(() => setClipperTides(null))
  }, [])

  useEffect(() => {
    // Weather is a nice-to-have — fetch each area in parallel and drop any
    // that fail rather than blocking the tide-driven core of the app.
    Promise.all(
      WEATHER_LOCATIONS.map(loc =>
        fetchWeather(loc)
          .then(data => ({ ...loc, data }))
          .catch(() => null)
      )
    ).then(results => setWeather(results.filter(Boolean)))
  }, [])

  const moonPhase = getMoonPhase()
  const slackWindows = predictions ? getSlackWindows(predictions) : []
  const fishingWindows = getFishingWindows(slackWindows)

  // Crabbing windows per station — spots resolve their own via stationKey.
  const crabWindowsByStation = {}
  if (predictions) crabWindowsByStation.goldengate = getCrabbingWindows(predictions)
  if (clipperTides) crabWindowsByStation.yerbabuena = getCrabbingWindows(clipperTides)

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
            <TideTimeline predictions={predictions} />
            {weather && weather.length > 0 && <WeatherSection reports={weather} />}
            <SlackWindows windows={slackWindows} />
            <CrabbingSection windowsByStation={crabWindowsByStation} moonPhase={moonPhase} />
            <FishingSection windows={fishingWindows} />
          </>
        )}
      </div>
    </div>
  )
}
