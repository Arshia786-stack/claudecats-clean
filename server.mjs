import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(cors());
app.use(express.json());

const claude = new Anthropic();
const MODEL = "claude-sonnet-4-6";

const ONBOARD_SYSTEM = `You're a warm, peer-level friend helping someone figure out what food would actually work for them. You're NOT a food bank, NOT a service, NOT corporate. You're a friend who cooks a lot and wants to connect them with good food nearby.

TONE:
- Casual, specific, contractions, like texting a friend
- NEVER use: "food bank", "charity", "donation", "welfare", "handout", "assistance", "services"
- React naturally — don't fire questions like a form

YOUR GOAL: Gather enough to match them to food in their community. You need:
- dietary_restrictions (halal, kosher, vegan, vegetarian, gluten-free, etc.)
- health_conditions (diabetes, allergies, hypertension, etc.)
- kitchen_type (microwave, hotplate, full kitchen, none)
- cultural_preferences (what food feels like home)
- favorite_ingredients
- avoid (things they dislike or can't have)

APPROACH: ONE question at a time. 3-5 exchanges is usually enough. If they give you a lot upfront, don't re-ask.

WHEN YOU HAVE ENOUGH: Write one warm wrap-up sentence, THEN on a new line output the profile wrapped EXACTLY like this:

<PROFILE_JSON>
{"dietary_restrictions": ["halal"], "health_conditions": ["diabetes"], "kitchen_type": "microwave", "cultural_preferences": ["West African"], "favorite_ingredients": ["rice","lentils"], "avoid": ["high sugar"]}
</PROFILE_JSON>

The user never sees the JSON — the frontend strips those tags. Always use exactly <PROFILE_JSON> and </PROFILE_JSON>. Empty arrays are fine if they didn't mention it. Fill meaningfully from the conversation.`;

const PARSE_LISTING_SYSTEM = `You parse casual messages from community members sharing food with neighbors. Extract structured info AND run a food-safety check.

EXTRACT these fields:
- title: short dish name, max 4 words
- emoji: one emoji matching the main dish
- food_items: array of strings
- portions: integer
- dietary_flags: subset of ["halal","kosher","vegan","vegetarian","gluten-free","dairy-free","nut-free","pork-free"]
- allergens_present: subset of ["nuts","dairy","gluten","soy","shellfish","eggs","fish"] — only include if explicitly mentioned or clearly implied
- pickup_location: string
- pickup_window: string (e.g. "4pm-8pm today")
- prep_date: string (e.g. "today", "2 hours ago")

SAFETY CHECK. Set safety_passed = true ONLY if ALL of these hold:
- Food was prepared within the last 24 hours
- No indication the food was left at room temp for >2 hours
- Nothing in the message suggests the food is questionable

If any of the above is missing or ambiguous, set safety_passed = false AND set clarification_question to a warm, single-sentence follow-up. Otherwise clarification_question = null.

OUTPUT ONLY VALID JSON, no markdown fences, no preamble.`;

const MATCH_SYSTEM = `You're matching food shared by neighbors to people in the community. The dietary filtering is ALREADY DONE in code before you see this — every listing in the input is safe and compliant for this person. Your job is to RANK them and write a one-sentence reason for each that's SPECIFIC to this seeker.

INPUT: a JSON object with "profile" (the seeker) and "listings" (pre-filtered safe listings).

OUTPUT: a JSON array, ranked best-first. Each entry MUST include every field from the original listing PLUS:
- compatibility_score: integer 0-100
- reason: ONE sentence, max 18 words, SPECIFIC to this seeker (reference their culture, favorites, or kitchen when relevant)
- warnings: array of strings, empty unless there's a soft caution to surface

REASON guidelines:
- "Authentic West African dish you can heat up in your microwave" — GOOD (specific)
- "Great match for your preferences" — BAD (generic)
- Never say "perfect for you", "great match", "highly recommended", "ideal"
- Never use words like "food bank", "charity", "donation"

OUTPUT ONLY a valid JSON array, no preamble, no markdown.`;

const RECIPE_SYSTEM = `You help someone about to pick up ALREADY-PREPARED food from a neighbor. Your output is a short guide for how to reheat, plate, pair, or elevate what they're receiving — NEVER a cook-from-scratch recipe.

INPUT: JSON with food_items (these are finished dishes, not raw ingredients), kitchen_type, dietary_restrictions, health_conditions, cultural_preferences.

CONSTRAINTS:
- Assume food_items are fully cooked and just need to be warmed and served.
- Every step must be doable in their kitchen_type. If "microwave", EVERY step is microwave-only (no stove, no oven).
- Steps should cover: reheating safely, optional additions from basic pantry (salt, pepper, oil, water, common spices only — NEVER invent new ingredients), and a small plating/pairing suggestion if natural.
- If diabetes in health_conditions, include a portion/blood-sugar nutrition_note.
- Let cultural_preferences shape the dish name and the finishing touches when natural.
- 4-6 steps total, plain strings, no "Step 1:" prefix.

OUTPUT JSON:
{
  "name": "real dish name — e.g. 'Jollof Rice with Herbs'",
  "tagline": "one short evocative sentence",
  "cook_time": "X min",
  "difficulty": "easy" | "medium" | "hard",
  "steps": ["...", "..."],
  "nutrition_note": "string or null",
  "cultural_note": "string or null"
}

OUTPUT ONLY VALID JSON, no markdown, no preamble.`;

const NOTIFY_SYSTEM = `You write a SHORT notification to a provider after someone in the community picked up the food they shared. Personal, warm, specific to what they actually made.

HARD CONSTRAINTS:
- UNDER 70 WORDS, always
- Mention the actual food by name
- Mention points earned this pickup and current total
- Mention how far they are from the next milestone
- NEVER reveal anything identifying about the seeker (no names, no exact locations, no specific demographics — vague references like "a student" or "someone in the community" are fine)
- NEVER use: "food bank", "charity", "donation", "welfare", "handout", "beneficiary", "recipient"
- Sound like a friend texting them, not a corporate notification

INPUT: JSON with food_description, portions, points_earned, current_points, next_milestone_name, next_milestone_points.

OUTPUT: just the notification text. Plain text only. No JSON, no markdown, no quotes around it.`;

// HARD FILTERS — never delegate these to the prompt
function hardFilter(profile, listings) {
  const restrictions = (profile.dietary_restrictions || []).map(r => r.toLowerCase());
  const conditions = (profile.health_conditions || []).map(h => h.toLowerCase());
  const avoid = (profile.avoid || []).map(a => a.toLowerCase());

  return listings.filter(listing => {
    const flags = (listing.dietary_flags || []).map(f => f.toLowerCase());
    const allergens = (listing.allergens_present || []).map(a => a.toLowerCase());

    if (restrictions.some(r => r.includes("halal")) && !flags.includes("halal")) return false;
    if (restrictions.some(r => r.includes("kosher")) && !flags.includes("kosher")) return false;
    if (restrictions.some(r => r.includes("vegan")) && !flags.includes("vegan")) return false;
    if (restrictions.some(r => r.includes("vegetarian")) && !flags.includes("vegetarian") && !flags.includes("vegan")) return false;
    if ([...restrictions, ...avoid].some(r => r.includes("pork"))
        && !flags.includes("halal") && !flags.includes("pork-free")
        && !flags.includes("vegan") && !flags.includes("vegetarian")) return false;
    if (restrictions.some(r => r.includes("gluten")) && (allergens.includes("gluten") || !flags.includes("gluten-free"))) return false;

    const allergyKeywords = {
      nut: "nuts", peanut: "nuts",
      dairy: "dairy", lactose: "dairy", milk: "dairy",
      gluten: "gluten", wheat: "gluten", celiac: "gluten",
      soy: "soy",
      shellfish: "shellfish", shrimp: "shellfish",
      egg: "eggs",
      fish: "fish",
    };
    for (const condition of conditions) {
      for (const [keyword, allergen] of Object.entries(allergyKeywords)) {
        if (condition.includes(keyword) && allergens.includes(allergen)) return false;
      }
    }

    return true;
  });
}

app.get("/api/health", async (req, res) => {
  try {
    const msg = await claude.messages.create({
      model: MODEL,
      max_tokens: 50,
      messages: [{ role: "user", content: "Say 'Hearth is alive'." }],
    });
    res.json({ ok: true, text: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/claude/onboard", async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: "messages array required" });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const stream = claude.messages.stream({
      model: MODEL, max_tokens: 1024, system: ONBOARD_SYSTEM, messages,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (e) {
    console.error("onboard error:", e);
    if (!res.headersSent) res.status(500).json({ error: e.message });
    else res.end();
  }
});

app.post("/api/claude/parse-listing", async (req, res) => {
  const { message } = req.body;
  if (typeof message !== "string" || !message.trim()) return res.status(400).json({ error: "message string required" });

  try {
    const response = await claude.messages.create({
      model: MODEL, max_tokens: 800, system: PARSE_LISTING_SYSTEM,
      messages: [{ role: "user", content: message }],
    });
    const text = response.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: "no JSON in Claude response", raw: text });
    res.json(JSON.parse(match[0]));
  } catch (e) {
    console.error("parse-listing error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/claude/match", async (req, res) => {
  const { profile, listings } = req.body;
  if (!profile || !Array.isArray(listings)) return res.status(400).json({ error: "profile object and listings array required" });

  const safe = hardFilter(profile, listings);
  if (safe.length === 0) return res.json([]);

  try {
    const response = await claude.messages.create({
      model: MODEL, max_tokens: 1500, system: MATCH_SYSTEM,
      messages: [{ role: "user", content: JSON.stringify({ profile, listings: safe }) }],
    });
    const text = response.content[0].text;
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: "no JSON array in Claude response", raw: text });
    res.json(JSON.parse(match[0]));
  } catch (e) {
    console.error("match error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/claude/recipe", async (req, res) => {
  const { food_items, kitchen_type, dietary_restrictions, health_conditions, cultural_preferences } = req.body;
  if (!Array.isArray(food_items) || food_items.length === 0) {
    return res.status(400).json({ error: "food_items array required" });
  }

  try {
    const response = await claude.messages.create({
      model: MODEL, max_tokens: 1200, system: RECIPE_SYSTEM,
      messages: [{
        role: "user",
        content: JSON.stringify({
          food_items,
          kitchen_type: kitchen_type || "full kitchen",
          dietary_restrictions: dietary_restrictions || [],
          health_conditions: health_conditions || [],
          cultural_preferences: cultural_preferences || [],
        }),
      }],
    });
    const text = response.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: "no JSON in Claude response", raw: text });
    res.json(JSON.parse(match[0]));
  } catch (e) {
    console.error("recipe error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/claude/notify", async (req, res) => {
  const { food_description, portions, points_earned, current_points, next_milestone_name, next_milestone_points } = req.body;
  if (!food_description) return res.status(400).json({ error: "food_description required" });

  try {
    const response = await claude.messages.create({
      model: MODEL, max_tokens: 250, system: NOTIFY_SYSTEM,
      messages: [{
        role: "user",
        content: JSON.stringify({
          food_description,
          portions: portions || 1,
          points_earned: points_earned || 15,
          current_points: current_points || 0,
          next_milestone_name: next_milestone_name || "Community Feast invite",
          next_milestone_points: next_milestone_points || 500,
        }),
      }],
    });
    const text = response.content[0].text.trim();
    res.json({ message: text });
  } catch (e) {
    console.error("notify error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log("API on http://localhost:3001"));
