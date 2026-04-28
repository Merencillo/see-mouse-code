const RESOURCES = [
  {
    label: '📋 CA Dept of Fish & Wildlife — SF Regulations',
    url: 'https://wildlife.ca.gov/Fishing/Ocean/Regulations/Fishing-Map/San-Francisco',
  },
  {
    label: '🌊 NOAA Tide Station 9414290 — San Francisco',
    url: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=9414290',
  },
]

const SPOTS = [
  {
    name: 'Torpedo Wharf',
    emoji: '🦀',
    tip: 'Protected spot — crabs concentrate in the shallows at low tide. Work the pilings and drop your trap right at low water for best results.',
  },
  {
    name: 'Baker Beach',
    emoji: '🦀',
    tip: 'Exposed beach — crabs move with the ebb current along the bottom. Wade in 90 min before low tide and scan the sandy flats.',
  },
]

export default function CrabbingSection({ windows, moonPhase }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4 mb-6">
      <h2 className="text-orange-600 font-bold text-lg mb-3">🦀 Best Crabbing Times</h2>

      {/* Moon Phase */}
      <div className="bg-purple-50 rounded-xl p-3 mb-4 flex items-center gap-3">
        <span className="text-4xl">{moonPhase.emoji}</span>
        <div>
          <p className="font-bold text-purple-800 text-sm">{moonPhase.name}</p>
          <p className="text-purple-600 text-xs mt-0.5">
            {moonPhase.crabbingBonus
              ? '✨ Bonus! King tides amp up crab movement — great day to go!'
              : 'Moderate crab activity — still worth dropping a trap!'}
          </p>
        </div>
      </div>

      {/* Resources */}
      <div className="mb-4 space-y-2">
        {RESOURCES.map(r => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            {r.label}
            <span className="ml-auto text-sky-400">↗</span>
          </a>
        ))}
      </div>

      {/* Spot cards */}
      {SPOTS.map(spot => (
        <div key={spot.name} className="mb-5">
          <h3 className="font-bold text-orange-700 text-base mb-2">
            {spot.emoji} {spot.name}
          </h3>
          <div className="space-y-2">
            {windows.map((w, i) => (
              <div key={i} className="bg-orange-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    🌟 Best Window
                  </span>
                  <span className="text-xs text-gray-400">Low tide: {w.peak} ({w.height} ft)</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {w.start} → {w.end}
                </p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2 italic">💡 {spot.tip}</p>
        </div>
      ))}
    </div>
  )
}
