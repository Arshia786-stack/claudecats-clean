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
      system: `You are FULL, a dignified food concierge for students. Extract the seeker's needs from their message. ${FORBIDDEN}
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
      system: `You are FULL's matching engine. Match food listings to a seeker's profile.
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
      system: `You are FULL's listing parser. Convert a provider's message into a structured food listing.
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
      system: `You write the most important message in the FULL app — the notification a provider receives after their food reaches someone.
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
      body: `Someone nearby had a real meal because of what you shared. +${pointsEarned} FULL Points today, ${newTotal} total.`,
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
      system: `You write weekly impact reports for FULL sponsors. Stripe dashboard energy — confident, clean, not charity-coded.
${FORBIDDEN}
Return ONLY a JSON object:
{ "summary": "3-4 sentences. Open with a human story, follow with numbers, end with what their support enabled." }`,
      messages: [{
        role: 'user',
        content: `Stats this week: ${JSON.stringify(stats)}`,
      }],
    })

    const report = parseJson(response.content[0].text, {
      summary: `This week, ${stats.totalMeals} meals reached students who needed them. ${stats.totalActiveProviders} community members contributed across ${stats.totalDietaryCategoriesCovered} dietary categories. ${stats.totalPointsAwarded} FULL Points were awarded. Your support made this possible.`,
    })

    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/vision — analyze food photo for nutrition
// Body: { imageBase64, mimeType, description }
router.post('/vision', async (req, res) => {
  const { imageBase64, mimeType, description } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' })
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `Analyze this food photo. Context: "${description || 'food item'}".
Return ONLY valid JSON:
{"calories":450,"protein":28,"carbs":35,"fat":14,"fiber":4,"servingSize":"1 portion","items":["chicken","rice"],"confidence":"high","story":"One warm sentence about this specific food — what it is, where it's from, or why it looks good."}
Be specific to what you see. Estimate per serving.` },
        ],
      }],
    })
    const nutrition = parseJson(response.content[0].text, {
      calories: null, protein: null, carbs: null, fat: null,
      fiber: null, servingSize: '1 portion', items: [], confidence: 'low',
    })
    res.json(nutrition)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/claude/chat — SSE streaming seeker conversation
// Body: { messages: [{ role, content }] }
// Stream: text chunks → meta { done, profile } → end
router.post('/chat', async (req, res) => {
  const { messages } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages required' })

  const userTurns = messages.filter((m) => m.role === 'user').length
  const isDone = userTurns >= 2

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`)

  try {
    const systemPrompt = isDone
      ? `You are FULL, a warm food concierge. The user has given enough info.
Write ONE warm sentence (max 15 words) confirming what you understood and that you're finding options.
Example: "Got it — halal for one, tonight, microwave-friendly. Let me pull what's open near you."
${FORBIDDEN}
Plain text only. No lists. No questions. One sentence.`
      : `You are FULL, a warm food concierge. Ask ONE specific follow-up question about dietary needs, number of people, or timing. Max 18 words.
Example: "Any dietary needs I should know? Halal, vegan, allergies — anything like that."
${FORBIDDEN}
Plain text only. No lists. One question only.`

    const apiMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || '',
    }))

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 120,
      system: systemPrompt,
      messages: apiMessages,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ type: 'text', text: event.delta.text })
      }
    }

    if (isDone) {
      try {
        const profileRes = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 400,
          system: `Extract the food seeker's preferences from this conversation.
${FORBIDDEN}
Return ONLY valid JSON — no markdown:
{"dietary":[],"healthConditions":[],"kitchenType":"any","culturalPreferences":[],"favoriteIngredients":[],"avoid":[],"urgency":"tonight","summary":""}
dietary options: halal, vegan, vegetarian, gluten-free, kosher, nut-free, dairy-free
kitchenType options: "microwave only", "no kitchen", "full kitchen", "any"
urgency options: "tonight", "tomorrow", "flexible"
summary: short label like "halal · tonight · microwave only"`,
          messages: [
            ...apiMessages,
            { role: 'user', content: 'Extract my profile as JSON now.' },
          ],
        })
        const profile = parseJson(profileRes.content[0].text, {
          dietary: [], healthConditions: [], kitchenType: 'any',
          culturalPreferences: [], favoriteIngredients: [], avoid: [],
          urgency: 'tonight', summary: '',
        })
        send({ type: 'meta', done: true, profile })
      } catch {
        send({ type: 'meta', done: true, profile: { dietary: [], urgency: 'tonight', kitchenType: 'any', culturalPreferences: [], favoriteIngredients: [], avoid: [], summary: '' } })
      }
    } else {
      send({ type: 'meta', done: false, profile: null })
    }

    send({ type: 'end' })
    res.end()
  } catch (err) {
    send({ type: 'error', error: err.message })
    res.end()
  }
})

// POST /api/claude/assist — landing chat, streams a response using live listings context
// Body: { message, listings }
// Stream: SSE text chunks → meta { done, matchIds } → end
router.post('/assist', async (req, res) => {
  const { message, listings = [] } = req.body
  if (!message) return res.status(400).json({ error: 'message required' })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`)

  try {
    const listingSummary = listings.slice(0, 12).map(l =>
      `[id:${l.id}] ${l.title} — ${l.providerName} — ${l.pickupWindow || 'today'} — ${l.area || l.pickupLocation} — dietary: ${(l.dietary||[]).join(', ')||'none'} — ${l.portionsLeft} portions left`
    ).join('\n')

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 200,
      system: `You are FULL, a warm and direct food concierge for students near UCLA. You have access to real food listings available right now.

Current listings:
${listingSummary || 'No listings loaded yet.'}

Rules:
- Be warm, specific, and brief (max 3 sentences)
- Mention actual listing names and providers by name
- If dietary needs are mentioned (halal, vegan, etc.) only mention matching options
- End with one concrete action: "Tap [Food Name] to reserve" or "Head to Find Food to see all matches"
- ${FORBIDDEN}`,
      messages: [{ role: 'user', content: message }],
    })

    const matchIds = []

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ type: 'text', text: event.delta.text })
      }
    }

    // Find top matching listing IDs based on message keywords
    const msgLower = message.toLowerCase()
    const dietary = ['halal', 'vegan', 'vegetarian', 'gluten-free', 'kosher'].filter(d => msgLower.includes(d))
    const matched = listings
      .filter(l => {
        if (dietary.length === 0) return true
        return dietary.some(d => l.dietary?.includes(d))
      })
      .slice(0, 3)
      .map(l => l.id)

    send({ type: 'meta', done: true, matchIds: matched.length ? matched : listings.slice(0, 3).map(l => l.id) })
    send({ type: 'end' })
    res.end()
  } catch (err) {
    send({ type: 'error', error: err.message })
    res.end()
  }
})

// Tonight's Pick — Claude selects the listing that needs the most urgent help
router.post('/tonights-pick', async (req, res) => {
  const { listings = [] } = req.body
  if (listings.length === 0) return res.json({ pick: null })

  const summary = listings.map(l =>
    `ID: ${l.id} | "${l.title}" by ${l.providerName} | ${l.portionsLeft ?? l.portions ?? 0} portions left | Dietary: ${(l.dietary || []).join(', ') || 'none'} | Area: ${l.area || 'unknown'} | Story: ${l.story || ''}`
  ).join('\n')

  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 200,
    system: `You are FULL, a community food-sharing platform. ${FORBIDDEN}`,
    messages: [{
      role: 'user',
      content: `Here are the live food listings available tonight:\n${summary}\n\nPick ONE listing that most urgently needs someone to claim it — fewest portions left, most unique, or most socially impactful. Reply with valid JSON only:\n{"listingId": "<id>", "headline": "<5-7 word punchy headline>", "story": "<one warm, specific sentence about why this matters tonight>"}`,
    }],
  })

  try {
    const raw = msg.content[0].text.trim()
    const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    const pick = JSON.parse(json)
    res.json({ pick })
  } catch {
    res.json({ pick: null })
  }
})

export default router
