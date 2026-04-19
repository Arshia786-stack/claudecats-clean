// Real API client — calls the Express backend at /api/*
// Replace mockApi.js imports with this file when backend is live.
// Claude endpoints (/api/claude/*) are built by James.

// --- Listings (Arshia) ---

export async function fetchAvailableListings() {
  const res = await fetch('/api/listings/available')
  if (!res.ok) throw new Error('Failed to load listings')
  return res.json()
}

export async function addListing(parsedListing) {
  const res = await fetch('/api/listings/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedListing),
  })
  if (!res.ok) throw new Error('Failed to add listing')
  return res.json()
}

export async function reserveListing(listingId, seekerSessionId) {
  const res = await fetch('/api/listings/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId, seekerSessionId }),
  })
  if (!res.ok) throw new Error('Failed to reserve listing')
  return res.json()
}

// --- Points (Arshia) ---

export async function awardPoints(providerName, portions, dietaryFlags = []) {
  const res = await fetch('/api/points/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerName, portions, dietaryFlags }),
  })
  if (!res.ok) throw new Error('Failed to award points')
  return res.json()
}

// --- Sponsor (Arshia) ---

export async function fetchSponsorStats() {
  const res = await fetch('/api/sponsor/stats')
  if (!res.ok) throw new Error('Failed to load stats')
  return res.json()
}

// --- Claude endpoints (James) ---

export async function seekerOnboard(messages) {
  const res = await fetch('/api/claude/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error('Claude onboard failed')
  return res // streaming — caller reads res.body
}

export async function matchSeeker(seekerProfile, listings) {
  const res = await fetch('/api/claude/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seekerProfile, listings }),
  })
  if (!res.ok) throw new Error('Match failed')
  return res.json()
}

export async function parseListing(rawMessage) {
  const res = await fetch('/api/claude/parse-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: rawMessage }),
  })
  if (!res.ok) throw new Error('Parse listing failed')
  return res.json()
}

export async function generateRecipe(foodItems, kitchenType, dietaryRestrictions, culturalPreferences) {
  const res = await fetch('/api/claude/recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foodItems, kitchenType, dietaryRestrictions, culturalPreferences }),
  })
  if (!res.ok) throw new Error('Recipe generation failed')
  return res.json()
}

export async function generateReport(stats) {
  const res = await fetch('/api/claude/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  })
  if (!res.ok) throw new Error('Report generation failed')
  return res.json()
}
