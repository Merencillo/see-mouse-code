export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white text-center py-6 px-4 shadow-lg">
      <div className="text-5xl mb-1">🦀</div>
      <h1 className="text-2xl font-bold tracking-wide">SF Tides &amp; Crabbing</h1>
      <p className="text-sky-100 text-sm mt-1">{today}</p>
      <p className="text-sky-200 text-xs mt-0.5">📍 San Francisco Bay</p>
    </header>
  )
}
