import { useState, useEffect } from 'react'
import Header from './components/Header'
import TideTimeline from './components/TideTimeline'
import SlackWindows from './components/SlackWindows'
import FishingSection from './components/FishingSection'
import CrabbingSection from './components/CrabbingSection'
import { getSlackWindows, getFishingWindows, getCrabbingWindows } from './utils/tideUtils'
import { getMoonPhase } from './utils/moonPhase'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const today = getTodayParam()
    fetch(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=web_services&begin_date=${today}&end_date=${today}&datum=MLLW&station=9414290&time_zone=lst_ldt&interval=hilo&units=english&format=json`
    )
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error.message)
        setPredictions(data.predictions)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const moonPhase = getMoonPhase()
  const slackWindows = predictions ? getSlackWindows(predictions) : []
  const fishingWindows = getFishingWindows(slackWindows)
  const crabbingWindows = predictions ? getCrabbingWindows(predictions) : []

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
            <SlackWindows windows={slackWindows} />
            <CrabbingSection windows={crabbingWindows} moonPhase={moonPhase} />
            <FishingSection windows={fishingWindows} />
          </>
        )}
      </div>
    </div>
  )
}
