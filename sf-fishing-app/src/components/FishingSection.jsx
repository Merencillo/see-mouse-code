export default function FishingSection({ windows }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
      <h2 className="text-blue-700 font-bold text-lg mb-1">🎣 Best Fishing Times</h2>
      <p className="text-gray-400 text-xs mb-3">Torpedo Wharf · Baker Beach · Crissy Field</p>
      <div className="space-y-3">
        {windows.map((w, i) => (
          <div
            key={i}
            className={`rounded-xl p-3 border-l-4 ${
              w.isFlooding
                ? 'bg-blue-50 border-blue-500'
                : 'bg-sky-50 border-sky-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                w.isFlooding
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-sky-200 text-sky-800'
              }`}>
                {w.rating === 'Excellent' ? '🌟 Excellent' : '👍 Good'}
              </span>
              <span className="text-xs text-gray-400">{w.type}</span>
            </div>
            <p className="font-semibold text-gray-700 text-sm">
              {w.start} → {w.end}
            </p>
            <p className="text-gray-500 text-xs mt-1">💡 {w.tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
