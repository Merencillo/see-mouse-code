import { TIDE_STATIONS } from '../utils/tideUtils'

const SPOTS = [
  {
    name: 'Torpedo Wharf',
    emoji: '🎣',
    stationKey: 'goldengate',
    tip: 'Deep water off the pier — target striped bass and halibut on the incoming tide. Cast toward the channel and let bait drift.',
  },
  {
    name: 'Baker Beach',
    emoji: '🎣',
    stationKey: 'goldengate',
    tip: 'Surfperch and stripers along the sand. Work the troughs on a rising tide; pile worms and grubs get bites.',
  },
  {
    name: 'Crissy Field',
    emoji: '🎣',
    stationKey: 'goldengate',
    tip: 'Shoreline casting for perch, jacksmelt, and the odd striper. Best on a moving tide near the Warming Hut.',
  },
  {
    name: 'Clipper Cove Beach',
    emoji: '🎣',
    stationKey: 'yerbabuena',
    tip: 'Calm, shallow cove — good for perch and jacksmelt. Fish the eelgrass edges and TI pier on a rising tide.',
  },
]

export default function FishingSection({ windowsByStation }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
      <h2 className="text-blue-700 font-bold text-lg mb-3">🎣 Best Fishing Times</h2>

      {SPOTS.map(spot => {
        // Use the spot's own station; fall back to Golden Gate if it didn't load.
        const stationKey = windowsByStation[spot.stationKey] ? spot.stationKey : 'goldengate'
        const station = TIDE_STATIONS[stationKey]
        const windows = windowsByStation[stationKey] || []
        return (
          <div key={spot.name} className="mb-5">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-bold text-blue-800 text-base">
                {spot.emoji} {spot.name}
              </h3>
              <span className="text-gray-400 text-xs">🌊 {station.name} · {station.id}</span>
            </div>
            <div className="space-y-2">
              {windows.map((w, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 border-l-4 ${
                    w.isFlooding ? 'bg-blue-50 border-blue-500' : 'bg-sky-50 border-sky-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      w.isFlooding ? 'bg-blue-200 text-blue-800' : 'bg-sky-200 text-sky-800'
                    }`}>
                      {w.rating === 'Excellent' ? '🌟 Excellent' : '👍 Good'}
                    </span>
                    <span className="text-xs text-gray-400">{w.type}</span>
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">
                    {w.start} → {w.end}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2 italic">💡 {spot.tip}</p>
          </div>
        )
      })}
    </div>
  )
}
