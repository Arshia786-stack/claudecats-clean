# FULL 🍱

> *Because finding food should never be harder than finding food.*

**FULL** is a Claude-powered food access platform that reduces food waste and connects people in need with available food resources — through a single, simple, conversational interface.

Built at a hackathon using the Claude API, Node.js, and Vite.

---

## 💡 Inspiration

Imagine volunteering at a food bank during the post-pandemic years. A mother pulls up, her car packed to the brim with everything she owns, a child in the backseat smiling at you. You hand her a box of food. She looks at you and says: *"You don't understand how much this helps me."* and drives off.

That moment stays with one of our team members. It is our duty to help when we are able, and without questioning. Everyone deserves access to food.

The numbers made that duty impossible to ignore:

- **47.9 million** Americans are food insecure
- **40%** of the U.S. food supply is wasted — 120 billion pounds a year
- **1 in 4** undergraduates skips meals, twice the national rate

The food exists. The people exist. **The connection doesn't.**

We built FULL because that gap is not a supply problem — it is a coordination problem. And it felt like exactly the kind of problem AI could actually solve.

---

## 🌐 What It Does

FULL serves **food seekers**, **individual providers**, and **restaurants** through the same simple, conversational interface.

### For Seekers
Works like talking to a friend who already knows what's available nearby. Describe what you need in plain language — dietary restrictions, health conditions, time constraints — and FULL surfaces the best matches ranked by your preferences and location. It remembers your preferences across sessions, so you never start with a blank profile.

### For Providers
Whether there's a student with extra rice from dinner, a restaurant with surplus end-of-day stock, or a community member wanting to help — they all use the same input. Type what you have in your own words, set the pickup window and location, and FULL handles the rest: parsing the message into structured data, running an automatic food-safety check, and posting a clean listing.

### Accessible by Design
FULL loads on **any device** — at the library, on a personal phone, or at a dining hall kiosk. Wherever someone happens to be when they need food, FULL is meant to be there too.

---

## 🛠️ How We Built It

We built FULL as a focused MVP prioritizing frontend usability and demo clarity.

- **Core layout:** Two-panel design — conversational search on one side, map + listings on the other
- **AI layer:** Claude API for natural language parsing, food-safety checks, and personalized ranking
- **Frontend:** Vite + vanilla JS with the HEARTH design system for a calm, accessible UI
- **Backend:** Node.js server handling Claude API calls, session memory, and mock data integration
- **Architecture:** Designed for real integrations — mock data used now, live APIs ready to plug in

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI | Claude API (Anthropic) |
| Frontend | Vite, JavaScript, HEARTH Design System |
| Backend | Node.js, Express |
| Agents | Multi-agent architecture via Claude |
| Deployment | Web (device-agnostic) |

---

## 🧱 Challenges We Ran Into

Our biggest challenge was **scope**. The real problem spans live inventory, transit routing, organizational coordination, and constantly shifting availability — far larger than a hackathon window.

We stayed focused on the MVP and built the clearest proof of concept first: a simple, usable product that helps people find food quickly and with less friction. Incomplete and inconsistent public food data made every design decision harder.

**Ethical considerations we built around:**
- No account required to receive food — barriers to access defeat the purpose
- Dietary preferences (halal, kosher, vegan) treated as requirements, not suggestions
- UI avoids language that stigmatizes food insecurity — everyone is just "finding food"
- Every provider listing goes through an automatic food-safety check before posting

---

## 🏆 What We're Proud Of

We translated a genuinely complex logistics problem into a **clean, human-centered experience**. We combined AI with a real-world social use case and built something that feels both impactful and practical.

Most of all, FULL is not just a technical concept — it is a product that could meaningfully reduce the effort it takes to find food when it matters most.

---

## 📚 What We Learned

Many social problems are not simply about supply. They are about **coordination and access**.

From the start, we wanted to remove all friction: no account required, no lengthy setup, no forms asking people to prove they qualify. A user can open FULL and find food immediately, with preferences like dietary needs, culture, and timing handled through a simple conversation.

Good design in this context is not about aesthetics — it is about removing every possible reason someone might give up before they find what they need.

---

## 🔭 What's Next for FULL

- **Live data:** Connect to real food bank, pantry, and transit APIs so recommendations move beyond mock results
- **Smarter AI:** Improved ranking, multilingual support, and deeper personalization
- **Org tools:** Help organizations and donors update availability and coordinate food distribution in real time
- **Scale:** A platform that could support millions of people by connecting them to timely, reliable food resources when they need them most

---

## 🤝 Team

Built with care at a hackathon. Powered by Claude. Driven by the belief that **no one should go hungry because the coordination failed.**

---

*"You don't understand how much this helps me."*
