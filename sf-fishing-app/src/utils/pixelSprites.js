// Pixel-art sprite grids. Every row in a grid is the same width. Characters
// map to palette keys supplied per species:
//   '1' body   '3' detail (fins / stripes / spots)   'e' eye white
//   'k' eye pupil (fixed dark)   '.' transparent
export const SPRITES = {
  // Generic fish — head right, small tail left, eye near the head.
  fish: [
    '....1111......',
    '..1111111111..',
    '.1111111111ee1',
    '3111111111ekk1',
    '33111111111111',
    '3111111111111.',
    '..1111111111..',
    '....1111......',
  ],

  // Striped bass — two horizontal dark stripes along the body.
  fishStriped: [
    '....1111......',
    '..1111111111..',
    '.3333333333ee1',
    '3111111111ekk1',
    '33111111111111',
    '3333333333333.',
    '..1111111111..',
    '....1111......',
  ],

  // Rockfish — spiny dorsal ridge above a deep body.
  rockfish: [
    '....3.3.3.....',
    '....11111.....',
    '..1111111111..',
    '.1111111111ee1',
    '3111111111ekk1',
    '33111111111111',
    '3111111111111.',
    '..1111111111..',
    '....11111.....',
  ],

  // Shark — torpedo body, dorsal fin, forked tail left, faint spots.
  shark: [
    '..........111...',
    '1.........11111.',
    '11.....111111111',
    '.111311131111e11',
    '1111111111111ek1',
    '11.....111111111',
    '1.........11111.',
    '..........111...',
  ],

  // Bat ray — kite/diamond body with eyes on top and a tail spike.
  ray: [
    '......111......',
    '....1k111k1....',
    '..11111111111..',
    '111111111111111',
    '..11111111111..',
    '....1111111....',
    '......111......',
    '.......3.......',
  ],

  // Crab — claws up top, shell with eyes, legs splaying below.
  crab: [
    '.3.........3.',
    '33.........33',
    '.33.......33.',
    '..11k111k11..',
    '.11111111111.',
    '3.111111111.3',
    '.3.1111111.3.',
    '..3.11111.3..',
    '...3.....3...',
  ],
}

// Species catalog: which sprite + palette to draw for each catch.
// Colors are chosen to keep species visually distinct.
export const SPECIES = {
  'Striped Bass':       { sprite: 'fishStriped', colors: { 1: '#b9c6cf', 3: '#38495a' } },
  'California Halibut':  { sprite: 'fish',        colors: { 1: '#7d6c52', 3: '#463b2c' } },
  'Dungeness Crab':      { sprite: 'crab',        colors: { 1: '#d5743a', 3: '#a1512a' } },
  'Jacksmelt':           { sprite: 'fish',        colors: { 1: '#aeb9c2', 3: '#6b7680' } },
  'White Croaker':       { sprite: 'fish',        colors: { 1: '#d9dee3', 3: '#9aa4ac' } },
  'Barred Surfperch':    { sprite: 'fish',        colors: { 1: '#c6bb9c', 3: '#7a6f52' } },
  'Leopard Shark':       { sprite: 'shark',       colors: { 1: '#8b9096', 3: '#3d4247' } },
  'Walleye Surfperch':   { sprite: 'fish',        colors: { 1: '#b7c0c8', 3: '#5a636b' } },
  'Shiner Perch':        { sprite: 'fish',        colors: { 1: '#9fb0bd', 3: '#5f7080' } },
  'Rock Crab':           { sprite: 'crab',        colors: { 1: '#b34733', 3: '#7e2f22' } },
  'Bat Ray':             { sprite: 'ray',         colors: { 1: '#4a4038', 3: '#241f19' } },
  'Rockfish':            { sprite: 'rockfish',    colors: { 1: '#c0432f', 3: '#7d2418' } },
  'Pileperch':           { sprite: 'fish',        colors: { 1: '#6f7a82', 3: '#454d53' } },
}

// Common catches grouped by location.
export const CATCHES = [
  { location: 'Torpedo Wharf', species: ['Striped Bass', 'California Halibut', 'Jacksmelt', 'White Croaker'] },
  { location: 'Baker Beach', species: ['Barred Surfperch', 'Striped Bass', 'Dungeness Crab', 'Leopard Shark', 'Jacksmelt'] },
  { location: 'Crissy Field', species: ['Walleye Surfperch', 'Jacksmelt', 'Striped Bass', 'California Halibut'] },
  { location: 'Clipper Cove Beach', species: ['Shiner Perch', 'Jacksmelt', 'Rock Crab', 'Bat Ray'] },
  { location: 'Bimla Rhinehart Vista Point', species: ['Striped Bass', 'Rockfish', 'Pileperch', 'Jacksmelt'] },
]
