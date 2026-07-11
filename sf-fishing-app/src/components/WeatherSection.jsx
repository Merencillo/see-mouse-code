import { windVerdict } from '../utils/weatherUtils'

const TONE_STYLES = {
  good: 'bg-green-100 text-green-800',
  ok: 'bg-yellow-100 text-yellow-800',
  warn: 'bg-orange-100 text-orange-800',
  bad: 'bg-red-100 text-red-800',
}

function LocationCard({ name, covers, data }) {
  const verdict = windVerdict(data.windSpeed)

  return (
    <div className="bg-sky-50 rounded-xl p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-sky-800 text-base">📍 {name}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TONE_STYLES[verdict.tone]}`}>
          {verdict.label}
        </span>
      </div>
      <p className="text-gray-400 text-xs mb-2">{covers}</p>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{data.emoji}</span>
        <div className="text-sm text-gray-700">
          <p className="font-semibold">
            {data.temp}°F · {data.label}
          </p>
          <p className="text-gray-500 text-xs">Feels like {data.feelsLike}°F</p>
        </div>
        <div className="ml-auto text-right text-sm text-gray-700">
          <p className="font-semibold">💨 {data.windSpeed} mph {data.windDir}</p>
          <p className="text-gray-500 text-xs">Gusts {data.windGusts} mph</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs mt-2 italic">💡 {verdict.tip}</p>

      {data.outlook.length > 0 && (
        <div className="flex justify-between mt-3 pt-3 border-t border-sky-100">
          {data.outlook.map(h => (
            <div key={h.time} className="text-center">
              <p className="text-gray-400 text-xs">{h.time}</p>
              <p className="text-xl leading-tight">{h.emoji}</p>
              <p className="text-gray-600 text-xs font-semibold">{h.temp}°</p>
              <p className="text-sky-600 text-xs">{h.wind}mph</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WeatherSection({ reports }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
      <h2 className="text-cyan-700 font-bold text-lg mb-3">🌬️ Wind &amp; Weather</h2>
      <div className="space-y-3">
        {reports.map(r => (
          <LocationCard key={r.id} name={r.name} covers={r.covers} data={r.data} />
        ))}
      </div>
    </div>
  )
}
