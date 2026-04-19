const LATENCY = { short: 650, medium: 1000 }

const MOCK_MATCHES = [
  {
    id: 'jollof-rice',
    title: 'Homemade Jollof Rice',
    emoji: '🍚',
    score: 9.2,
    tags: ['halal', 'nut-free'],
    portions: 6,
    pickupWindow: 'Tonight · before 8:00 PM',
    distance: '3 min walk',
    location: 'Near Dorm 4',
    microwavable: true,
    prep: 'Microwave 3 to 4 minutes with a loose cover.',
    reasoning:
      'This is halal, filling, and easy to reheat with only a microwave. It also matches the spicy profile often requested for dinner tonight.',
  },
  {
    id: 'lentil-stew',
    title: 'West African Lentil Stew',
    emoji: '🍲',
    score: 8.8,
    tags: ['halal', 'vegan', 'gluten-free'],
    portions: 4,
    pickupWindow: 'Tonight · before 7:30 PM',
    distance: '6 min walk',
    location: 'Wellness Center',
    microwavable: true,
    prep: 'Reheat in a microwave-safe bowl for 2 to 3 minutes.',
    reasoning:
      'The lentil base travels well, fits a halal-friendly request, and works for a quick microwave dinner without extra prep.',
  },
  {
    id: 'biryani',
    title: 'Chicken Biryani',
    emoji: '🍛',
    score: 8.4,
    tags: ['halal'],
    portions: 5,
    pickupWindow: 'Tonight · before 9:00 PM',
    distance: '7 min walk',
    location: 'Graduate Housing',
    microwavable: true,
    prep: 'Best reheated for 2 minutes, then stirred and warmed once more.',
    reasoning:
      'A strong flavor match for someone asking for a hearty dinner, with enough flexibility on pickup time for tonight.',
  },
  {
    id: 'veggie-bowl',
    title: 'Roasted Veggie Rice Bowl',
    emoji: '🥗',
    score: 7.9,
    tags: ['gluten-free'],
    portions: 3,
    pickupWindow: 'Tonight · before 7:00 PM',
    distance: '5 min walk',
    location: 'Student Union',
    microwavable: true,
    prep: 'Microwave for 90 seconds and add sauce after heating.',
    reasoning:
      'This one is lighter, but still practical for a microwave-only setup and quick pickup near campus.',
  },
]

const IMPACT_MESSAGES = {
  jollof: {
    headline: 'Your jollof rice helped a student get dinner tonight.',
    body:
      "The match went to someone looking for a halal meal they could heat in a dorm microwave. They did not need to explain their situation twice or fill out a long form. They just got a warm dinner that felt familiar.",
    metric: '+15 Hearth Hearts · First reward 85 away',
  },
  default: {
    headline: 'Your food reached someone nearby right when they needed it.',
    body:
      'A simple meal turned into a real evening handoff: nearby, dignified, and easy to act on. That is the kind of quiet community infrastructure Hearth is built to support.',
    metric: '+15 Hearth Hearts · Community impact recorded',
  },
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function parseSeekerPrompt(prompt) {
  const lower = prompt.toLowerCase()
  const dietary = []

  if (lower.includes('halal')) dietary.push('halal')
  if (lower.includes('vegan')) dietary.push('vegan')
  if (lower.includes('vegetarian')) dietary.push('vegetarian')
  if (lower.includes('gluten')) dietary.push('gluten-free')
  if (lower.match(/nut.free|no nuts|nut allergy|nut allerg/)) dietary.push('nut-free')

  const urgency = lower.match(/tonight|right now|asap|today|this evening/)
    ? 'Dinner tonight'
    : 'Flexible'
  const kitchen = lower.includes('microwave')
    ? 'Microwave only'
    : lower.match(/no kitchen|no stove/)
      ? 'Minimal kitchen'
      : 'Standard access'
  const timing = lower.match(/before\s+\d|after\s+\d|tonight|this evening/)
    ? 'Tonight'
    : 'Open pickup window'

  return {
    urgency,
    dietary: dietary.length ? dietary.join(', ') : 'No explicit dietary filter',
    kitchen,
    timing,
    tags: [
      urgency,
      dietary[0] || 'General fit',
      kitchen,
      'Nearby pickup',
    ],
  }
}

function rankMatches(parsedIntent) {
  return MOCK_MATCHES.map((match) => {
    let score = match.score

    if (parsedIntent.dietary.includes('halal') && !match.tags.includes('halal')) {
      score -= 0.8
    }
    if (parsedIntent.dietary.includes('nut-free') && !match.tags.includes('nut-free')) {
      score -= 0.6
    }
    if (parsedIntent.kitchen === 'Microwave only' && !match.microwavable) {
      score -= 0.7
    }

    return { ...match, score: score.toFixed(1) }
  }).sort((a, b) => Number(b.score) - Number(a.score))
}

export async function searchSeekerMatches(prompt) {
  await delay(LATENCY.medium)

  if (prompt.toLowerCase().includes('error')) {
    throw new Error('Hearth could not read that request just now. Please try once more.')
  }

  const parsedIntent = parseSeekerPrompt(prompt)
  const matches = rankMatches(parsedIntent).slice(0, 4)
  return { parsedIntent, matches }
}

function parseProviderPrompt(prompt) {
  const lower = prompt.toLowerCase()

  const title = lower.includes('jollof')
    ? 'Homemade Jollof Rice'
    : lower.includes('biryani')
      ? 'Chicken Biryani'
      : lower.includes('stew')
        ? 'Lentil Stew'
        : 'Fresh Meal Listing'

  const emoji = lower.includes('jollof')
    ? '🍚'
    : lower.includes('biryani')
      ? '🍛'
      : lower.includes('stew')
        ? '🍲'
        : '🥘'

  const portionsMatch = prompt.match(/(\d+)\s*(?:portions?|servings?|plates?)/i)
  const pickupMatch = prompt.match(/(?:before|by|until)\s+([^,.]+)/i)
  const locationMatch = prompt.match(/near\s+([^,.]+)/i) || prompt.match(/at\s+([^,.]+)/i)
  const dietary = []

  if (lower.includes('halal')) dietary.push('halal')
  if (lower.includes('vegan')) dietary.push('vegan')
  if (lower.includes('vegetarian')) dietary.push('vegetarian')
  if (lower.includes('nut-free') || lower.includes('no nuts')) dietary.push('nut-free')
  if (lower.includes('dairy-free') || lower.includes('no dairy')) dietary.push('dairy-free')

  const missingInfo = []
  if (!lower.match(/made|fresh|today|tonight|hours? ago/)) {
    missingInfo.push('when the food was prepared')
  }
  if (!lower.match(/nut|dairy|gluten|soy|egg|allergen|none/)) {
    missingInfo.push('allergen notes')
  }

  return {
    title,
    emoji,
    portions: portionsMatch ? Number(portionsMatch[1]) : 4,
    pickupWindow: pickupMatch ? `Pickup ${pickupMatch[0]}` : 'Pickup window not specified',
    location: locationMatch ? locationMatch[0] : 'Campus pickup spot to confirm',
    dietary,
    missingInfo,
    summary: 'Parsed from a plain-language provider message for quick review before publish.',
  }
}

export async function parseProviderListing(prompt) {
  await delay(LATENCY.medium)

  if (prompt.toLowerCase().includes('error')) {
    throw new Error('We could not parse that food listing. Please tighten up the details and try again.')
  }

  return parseProviderPrompt(prompt)
}

export async function generateImpactMessage(listing) {
  await delay(LATENCY.short)

  if ((listing?.title || '').toLowerCase().includes('jollof')) {
    return IMPACT_MESSAGES.jollof
  }

  return IMPACT_MESSAGES.default
}
