function StationSlack({ name, id, covers, windows }) {
  return (
    <div className="bg-sky-50 rounded-xl p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-sky-800 text-base">📍 {name}</h3>
        <span className="text-gray-400 text-xs">🌊 {id}</span>
      </div>
      <p className="text-gray-400 text-xs mb-2">{covers}</p>
      <div className="space-y-2">
        {windows.map((w, i) => (
          <div
            key={i}
            className={`rounded-xl p-3 ${w.isFlooding ? 'bg-green-50' : 'bg-orange-50'}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                w.isFlooding
                  ? 'bg-green-200 text-green-800'
                  : 'bg-orange-200 text-orange-800'
              }`}>
                {w.isFlooding ? '🟢 Flooding' : '🟠 Ebbing'} · {w.direction}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span>🕐 {w.start}</span>
              <span className="text-gray-400">→</span>
              <span>🕐 {w.end}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SlackWindows({ reports }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
      <h2 className="text-blue-700 font-bold text-lg mb-1">⚓ Slack Tide Windows</h2>
      <p className="text-gray-400 text-xs mb-3">Minimal current — ideal for all water activities</p>
      <div className="space-y-3">
        {reports.map(r => (
          <StationSlack key={r.key} name={r.name} id={r.id} covers={r.covers} windows={r.windows} />
        ))}
      </div>
    </div>
  )
}
