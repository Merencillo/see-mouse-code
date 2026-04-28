const KNOWN_NEW_MOON = new Date('2000-01-06T00:00:00Z')
const SYNODIC_PERIOD = 29.53058867

export function getMoonPhase(date = new Date()) {
  const daysSince = (date - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24)
  const phase = ((daysSince % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD

  if (phase < 1.85)  return { name: 'New Moon',        emoji: '🌑', crabbingBonus: true  }
  if (phase < 5.54)  return { name: 'Waxing Crescent', emoji: '🌒', crabbingBonus: false }
  if (phase < 9.22)  return { name: 'First Quarter',   emoji: '🌓', crabbingBonus: false }
  if (phase < 12.91) return { name: 'Waxing Gibbous',  emoji: '🌔', crabbingBonus: true  }
  if (phase < 16.61) return { name: 'Full Moon',        emoji: '🌕', crabbingBonus: true  }
  if (phase < 20.30) return { name: 'Waning Gibbous',  emoji: '🌖', crabbingBonus: true  }
  if (phase < 23.99) return { name: 'Last Quarter',    emoji: '🌗', crabbingBonus: false }
  if (phase < 27.68) return { name: 'Waning Crescent', emoji: '🌘', crabbingBonus: false }
  return               { name: 'New Moon',              emoji: '🌑', crabbingBonus: true  }
}
