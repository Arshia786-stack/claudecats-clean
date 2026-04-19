import { mockListings, impactMessageTemplates } from './mockData'

const LATENCY = { short: 900, medium: 1300, long: 1600 }

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// --- Seeker ---

function parseIntent(prompt) {
  const lower = prompt.toLowerCase()

  const dietary = []
  if (lower.includes('halal')) dietary.push('halal')
  if (lower.includes('vegan') || lower.includes('plant-based')) dietary.push('vegan')
  if (lower.includes('vegetarian') && !lower.includes('vegan')) dietary.push('vegetarian')
  if (lower.includes('gluten')) dietary.push('gluten-free')
  if (lower.match(/nut.free|no nuts|nut allerg/)) dietary.push('nut-free')

  let urgency = 'flexible'
  if (lower.match(/tonight|today|now|asap|right now|hungry/)) urgency = 'tonight'
  if (lower.includes('tomorrow')) urgency = 'tomorrow'

  let kitchen = 'any'
  if (lower.includes('microwave')) kitchen = 'microwave only'
  if (lower.match(/no kitchen|no stove/)) kitchen = 'no kitchen'
  if (lower.match(/full kitchen|stove|oven/)) kitchen = 'full kitchen'

  const summary = [
    dietary.length ? dietary.join(', ') : null,
    urgency !== 'flexible' ? urgency : null,
    kitchen !== 'any' ? kitchen : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return { dietary, urgency, kitchen, summary }
}

function buildReasoning(listing, intent) {
  const parts = []

  if (intent.dietary.length) {
    const matched = intent.dietary.filter((d) => listing.dietary.includes(d))
    if (matched.length) parts.push(`${matched.join(' and ')} certified`)
  }

  if ((intent.kitchen === 'microwave only' || intent.kitchen === 'no kitchen') && listing.microwavable) {
    parts.push('reheats well in a microwave')
  }

  if (intent.urgency === 'tonight' && listing.pickupWindowEnd >= 18) {
    parts.push(`available ${listing.pickupWindow.toLowerCase()}`)
  }

  if (listing.portionsLeft >= 3) parts.push(`${listing.portionsLeft} portions still available`)

  return parts.length
    ? parts.join(', ').replace(/^./, (c) => c.toUpperCase())
    : `${listing.portions} portions, ${listing.distance} from you`
}

function scoreListings(intent) {
  return mockListings
    .map((listing) => {
      let score = 0.4

      if (intent.dietary.length) {
        const hits = intent.dietary.filter((d) => listing.dietary.includes(d))
        score += hits.length ? 0.45 : -0.25
      }

      if (intent.kitchen === 'microwave only' || intent.kitchen === 'no kitchen') {
        score += listing.microwavable ? 0.2 : -0.15
      }

      if (intent.urgency === 'tonight') {
        score += listing.pickupWindowEnd >= 18 ? 0.1 : -0.05
      }

      return { ...listing, score, reasoning: buildReasoning(listing, intent) }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

export async function seekerSearch(prompt) {
  await delay(LATENCY.medium)

  if (prompt.toLowerCase().includes('error')) {
    throw new Error('Unable to connect to the coordination network. Please try again.')
  }

  const intent = parseIntent(prompt)
  const matches = scoreListings(intent)
  return { intent, matches }
}

// --- Provider ---

function parseListing(prompt) {
  const lower = prompt.toLowerCase()

  // Title extraction
  let title = 'Food'
  const foods = [
    ['jollof', 'Jollof Rice'],
    ['biryani', 'Biryani'],
    ['rice', 'Rice'],
    ['soup', 'Soup'],
    ['pasta', 'Pasta'],
    ['salad', 'Salad'],
    ['pizza', 'Pizza'],
    ['tacos', 'Tacos'],
    ['wraps', 'Wraps'],
    ['sandwich', 'Sandwiches'],
    ['noodles', 'Noodles'],
    ['chili', 'Chili'],
    ['bread', 'Bread'],
    ['curry', 'Curry'],
    ['stew', 'Stew'],
  ]
  for (const [kw, label] of foods) {
    if (lower.includes(kw)) { title = label; break }
  }

  // Portions
  const portionMatch = prompt.match(/(\d+)\s*(?:portions?|servings?|bowls?|plates?|pieces?|people)?/i)
  const portions = portionMatch ? parseInt(portionMatch[1]) : null

  // Pickup deadline
  const timeMatch = prompt.match(
    /(?:before|by|until)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
  )
  const pickupDeadline = timeMatch ? timeMatch[0] : null

  // Location
  const locMatch =
    prompt.match(/near\s+([^,\.]+)/i) ||
    prompt.match(/at\s+([^,\.]+)/i) ||
    prompt.match(/(?:dorm|building|hall|center|quad)\s*\d*/i)
  const location = locMatch ? locMatch[0].trim() : null

  // Dietary
  const dietary = []
  if (lower.includes('halal')) dietary.push('halal')
  if (lower.includes('vegan')) dietary.push('vegan')
  if (lower.includes('vegetarian')) dietary.push('vegetarian')
  if (lower.match(/gluten.free/)) dietary.push('gluten-free')

  // Safety gaps
  const missingFields = []
  if (!lower.match(/allerg|dairy|gluten|nut|soy|egg|fish|shellfish|none/)) {
    missingFields.push('allergen info')
  }
  if (!lower.match(/made (today|fresh|this morning|tonight)|prep date/)) {
    missingFields.push('prep date')
  }

  return { title, portions, pickupDeadline, location, dietary, missingFields }
}

export async function submitProvider(prompt) {
  await delay(LATENCY.medium)

  if (prompt.toLowerCase().includes('error')) {
    throw new Error('Unable to parse listing. Please try again.')
  }

  return parseListing(prompt)
}

// --- Impact message ---

export async function generateImpactMessage(listing) {
  await delay(LATENCY.short)

  const titleLower = (listing?.title || '').toLowerCase()

  if (titleLower.includes('jollof') || titleLower.includes('rice')) {
    return impactMessageTemplates.rice
  }
  if (titleLower.includes('biryani') || titleLower.includes('curry')) {
    return impactMessageTemplates.biryani
  }
  if (titleLower.includes('soup') || titleLower.includes('stew')) {
    return impactMessageTemplates.soup
  }
  return impactMessageTemplates.default
}
