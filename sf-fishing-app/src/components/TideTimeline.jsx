import { formatTime } from '../utils/tideUtils'

export default function TideTimeline({ predictions }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
      <h2 className="text-blue-700 font-bold text-lg mb-3">🌊 Today's Tides</h2>
      <div className="space-y-2">
        {predictions.map((p, i) => (
          <div key={i} className="flex items-center justify-between bg-sky-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{p.type === 'H' ? '🔵' : '⚪'}</span>
              <span className="font-semibold text-gray-700">
                {p.type === 'H' ? 'High' : 'Low'}
              </span>
            </div>
            <span className="text-gray-500 text-sm">{formatTime(p.t)}</span>
            <span className="font-mono text-sm font-semibold text-blue-600 w-16 text-right">
              {parseFloat(p.v).toFixed(1)} ft
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
