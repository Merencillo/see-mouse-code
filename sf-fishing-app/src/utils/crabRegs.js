// California recreational crab regulations as they apply around San Francisco.
//
// Checked against CDFW on 2026-11-01 (sources in RESOURCES below). These rules
// move: CDFW adjusts gear rules mid-season for whale entanglement and closes
// areas for domoic acid, so everything here is planning info — the UI always
// links out so you can confirm before you go.

const SATURDAY = 6
const JUNE = 5
const NOVEMBER = 10

// The recreational Dungeness season opens on the first Saturday in November.
function openerFor(year) {
  const nov1 = new Date(year, NOVEMBER, 1)
  return new Date(year, NOVEMBER, 1 + ((SATURDAY - nov1.getDay() + 7) % 7))
}

// San Mateo through Mendocino county line closes June 30 (northern counties
// run to July 30, which is outside the area this app covers).
function closerFor(year) {
  return new Date(year, JUNE, 30, 23, 59, 59)
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000)
}

/**
 * Where the Dungeness season sits on a given date: open and running, or closed
 * with a countdown to the next first-Saturday-in-November opener.
 */
export function getDungenessSeason(date = new Date()) {
  const year = date.getFullYear()
  const thisOpener = openerFor(year)
  const thisCloser = closerFor(year)

  // Before July: still inside the season that opened last November.
  if (date <= thisCloser) {
    return { isOpen: true, opens: openerFor(year - 1), closes: thisCloser, daysUntilOpen: 0 }
  }
  // Summer and fall gap, up to this year's opener.
  if (date < startOfDay(thisOpener)) {
    return {
      isOpen: false,
      opens: thisOpener,
      closes: closerFor(year + 1),
      daysUntilOpen: daysBetween(date, thisOpener),
    }
  }
  return { isOpen: true, opens: thisOpener, closes: closerFor(year + 1), daysUntilOpen: 0 }
}

export function formatSeasonDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Per-species limits. `seasonal` species are gated by getDungenessSeason().
export const CRAB_REGS = {
  dungeness: {
    key: 'dungeness',
    name: 'Dungeness crab',
    bagLimit: 10,
    minSize: '5¾ in',
    seasonal: true,
    season: 'First Saturday in Nov → June 30',
    note: 'Carry a measuring device. Measure the shortest distance across the shell, in front of and excluding the lateral spines.',
  },
  rock: {
    key: 'rock',
    name: 'Rock crab',
    bagLimit: 35,
    minSize: '4 in',
    seasonal: false,
    season: 'Open year-round',
    note: 'Red, yellow, and brown rock crab all count toward the same 35-crab limit.',
  },
}

// Which species are legal to take, by water body. The Golden Gate Bridge is the
// line that matters here: everything inside it is "San Francisco Bay".
export const WATERS = {
  bay: {
    key: 'bay',
    label: 'Inside the Bay',
    emoji: '🌉',
    species: ['rock'],
    short: 'Rock crab only — no Dungeness inside the Bay.',
    // 14 CCR § 29.85
    warning:
      'Dungeness crab may not be taken from — or possessed if taken from — San Francisco or San Pablo bays at any time. Inside the Golden Gate it is rock crab only.',
  },
  ocean: {
    key: 'ocean',
    label: 'Outer coast',
    emoji: '🌊',
    species: ['rock', 'dungeness'],
    short: null,
    warning: null,
  },
}

// CDFW in-season gear restriction for 2026–27. Recreational traps are closed
// coastwide to protect migrating humpback whales from entanglement.
export const GEAR_RULE = {
  headline: 'Crab traps are closed — hoop nets, loop traps, or hands only',
  detail:
    'For 2026–27 CDFW has prohibited recreational crab traps from the Oregon border to Point Conception to cut whale entanglements. Hoop nets, loop traps, and bare hands are still allowed.',
  through: 'at least Jan 1, 2027',
}

export const RESOURCES = [
  {
    label: 'CDFW — in-season crab changes',
    url: 'https://wildlife.ca.gov/Fishing/Ocean/Regulations/Inseason',
  },
  {
    label: 'CDFW — SF Bay regulations',
    url: 'https://wildlife.ca.gov/Fishing/Ocean/Regulations/Fishing-Map/SF-Bay',
  },
  {
    label: 'Domoic acid & shellfish advisories',
    url: 'https://wildlife.ca.gov/Fishing/Ocean/Health-Advisories',
  },
]
