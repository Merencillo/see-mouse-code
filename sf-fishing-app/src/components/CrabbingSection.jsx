import { TIDE_STATIONS } from '../utils/tideUtils'
import {
  CRAB_REGS,
  WATERS,
  GEAR_RULE,
  RESOURCES,
  getDungenessSeason,
  formatSeasonDate,
} from '../utils/crabRegs'

// Crabbing spots. `water` decides what's legal to keep: inside the Golden Gate
// is rock crab only, outer coast adds Dungeness when the season is open.
const SPOTS = [
  {
    name: 'Torpedo Wharf',
    stationKey: 'goldengate',
    water: 'bay',
    tip: 'High pier rail — a hoop net on a long line beats a snare here. Crabs stack around the pilings; fish the hour either side of the low.',
  },
  {
    name: 'Baker Beach',
    stationKey: 'goldengate',
    water: 'ocean',
    tip: 'Outside the bridge, so Dungeness counts here in season. Snares cast off the sand do well on a minus tide — work the troughs.',
  },
  {
    name: 'Clipper Cove Beach',
    stationKey: 'yerbabuena',
    water: 'bay',
    tip: 'Sheltered, shallow cove between Treasure and Yerba Buena. Wade out at low water and work the rocky YBI side for red rock crab.',
  },
  {
    name: 'Fort Baker · Horseshoe Bay',
    stationKey: 'sausalito',
    water: 'bay',
    tip: 'Calm water under the north tower, with a fishing pier and a launch ramp. Drop a hoop net off the pier and check it every 15 minutes.',
  },
  {
    name: 'Ocean Beach',
    stationKey: 'oceanbeach',
    water: 'ocean',
    tip: 'Outer coast, so Dungeness counts in season. Cast snares from the sand on a big minus tide — and keep your back to the water: sneaker waves and rips here are no joke.',
  },
  {
    name: 'Oyster Point Pier',
    stationKey: 'oysterpoint',
    water: 'bay',
    tip: 'Easy South Bay access with parking at the pier. Rock crab only; the ebb draining into the channel is the window to fish.',
  },
]

const TONES = {
  prime: { chip: 'bg-amber-200 text-amber-900', card: 'bg-amber-50 border-amber-400' },
  good: { chip: 'bg-orange-200 text-orange-800', card: 'bg-orange-50 border-orange-300' },
  fair: { chip: 'bg-gray-200 text-gray-600', card: 'bg-gray-50 border-gray-300' },
}

function SeasonBanner({ season }) {
  if (season.isOpen) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
        <p className="font-bold text-green-800 text-sm">✅ Dungeness season is open</p>
        <p className="text-green-700 text-xs mt-0.5">
          Runs through {formatSeasonDate(season.closes)} — but only outside the Bay.
        </p>
      </div>
    )
  }
  const days = season.daysUntilOpen
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
      <p className="font-bold text-amber-900 text-sm">
        ⏳ Dungeness opens {formatSeasonDate(season.opens)}
      </p>
      <p className="text-amber-800 text-xs mt-0.5">
        {days === 0 ? 'Opens today!' : days === 1 ? '1 day to go.' : `${days} days to go.`}{' '}
        Rock crab is open year-round in the meantime.
      </p>
    </div>
  )
}

function LimitsCard({ season }) {
  return (
    <div className="bg-sky-50 rounded-xl p-3 mb-3">
      <p className="font-bold text-sky-900 text-sm mb-2">📏 Size & bag limits</p>
      <div className="space-y-2">
        {Object.values(CRAB_REGS).map(reg => {
          const shut = reg.seasonal && !season.isOpen
          return (
            <div key={reg.key} className="bg-white rounded-lg px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-semibold text-sm ${shut ? 'text-gray-400' : 'text-sky-800'}`}>
                  🦀 {reg.name}
                </span>
                <span className={`text-xs font-bold ${shut ? 'text-gray-400' : 'text-sky-700'}`}>
                  {shut ? 'Closed now' : `${reg.minSize} · ${reg.bagLimit}/day`}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{reg.season}</p>
              <p className="text-gray-500 text-xs mt-1">{reg.note}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Window({ w, showReasons }) {
  const tone = TONES[w.tone]
  return (
    <div className={`rounded-xl p-3 border-l-4 ${tone.card}`}>
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tone.chip}`}>
          {w.isBest ? '🌟 Best today' : w.label} · {w.score}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {w.night ? '🌙 ' : ''}Low {w.peak} ({w.height} ft)
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-700">
        {w.start} → {w.end}
      </p>
      {showReasons && (
        <ul className="mt-1.5 space-y-0.5">
          {w.reasons.map(r => (
            <li key={r} className="text-gray-500 text-xs">
              · {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function CrabbingSection({ windowsByStation, moonPhase, date }) {
  const season = getDungenessSeason(date)

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4 mb-6">
      <h2 className="text-orange-600 font-bold text-lg mb-3">🦀 Best Crabbing Times</h2>

      <SeasonBanner season={season} />

      {/* In-season gear restriction — this one changes the gear you pack. */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
        <p className="font-bold text-red-800 text-sm">🚫 {GEAR_RULE.headline}</p>
        <p className="text-red-700 text-xs mt-0.5">{GEAR_RULE.detail}</p>
        <p className="text-red-500 text-xs mt-1 italic">In effect {GEAR_RULE.through} — re-check before you go.</p>
      </div>

      <LimitsCard season={season} />

      <p className="text-gray-500 text-xs mb-4 px-1">
        ⚠️ {WATERS.bay.warning}
      </p>

      {/* Moon phase */}
      <div className="bg-purple-50 rounded-xl p-3 mb-4 flex items-center gap-3">
        <span className="text-4xl">{moonPhase.emoji}</span>
        <div>
          <p className="font-bold text-purple-800 text-sm">{moonPhase.name}</p>
          <p className="text-purple-600 text-xs mt-0.5">
            {moonPhase.crabbingBonus
              ? '✨ Bigger tidal swings this phase — more crab movement.'
              : 'Moderate tidal range — still worth a soak.'}
          </p>
        </div>
      </div>

      {/* Spot cards */}
      {SPOTS.map(spot => {
        const windows = windowsByStation[spot.stationKey]
        if (!windows?.length) return null

        const station = TIDE_STATIONS[spot.stationKey]
        const water = WATERS[spot.water]
        const keepable = water.species
          .map(k => CRAB_REGS[k])
          .filter(reg => !reg.seasonal || season.isOpen)

        return (
          <div key={spot.name} className="mb-5">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="font-bold text-orange-700 text-base">🦀 {spot.name}</h3>
              <span className="text-gray-400 text-xs whitespace-nowrap">
                🌊 {station.name} · {station.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {water.emoji} {water.label}
              </span>
              {keepable.length ? (
                keepable.map(reg => (
                  <span
                    key={reg.key}
                    className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full"
                  >
                    {reg.name} · {reg.minSize}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Nothing in season
                </span>
              )}
            </div>

            <div className="space-y-2">
              {windows.map((w, i) => (
                <Window key={i} w={w} showReasons={w.isBest || windows.length === 1} />
              ))}
            </div>

            {water.short && (
              <p className="text-red-500 text-xs mt-2">⚠️ {water.short}</p>
            )}
            <p className="text-gray-500 text-xs mt-2 italic">💡 {spot.tip}</p>
          </div>
        )
      })}

      {/* Resources */}
      <div className="space-y-2">
        {RESOURCES.map(r => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            📋 {r.label}
            <span className="ml-auto text-sky-400">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
