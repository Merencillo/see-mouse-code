import PixelSprite from './PixelSprite'
import { CATCHES } from '../utils/pixelSprites'

export default function CatchesSection() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
      <h2 className="text-teal-700 font-bold text-lg mb-3">🐟 Common Catches</h2>
      <div className="space-y-3">
        {CATCHES.map(spot => (
          <div key={spot.location} className="bg-sky-50 rounded-xl p-3">
            <h3 className="font-bold text-sky-800 text-base mb-2">📍 {spot.location}</h3>
            <div className="grid grid-cols-2 gap-2">
              {spot.species.map(name => (
                <div key={name} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5">
                  <PixelSprite name={name} size={36} />
                  <span className="text-sm font-semibold text-gray-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
