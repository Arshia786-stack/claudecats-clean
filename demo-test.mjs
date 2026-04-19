const BASE = "http://localhost:3001";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

// === STEP 1: ONBOARD — simulate a full seeker conversation ===
console.log("\n=== STEP 1: ONBOARD ===\n");
const onboardRes = await post("/api/claude/onboard", {
  messages: [
    { role: "user", content: "hey I need some food. I'm halal and diabetic, from West Africa. Just a microwave in my dorm. Love rice and stews. No pork, low sugar. That covers it." },
  ],
});
const onboardText = await onboardRes.text();
console.log(onboardText);

const profileMatch = onboardText.match(/<PROFILE_JSON>([\s\S]*?)<\/PROFILE_JSON>/);
if (!profileMatch) {
  console.error("\n❌ No profile JSON in onboard output. Need a longer convo — check the prompt.");
  process.exit(1);
}
const profile = JSON.parse(profileMatch[1].trim());
console.log("\n✅ Extracted profile:", profile);

// === STEP 2: MATCH — feed profile + listings (incl. one that should be filtered) ===
console.log("\n\n=== STEP 2: MATCH ===\n");
const listings = [
  { listing_id: "rec1", title: "Homemade Jollof Rice", emoji: "🍛", food_items: ["jollof rice"], portions: 8, dietary_flags: ["halal","dairy-free","nut-free"], allergens_present: [], pickup_location: "near Dorm 4", pickup_window: "before 8pm today" },
  { listing_id: "rec2", title: "Pulled Pork Sandwiches", emoji: "🥪", food_items: ["pulled pork"], portions: 6, dietary_flags: [], allergens_present: ["gluten"], pickup_location: "Union", pickup_window: "5-7pm" },
  { listing_id: "rec3", title: "Dal and Brown Rice", emoji: "🫘", food_items: ["dal","brown rice"], portions: 6, dietary_flags: ["vegan","gluten-free","halal"], allergens_present: [], pickup_location: "Student Union Fridge", pickup_window: "anytime today" },
];
const matchRes = await post("/api/claude/match", { profile, listings });
const matches = await matchRes.json();
console.log(JSON.stringify(matches, null, 2));

if (!Array.isArray(matches) || matches.length === 0) {
  console.error("\n❌ No matches returned.");
  process.exit(1);
}
if (matches.find(m => m.listing_id === "rec2")) {
  console.error("\n❌ FILTER BROKEN — pork sandwich made it through. Demo would die.");
  process.exit(1);
}
const top = matches[0];
console.log(`\n✅ Top match: ${top.title} — ${top.compatibility_score}/100`);
console.log(`   Reason: ${top.reason}`);

// === STEP 3: RECIPE — generate from the top match ===
console.log("\n\n=== STEP 3: RECIPE ===\n");
const recipeRes = await post("/api/claude/recipe", {
  food_items: top.food_items,
  kitchen_type: profile.kitchen_type,
  dietary_restrictions: profile.dietary_restrictions,
  health_conditions: profile.health_conditions,
  cultural_preferences: profile.cultural_preferences,
});
const recipe = await recipeRes.json();
console.log(JSON.stringify(recipe, null, 2));
console.log(`\n✅ Recipe: ${recipe.name}`);

// === STEP 4: NOTIFY — what Amara hears after pickup ===
console.log("\n\n=== STEP 4: NOTIFY (read this OUT LOUD) ===\n");
const notifyRes = await post("/api/claude/notify", {
  food_description: top.title.toLowerCase(),
  portions: top.portions,
  points_earned: 15,
  current_points: 325,
  next_milestone_name: "Community Feast invite",
  next_milestone_points: 500,
});
const notify = await notifyRes.json();
console.log("📱 " + notify.message);

console.log("\n\n✅ FULL DEMO FLOW WORKS. Ship it.");
