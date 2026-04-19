import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-6'
const FORBIDDEN = 'Never use the words: food bank, charity, donation, welfare, handout, or recipient.'

function parseJson(text, fallback) {
  try {
    return JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim())
  } catch {
    return fallback
  }
}

// POST /api/claude/onboard
// Body: { messages: [{ role, content }] }
// Returns: { profile }
router.post('/onboard', async (req, res) => {
  const { messages } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages required' })

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `You are Hearth, a dignified food concierge for students. Extract the seeker's needs from their message. ${FORBIDDEN}
Return ONLY a JSON object:
{
  "dietary": [],          // halal, vegan, vegetarian, gluten-free, kosher, nut-free, dairy-free
  "healthConditions": [], // diabetic, etc.
  "kitchenType": "any",   // "microwave only" | "no kitchen" | "full kitchen" | "any"
  "culturalPreferences": [],
  "favoriteIngredients": [],
  "avoid": [],
  "urgency": "flexible",  // "tonight" | "tomorrow" | "flexible"
  "summary": ""           // e.g. "halal · tonight · microwave only"
}`,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const profile = parseJson(response.content[0].text, {
      dietary: [], healthConditions: [], kitchenType: 'any',
      culturalPreferences: [], favoriteIngredients: [], avoid: [],
      urgency: 'flexible', summary: '',
    })

    res.json({ profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/match
// Body: { seekerProfile, listings }
// Returns: ranked array of matches merged with listing data
router.post('/match', async (req, res) => {
  const { seekerProfile, listings } = req.body
  if (!seekerProfile || !listings) return res.status(400).json({ error: 'seekerProfile and listings required' })

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: `You are Hearth's matching engine. Match food listings to a seeker's profile.
ABSOLUTE RULES — never break:
- Seeker is halal → exclude ALL non-halal listings
- Seeker is vegan → exclude ALL non-vegan listings
- Seeker has allergy X → exclude any listing with allergen X
- Dietary restrictions are hard exclusions, not soft preferences
${FORBIDDEN}
Return ONLY a JSON array of up to 4 best matches:
[{ "listingId": "1", "reasoning": "one specific sentence", "compatibilityScore": 0.95, "warnings": [] }]
Order by compatibilityScore descending. Reasoning must be specific to this person (mention dietary match, microwavable if needed, pickup timing).`,
      messages: [{
        role: 'user',
        content: `Seeker: ${JSON.stringify(seekerProfile)}

Listings: ${JSON.stringify(listings.map((l) => ({
  id: l.id, title: l.title, dietary: l.dietary, allergens: l.allergens,
  microwavable: l.microwavable, pickupWindow: l.pickupWindow,
  portionsLeft: l.portionsLeft, area: l.area, cuisine: l.cuisine,
})))}

Return the top matches as a JSON array.`,
      }],
    })

    const ranked = parseJson(response.content[0].text, [])

    const matches = ranked
      .map((r) => {
        const listing = listings.find((l) => l.id === r.listingId)
        if (!listing) return null
        return { ...listing, reasoning: r.reasoning, compatibilityScore: r.compatibilityScore, warnings: r.warnings || [] }
      })
      .filter(Boolean)

    res.json(matches)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/parse-listing
// Body: { message }
// Returns: structured listing object
router.post('/parse-listing', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'message required' })

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `You are Hearth's listing parser. Convert a provider's message into a structured food listing.
${FORBIDDEN}
Return ONLY a JSON object:
{
  "title": "Jollof Rice",
  "emoji": "🍛",
  "foodItems": ["jollof rice", "chicken"],
  "portions": 8,
  "dietary": ["halal"],
  "allergens": [],
  "pickupLocation": "near Dorm 4",
  "pickupWindow": "before 8pm",
  "pickupDeadline": "before 8pm",
  "prepDate": "Today",
  "providerName": "Anonymous",
  "description": "one sentence",
  "microwavable": true,
  "cuisine": "West African",
  "safetyPassed": true,
  "clarificationQuestion": null,
  "missingFields": []
}
missingFields should list any of: "allergen info", "prep date", "pickup location", "portions" that are unclear.`,
      messages: [{ role: 'user', content: message }],
    })

    const parsed = parseJson(response.content[0].text, {
      title: 'Food', emoji: '🍽️', foodItems: [], portions: null,
      dietary: [], allergens: [], pickupLocation: null, pickupWindow: null,
      pickupDeadline: null, prepDate: 'Today', providerName: 'Anonymous',
      description: '', microwavable: true, cuisine: 'Homemade',
      safetyPassed: true, clarificationQuestion: null,
      missingFields: ['allergen info', 'prep date'],
    })

    res.json(parsed)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/recipe
// Body: { foodItems, kitchenType, dietaryRestrictions, culturalPreferences }
// Returns: recipe object
router.post('/recipe', async (req, res) => {
  const { foodItems, kitchenType, dietaryRestrictions, culturalPreferences } = req.body
  if (!foodItems?.length) return res.status(400).json({ error: 'foodItems required' })

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `You are a warm, practical cook. Create recipes ONLY from what's available — never invent ingredients.
Allowed extras: salt, pepper, oil, water.
Adapt to kitchen type. ${FORBIDDEN}
Return ONLY a JSON object:
{
  "name": "recipe name",
  "tagline": "one warm sentence",
  "cookTime": "5 minutes microwave",
  "steps": ["Step 1...", "Step 2..."],
  "nutritionNote": null,
  "culturalNote": null
}`,
      messages: [{
        role: 'user',
        content: `Food: ${foodItems.join(', ')}
Kitchen: ${kitchenType || 'microwave only'}
Dietary: ${dietaryRestrictions?.join(', ') || 'none'}
Cultural: ${culturalPreferences?.join(', ') || 'none'}`,
      }],
    })

    const recipe = parseJson(response.content[0].text, {
      name: 'Simple Meal', tagline: 'Ready in minutes.',
      cookTime: '5 minutes', steps: ['Heat and enjoy.'],
      nutritionNote: null, culturalNote: null,
    })

    res.json(recipe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/notify
// Body: { foodDescription, providerName, portions, pointsEarned, newTotal }
// Returns: { headline, body }
router.post('/notify', async (req, res) => {
  const { foodDescription, providerName, portions, pointsEarned, newTotal } = req.body
  if (!providerName) return res.status(400).json({ error: 'providerName required' })

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: `You write the most important message in the Hearth app — the notification a provider receives after their food reaches someone.
Rules:
- Under 70 words total
- Use the provider's actual name and food name
- Describe impact without revealing seeker details
- Mention points earned and next milestone
- Make it land emotionally when read aloud in a room
${FORBIDDEN}
Return ONLY a JSON object:
{ "headline": "punchy line 10-15 words", "body": "2-3 sentences, warm and specific" }`,
      messages: [{
        role: 'user',
        content: `Provider: ${providerName}
Food: ${foodDescription}
Portions shared: ${portions}
Points earned: ${pointsEarned}
New total: ${newTotal}`,
      }],
    })

    const notification = parseJson(response.content[0].text, {
      headline: `${providerName}, your ${foodDescription} reached your community tonight.`,
      body: `Someone nearby had a real meal because of what you shared. +${pointsEarned} Hearth Points today, ${newTotal} total.`,
    })

    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/report
// Body: stats object (totalMeals, totalActiveProviders, etc.)
// Returns: { summary }
router.post('/report', async (req, res) => {
  const stats = req.body

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: `You write weekly impact reports for Hearth sponsors. Stripe dashboard energy — confident, clean, not charity-coded.
${FORBIDDEN}
Return ONLY a JSON object:
{ "summary": "3-4 sentences. Open with a human story, follow with numbers, end with what their support enabled." }`,
      messages: [{
        role: 'user',
        content: `Stats this week: ${JSON.stringify(stats)}`,
      }],
    })

    const report = parseJson(response.content[0].text, {
      summary: `This week, ${stats.totalMeals} meals reached students who needed them. ${stats.totalActiveProviders} community members contributed across ${stats.totalDietaryCategoriesCovered} dietary categories. ${stats.totalPointsAwarded} Hearth Points were awarded. Your support made this possible.`,
    })

    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
