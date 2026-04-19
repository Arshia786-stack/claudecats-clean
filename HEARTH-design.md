# Hearth — Team Build Plan
**4 people · 6 hours · Ship something real**

---

## Who Does What

| Person | Role | Short version |
|---|---|---|
| **Jason** | Frontend + Project Lead | UI, seeker flow, provider flow, all pages — he's already building |
| **Siddhant** | Frontend Support | Helps Jason, owns sponsor dashboard, map integration |
| **Arshia** | Database + API | Airtable setup, all data routes, food listings CRUD |
| **James** | Claude + Matching | All Claude API prompts, matching logic, notifications, recipe, points |

---

## The Golden Rule for Merging

Backend exposes clean API endpoints. Frontend calls them. Nobody touches the other person's files.

Jason and Siddhant only call these URLs — they never write Claude or Airtable code.
Arshia and James only write API routes and logic — they never touch UI components.

**The contract:** Every API endpoint is agreed on in hour 1. Names, inputs, outputs. Don't change them mid-build without telling everyone.

---

## Hour 1 — Everyone Together (30 mins max)

One person shares screen. Do this together.

- Create the Next.js project
- Set up the folder structure
- Add all environment variables to `.env.local`
- Arshia creates the Airtable base and shares the API key
- James confirms Claude API key works
- Agree on every API endpoint name (list is below)
- Everyone pulls the same repo and branches

**After hour 1, split and don't block each other.**

---

## The API Endpoints — Agreed in Hour 1, Never Change

These are the URLs Jason calls from the frontend. Backend builds them. Names are final.

| Endpoint | Method | Who builds it | What it does |
|---|---|---|---|
| `/api/claude/onboard` | POST | James | Streaming seeker chat |
| `/api/claude/parse-listing` | POST | James | Parses provider message |
| `/api/claude/match` | POST | James | Matches profile to listings |
| `/api/claude/recipe` | POST | James | Generates recipe from pickup items |
| `/api/claude/notify` | POST | James | Writes provider notification |
| `/api/listings/create` | POST | Arshia | Saves a new listing to Airtable |
| `/api/listings/available` | GET | Arshia | Returns all available food listings |
| `/api/listings/reserve` | POST | Arshia | Marks a listing as reserved |
| `/api/providers/get` | GET | Arshia | Gets provider profile + points |
| `/api/providers/create` | POST | Arshia | Creates new provider |
| `/api/matches/create` | POST | Arshia | Records a seeker-listing match |
| `/api/matches/complete` | POST | Arshia | Marks match as done, triggers points |
| `/api/sponsor/stats` | GET | Arshia | Returns aggregate impact numbers |

---

## What Each Endpoint Receives and Returns

Jason needs to know exactly what to send and what comes back. This is the contract.

---

### `/api/claude/onboard` — James
**Receives:** Array of conversation messages so far (role + content each)
**Returns:** Streaming text response. When profile is complete, stream includes a JSON block at the end with dietary restrictions, health conditions, kitchen type, cultural preferences, favorite ingredients, avoid list.
**Note:** Frontend parses the JSON silently when detected. Never shows raw JSON to user.

---

### `/api/claude/parse-listing` — James
**Receives:** One string — the raw message the provider typed
**Returns:** JSON with food items, portions, dietary flags, allergens present, pickup location, pickup window, prep date, whether it passed safety check, and if not — a clarification question to show the provider.
**Note:** If safety check fails, frontend shows the clarification question and does not save to Airtable yet.

---

### `/api/claude/match` — James
**Receives:** Seeker profile JSON + array of available listings from Airtable
**Returns:** Ranked array of matches. Each match has listing ID, title, emoji, pickup info, a one-sentence reason why it fits this specific person, compatibility score, and any allergy warnings.
**Note:** Hard filters are applied server-side. Halal seekers never see non-halal listings. Allergies are absolute exclusions.

---

### `/api/claude/recipe` — James
**Receives:** List of food items from pickup, kitchen type (microwave/hotplate/full), dietary restrictions, cultural preferences
**Returns:** Recipe name, tagline, cook time, difficulty, steps as array, optional nutrition note if health condition present, optional cultural note.

---

### `/api/claude/notify` — James
**Receives:** Food description, portion count, provider's current points total, points earned this pickup
**Returns:** One notification message under 70 words. Personal, warm, specific to the food provided. Mentions points earned and next milestone.

---

### `/api/listings/available` — Arshia
**Receives:** Nothing (optional: lat/lng for future location filter)
**Returns:** Array of all listings where status is available and safety passed. Each listing includes ID, title, emoji, food items, portions, dietary flags, allergens present, pickup location, pickup window, provider contact, provider ID.

---

### `/api/listings/create` — Arshia
**Receives:** Parsed listing object from Claude (everything from parse-listing response plus provider name and contact)
**Returns:** New listing ID and success confirmation.

---

### `/api/listings/reserve` — Arshia
**Receives:** Listing ID, seeker session ID
**Returns:** Success confirmation. Updates listing status to reserved in Airtable.

---

### `/api/providers/create` — Arshia
**Receives:** Provider name and contact number
**Returns:** Provider ID. If provider already exists with that contact, returns existing ID instead of creating duplicate.

---

### `/api/providers/get` — Arshia
**Receives:** Provider ID as query param
**Returns:** Provider name, current points total, badge level, total portions shared, array of recent notifications (Claude-written, stored as array), and next milestone name and threshold.

---

### `/api/matches/create` — Arshia
**Receives:** Seeker session ID, listing ID
**Returns:** Match ID and confirmation.

---

### `/api/matches/complete` — Arshia
**Receives:** Match ID, listing ID, provider ID, food description, portions
**Returns:** Success. Internally: marks match as completed, calls James's notify endpoint, awards points to provider, saves notification to provider's record.

---

### `/api/sponsor/stats` — Arshia
**Receives:** Nothing
**Returns:** Total meals served, total active providers, total dietary categories covered, total points awarded, total points redeemed, and a short array of recent milestones for the dashboard feed.

---

## JAMES — Claude + Intelligence Layer

You own everything Claude does. 5 prompts, all of them matter.

**Hours 1–2:** Set up Claude client, build onboard and parse-listing routes. Test both locally before moving on.

**Hours 3–4:** Build match route (this is the hardest one — hard filters must be bulletproof), then recipe and notify.

**Hour 5:** Connect with Arshia — make sure matches/complete calls notify correctly. End-to-end test the full seeker flow.

**Hour 6:** Polish prompts based on actual outputs. Make the notification sound human. Run it 5 times with the demo input and pick the best version — use that as a fallback if live generation looks off.

**What Claude must never do:**
- Use the words food bank, charity, donation, welfare, handout in seeker-facing outputs
- Match a halal seeker to a non-halal listing under any circumstance
- Match a user with a nut allergy to any listing where nuts are present
- Make up ingredients not in the pickup list for the recipe
- Reveal anything about the seeker to the provider in the notification

**The demo flow you need working by hour 5:**
Seeker types their needs → Claude extracts profile → match route returns Amara's jollof rice as top result → recipe generates a West African-inspired microwave meal → after mock completion, notification generates and reads naturally out loud.

**Prompt philosophy for each call:**
- Onboard: warm friend energy, peer-level, one question at a time
- Parse listing: extract and structure, safety first, never list unsafe food
- Match: hard filters before soft ranking, match reason must be specific not generic
- Recipe: constrained creativity, use exactly what they're picking up, real dish name
- Notify: personal and specific, never corporate, mention the actual food by name

---

## ARSHIA — Database + Data Layer

You own all data in and out. If data doesn't exist, nothing works.

**Hour 1 (priority zero):** Get Airtable running and share the base ID and API key in the group chat before anyone else starts coding. Everyone is blocked on you for this.

**Hours 1–2:** Set up all 4 Airtable tables with correct fields. Add the seed data (below) manually. Build the listings routes (available + create + reserve).

**Hours 3–4:** Build provider routes (get + create) and match routes (create + complete). The complete route is the most important — it's what triggers points and notifications.

**Hour 5:** Connect with James — make sure complete route correctly calls notify and awards points. Test the full provider flow: message drop → listing created → match completed → points awarded → notification saved.

**Hour 6:** Seed more realistic data so the sponsor dashboard doesn't show zeros. Make sure available listings returns clean data that matches what the frontend MatchCard component expects.

**The 4 Airtable tables you need:**

Table 1 — food_listings
Fields: listing title, listing emoji, food items (text), portions (number), dietary flags (multi-select), allergens present (multi-select), pickup location, pickup window, prep date, safety passed (checkbox), status (available/reserved/completed), provider ID, provider contact

Table 2 — providers
Fields: name, contact (phone), mesa points (number), total portions (number), badge (Feeder/Regular/Hero/Legend), notifications (long text — stores JSON array of Claude-written messages)

Table 3 — seeker sessions
Fields: session ID (text), dietary restrictions (text), health conditions (text), cultural preferences (text), kitchen type (text), favorite ingredients (text), avoid (text)

Table 4 — matches
Fields: seeker session ID, listing ID, status (matched/confirmed/completed), notification sent (checkbox), created time

**Seed data to add manually before demo:**

Listing 1 — Homemade Jollof Rice 🍛
Portions 8 · Halal · No allergens · Near Dorm 4 Building B · Pickup 4pm–8pm today · Available · Safety passed

Listing 2 — Fresh Sourdough Loaves 🍞
Portions 12 · Vegan · Contains gluten · Campus Bakery Back Door · Pickup 5pm–7pm · Available · Safety passed

Listing 3 — Dal and Brown Rice 🫘
Portions 6 · Vegan, gluten-free, halal · No allergens · Student Union Fridge · Pickup anytime today · Available · Safety passed

Provider — Amara K.
Contact: your real number for demo · Points: 325 · Badge: Regular · Total portions: 42

---

## SIDDHANT — Frontend Support + Sponsor Dashboard

You support Jason on whatever he needs and you fully own the sponsor dashboard page.

**Hours 1–2:** Help Jason set up the project. Understand what components he's building so you don't duplicate.

**Hours 3–4:** Build the sponsor dashboard page independently. It calls `/api/sponsor/stats` and displays the numbers. Four metric cards (meals, providers, dietary categories matched, points redeemed), a feed of recent provider milestones, and space for the Claude-generated weekly report text. Think Stripe dashboard energy — clean, confident, not charity-coded.

**Hour 5:** Help Jason integrate backend calls if he's stuck. The MatchCard component needs to render what James's match route returns — make sure they're aligned on the shape of that data.

**Hour 6:** Two things — make the map on the right show listing pins when matches are found (use the pickup_location field, approximate coordinates are fine for demo), and make sure the stats on the top right of the header are pulling from the real Airtable data via the sponsor stats endpoint.

---

## JASON — Frontend Lead

You're already building. Keep going.

**What backend will give you by hour 4:**
All the API endpoints listed above will be live at localhost:3000. Call them from your components. Don't write any Airtable or Claude code yourself.

**The one thing to agree with James in hour 1:**
The exact shape of the seeker profile JSON and the match response JSON. Lock those in and don't change them. Everything else can flex.

**The Twilio call feature:** Not in this build. Future scope. Remove any call-related UI for now. The flow after match is: user sees the match card, clicks reserve, listing is marked reserved, recipe generates. That's it.

**The suggestion chips on your landing page** (seen in the screenshot): these are just pre-filled example inputs. They don't need to be dynamic. Hard-code 3 good ones for the demo.

---

## Hour-by-Hour Summary

| Hour | Jason | Siddhant | Arshia | James |
|---|---|---|---|---|
| 1 | Project setup together | Project setup together | Airtable live + seeded | Claude client working |
| 2 | Seeker chat UI + streaming | Help Jason | Listings routes done | Onboard + parse routes done |
| 3 | Provider drop UI | Sponsor dashboard | Provider + match routes | Match + recipe routes done |
| 4 | Match cards + recipe display | Sponsor dashboard | Complete route + points | Notify route done |
| 5 | Connect all backend calls | Map pins from listings | End-to-end test with James | End-to-end test with Arshia |
| 6 | Polish + demo prep | Stats in header live | Seed data + real numbers | Prompt polish + fallbacks |

---

## Demo Inputs — Use These On Stage

**Provider types this (paste it live):**
"hey so i made way too much jollof rice tonight, birthday thing got cancelled lol. i have like 8 portions, it's halal, made it 2 hours ago super fresh. pickup near dorm 4 before 8pm. no nuts or dairy in it."

**Seeker types these (one at a time):**
- "rice, lentils, anything spicy honestly"
- "I'm halal and diabetic so low sugar stuff"
- "just a microwave in my dorm"
- "I'm from West Africa, rice dishes, stews"

**Read this notification aloud after pickup:**
"Hey Amara — the jollof rice you made tonight went to a student from West Africa who hadn't had food that felt like home in weeks. They said it tasted like home. +15 Hearth Points today (340 total). You're 160 away from your Community Feast invite."

---

## Future Scope — Say This in the Pitch

AI agent calls the provider to confirm pickup before the student makes the trip. Kiosk version outside libraries and shelters for people without smartphones. Local government integration for tax receipts at 500 points. Real-time food security data for city districts.

---

## The Close — Everyone Memorizes This

"We didn't build a food bank. We built the infrastructure that makes every person in a community a potential part of the solution. It's called Hearth. Because everyone deserves one."