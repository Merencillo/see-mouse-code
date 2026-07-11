import { SPRITES, SPECIES } from '../utils/pixelSprites'

const EYE_WHITE = '#ffffff'
const EYE_PUPIL = '#141414'

// Renders a sprite grid as crisp, scalable SVG pixels.
export default function PixelSprite({ name, size = 40 }) {
  const spec = SPECIES[name]
  if (!spec) return null
  const grid = SPRITES[spec.sprite]
  const palette = { e: EYE_WHITE, k: EYE_PUPIL, ...spec.colors }

  const rows = grid.length
  const cols = Math.max(...grid.map(r => r.length))
  const unit = size / Math.max(rows, cols)

  const pixels = []
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      const fill = palette[ch]
      if (!fill) continue // '.' / spaces / unmapped → transparent
      pixels.push(
        <rect key={`${x}-${y}`} x={x * unit} y={y * unit} width={unit} height={unit} fill={fill} />
      )
    }
  })

  return (
    <svg
      width={cols * unit}
      height={rows * unit}
      viewBox={`0 0 ${cols * unit} ${rows * unit}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={name}
      className="shrink-0"
    >
      {pixels}
    </svg>
  )
}
