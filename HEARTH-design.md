# Hearth — Team Build Plan
**4 people · 6 hours · Ship something real**

---

## The Simple Version of What We're Building

Three types of people. One platform.

- **Seekers** open the app, tell Claude what they need, Claude finds food that actually fits them
- **Providers** drop a message about what they have, Claude lists it, they get a notification when someone picks it up
- **Sponsors** see a dashboard showing the community impact their support is creating

No database. No Airtable. No login. All data is hardcoded for the hackathon. Claude does all the thinking.

---

## Who Does What

| Person | Role | What they actually build |
|---|---|---|
| **Jason** | Frontend Lead | All UI — already building, keeps going |
| **Siddhant** | Frontend Support | Sponsor dashboard + map pins + helps Jason |
| **James** | Claude Lead | Every Claude API call — the brain of the whole app |
| **Arshia** | Data + Glue | Hardcoded listings, synthetic data, connects James's Claude routes to Jason's UI |

---

## No Database — Here's What We Do Instead

All food listings live in one file: `data/listings.ts`

It's a hardcoded array of 10 realistic listings. Providers adding food during the demo also goes into this same in-memory structure — it resets on refresh but that's fine for a hackathon demo.

Claude reads from this array when matching. Claude writes new parsed listings into it when a provider drops a message. Everything stays in memory during the session.

**This is Arshia's first job — create this file in hour 1 so everyone can use it.**

---

## The Hardcoded Listings — Arshia Builds This First

Ten listings covering different dietary needs, cultures, and locations. Enough to show real matching diversity during the demo.

**What each listing needs:**
- Unique ID
- Title and emoji
- Food items as array
- Number of portions
- Dietary flags (halal, vegan, gluten-free, kosher, nut-free, dairy-free)
- Allergens present
- Pickup location (campus building name)
- Pickup window (time range today)
- Prep date (today)
- Status (available)
- Provider name (first name only)
- Points value

**The 10 listings to hardcode:**

1. Homemade Jollof Rice — 8 portions — Halal — Near Dorm 4 — 4pm to 8pm — Amara
2. Fresh Sourdough Loaves — 12 portions — Vegan — Campus Bakery — 5pm to 7pm — The Bakery
3. Dal and Brown Rice — 6 portions — Vegan, Gluten-free, Halal — Student Union Fridge — Anytime — Priya
4. Korean Japchae Noodles — 4 portions — Vegan, Gluten-free — Multicultural Center — 3pm to 6pm — Soo-Jin
5. Chicken Biryani — 10 portions — Halal — Grad Housing Lobby — 6pm to 9pm — Fatima
6. Black Bean Tacos (assembled) — 8 portions — Vegan — Wellness Center — 2pm to 5pm — Carlos
7. Lentil Soup — 6 portions — Vegan, Gluten-free, Halal — Library Entrance — All day — Community Fridge
8. Cheese Pizza Slices — 8 portions — Vegetarian — Engineering Building — 12pm to 3pm — CS Department
9. Fruit Bowl (apples, bananas, oranges) — 20 portions — Vegan, Gluten-free, Halal, Kosher — Student Union — All day — Campus Wellness
10. Pasta with Marinara — 6 portions — Vegan — Dorm 2 Common Room — 7pm to 9pm — Resident Advisor

---

## The API Endpoints — Agreed Hour 1, Never Change

Jason calls these. James and Arshia build them. Names are locked.

| Endpoint | Method | Who builds | What it does |
|---|---|---|---|
| `/api/claude/onboard` | POST | James | Streaming seeker chat, returns profile |
| `/api/claude/match` | POST | James | Matches profile to hardcoded listings |
| `/api/claude/parse-listing` | POST | James | Parses provider message into structured listing |
| `/api/claude/recipe` | POST | James | Generates recipe from confirmed pickup items |
| `/api/claude/notify` | POST | James | Writes warm notification for provider |
| `/api/claude/report` | POST | James | Generates sponsor weekly impact summary |
| `/api/listings/available` | GET | Arshia | Returns all available listings from hardcoded data |
| `/api/listings/add` | POST | Arshia | Adds new provider listing to in-memory array |
| `/api/listings/reserve` | POST | Arshia | Marks a listing as reserved |
| `/api/points/award` | POST | Arshia | Calculates and returns updated points after pickup |
| `/api/sponsor/stats` | GET | Arshia | Returns hardcoded but realistic impact numbers |

---

## What Each Endpoint Receives and Returns

---

### `/api/claude/onboard` — James
Receives: conversation messages array so far
Returns: streaming text. When profile complete, includes JSON block with dietary restrictions, health conditions, kitchen type, cultural preferences, favorite ingredients, things to avoid.
Frontend parses JSON silently — never shows it to the user.

---

### `/api/claude/match` — James
Receives: seeker profile JSON + full listings array
Returns: ranked array of matches. Each has listing ID, title, emoji, pickup info, one specific sentence why it fits this person, compatibility score, any warnings.
Hard rule: halal seekers never see non-halal. Allergies are absolute exclusions. Never soft rank around a hard dietary restriction.

---

### `/api/claude/parse-listing` — James
Receives: raw message string from provider
Returns: structured listing object with food items, portions, dietary flags, allergens, pickup location, pickup window, prep date, safety passed true or false, and if false — one clarification question.

---

### `/api/claude/recipe` — James
Receives: confirmed pickup items, kitchen type, dietary restrictions, cultural preferences
Returns: recipe name, tagline, cook time, steps array, optional nutrition note, optional cultural note.
Only uses pickup items plus salt, pepper, oil, water. Never invents ingredients.

---

### `/api/claude/notify` — James
Receives: food description, provider name, portions, points earned, new points total
Returns: one warm personal message under 70 words. Uses the actual food name. Mentions points. Mentions next milestone. Never mentions the seeker by name or any identifying detail.

---

### `/api/claude/report` — James
Receives: aggregate stats object (meals, providers, categories, points)
Returns: a short warm executive summary for the sponsor dashboard. Opens with a human story, follows with numbers, ends with what their support specifically enabled.

---

### `/api/listings/available` — Arshia
Receives: nothing
Returns: all listings from the hardcoded array where status is available. Full listing object for each.

---

### `/api/listings/add` — Arshia
Receives: parsed listing from Claude's parse-listing response
Returns: success confirmation and the new listing ID. Adds it to the in-memory array for the session.

---

### `/api/listings/reserve` — Arshia
Receives: listing ID, seeker session ID
Returns: success. Updates that listing's status to reserved in the array.

---

### `/api/points/award` — Arshia
Receives: provider name, portions provided, dietary diversity flags
Returns: points earned this pickup, new total, badge level, next milestone name and threshold.
Points formula: 2 per portion plus 5 bonus for dietary diversity (halal or allergy-safe).

---

### `/api/sponsor/stats` — Arshia
Receives: nothing
Returns: hardcoded but realistic numbers — total meals, active providers, dietary categories covered, points awarded, a short array of recent provider milestone strings for the dashboard feed.

---

## JAMES — Claude Lead

You are the brain. Every intelligent thing the app does goes through you.

**What you build:**
Six API routes that each make one Claude API call and return structured data.

**Hour 1:** Get the Claude client working. Test one simple call. Make sure streaming works.

**Hours 2–3:** Build onboard and parse-listing. These are the two most important — everything else depends on a working profile and working listings.

**Hours 3–4:** Build match. This is the hardest prompt — the hard filter logic must be bulletproof. Test it with a halal seeker against a mix of halal and non-halal listings. It must never return a non-halal result.

**Hour 4–5:** Build recipe and notify. These are the emotional heart of the demo. The notification especially — run it 10 times with the demo data and save the best output as a fallback in case live generation is slow.

**Hour 5–6:** Build report for sponsor dashboard. Polish all prompts based on real outputs.

**What Claude must never do in any output:**
Use the words food bank, charity, donation, welfare, handout, or recipient in any seeker-facing or provider-facing text. It is a concierge service. Language matters.

**Your most important prompt is notify.** Practice it. The judges will hear it read aloud. It needs to make the room go quiet.

---

## ARSHIA — Data and Glue

You are what holds everything together without a database.

**What you build:**
The hardcoded listings file that everyone reads from, and the five lightweight API routes that manage state during the session.

**Hour 1 — This is your only blocker for the team:**
Create `data/listings.ts` with all 10 listings hardcoded. Share it in the group chat the moment it is done. James needs it to test matching. Jason needs it to render cards. You cannot be late on this.

**Hours 2–3:** Build the listings routes — available, add, reserve.

**Hours 3–4:** Build points/award and sponsor/stats.

**Hour 5:** End-to-end test with James. Full flow: provider drops message, Claude parses it, Arshia adds it to array, seeker matches to it, seeker reserves it, points awarded, notification triggers.

**Hour 6:** Make sure sponsor/stats returns numbers that look real on screen. Not zeros. Realistic impact numbers that match the story — around 847 meals, 124 providers, 31 dietary needs matched.

**One important thing:** The in-memory listings array resets on server restart. That is fine for the demo. Do not try to persist it. Just warn the team — do not restart the server once the demo starts.

---

## SIDDHANT — Frontend Support and Sponsor Dashboard

**Hours 1–2:** Help Jason. Understand what components he is building so you never duplicate.

**Hours 3–4:** Build the sponsor dashboard page on your own. It calls `/api/sponsor/stats` and `/api/claude/report`. Show four metric cards, a feed of recent provider milestones, and the Claude-generated weekly report rendered as text. Stripe dashboard energy — confident, clean, not charity-coded.

**Hour 5:** Help Jason connect the backend calls if he is stuck. Make sure the MatchCard component shape matches what James's match route returns.

**Hour 6:** Get the map to show listing pins using pickup location names as labels. Coordinates can be approximate — just place them roughly on a campus map. Make the header stats pull from the real stats endpoint so they are not hardcoded in the UI.

---

## JASON — Frontend Lead

Keep building what you're building. It already looks great.

**What backend gives you by hour 4:**
All eleven API endpoints live at localhost:3000. Just call them. Do not write Claude or data logic yourself.

**One thing to lock in hour 1 with James:**
The exact JSON shape of the seeker profile and the match response. Agree on field names. Do not change them mid-build.

**The suggestion chips on your landing page:**
Hardcode these three — they are not dynamic:
- "I need food tonight, halal, and I only have a microwave"
- "Looking for something vegan, can pick up by 7pm"
- "Anything gluten-free near campus?"

**The flow after a match:**
User sees match cards, clicks reserve, listing marked reserved, recipe card appears below. That is the full seeker journey. No call screen. Calls are future scope.

---

## Hour-by-Hour War Plan

| Hour | Jason | Siddhant | Arshia | James |
|---|---|---|---|---|
| 1 | Setup + agree on JSON shapes | Setup + understand Jason's components | listings.ts hardcoded and shared | Claude client + streaming test |
| 2 | Seeker chat + streaming UI | Help Jason | listings routes done | Onboard + parse routes done |
| 3 | Provider drop UI | Sponsor dashboard | Points + stats routes | Match + recipe routes done |
| 4 | Match cards + recipe display | Sponsor dashboard | End-to-end flow ready | Notify + report routes done |
| 5 | Connect all backend calls | Map pins + help Jason | Test with James end-to-end | Polish prompts + save fallbacks |
| 6 | Demo polish | Header stats live | Real-looking stats seeded | Run notify 10x pick best output |

---

## Demo Inputs — Use These Exactly On Stage

**Provider message — paste this live:**
hey so i made way too much jollof rice tonight, birthday thing got cancelled lol. i have like 8 portions, it's halal, made it 2 hours ago super fresh. pickup near dorm 4 before 8pm. no nuts or dairy in it.

**Seeker answers — type one at a time:**
- rice, lentils, anything spicy honestly
- I'm halal and diabetic so low sugar stuff
- just a microwave in my dorm
- I'm from West Africa, rice dishes, stews

**Read this out loud after pickup — do not show it on screen, read it:**
"Hey Amara — the jollof rice you made tonight went to a student from West Africa who hadn't had food that felt like home in weeks. They said it tasted like home. +15 Hearth Points today, 340 total. You're 160 away from your Community Feast invite."

Pause. Do not talk for two seconds. Let it land.

---

## Future Scope — Say This in 15 Seconds

AI agent calls the provider to confirm stock before the student makes the trip. Kiosk version outside libraries and shelters — no smartphone needed. Local government integration for real tax receipts at 500 points. Real database when we scale beyond the campus.

---

## The Pitch Close — Everyone Memorizes This

"We didn't build a food bank. We built the infrastructure that makes every person in a community a potential part of the solution. It's called Hearth. Because everyone deserves one."