const BASE = "http://localhost:3001";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

let pass = 0, fail = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${name}`);
  if (!ok && detail) console.log(`   ${detail}`);
  ok ? pass++ : fail++;
}

console.log("🧪 TORTURE TESTS\n");

// 1. Halal seeker NEVER sees pork — demo-killer if this breaks
{
  const r = await post("/api/claude/match", {
    profile: { dietary_restrictions: ["halal"], health_conditions: [], kitchen_type: "full kitchen", cultural_preferences: [], favorite_ingredients: [], avoid: [] },
    listings: [
      { listing_id: "pork", title: "Bacon Pasta", dietary_flags: [], allergens_present: [], food_items: ["bacon"], portions: 4 },
      { listing_id: "good", title: "Halal Chicken", dietary_flags: ["halal"], allergens_present: [], food_items: ["chicken"], portions: 4 },
    ],
  });
  check("Halal filter excludes pork/bacon", !r.some(m => m.listing_id === "pork"), `got ids: ${r.map(m=>m.listing_id).join(",")}`);
}

// 2. Nut allergy = absolute exclusion
{
  const r = await post("/api/claude/match", {
    profile: { dietary_restrictions: [], health_conditions: ["nut allergy"], kitchen_type: "full kitchen", cultural_preferences: [], favorite_ingredients: [], avoid: [] },
    listings: [
      { listing_id: "nuts", title: "Peanut Stir Fry", dietary_flags: [], allergens_present: ["nuts"], food_items: ["peanuts"], portions: 4 },
      { listing_id: "ok", title: "Plain Rice", dietary_flags: [], allergens_present: [], food_items: ["rice"], portions: 4 },
    ],
  });
  check("Nut allergy filter excludes nuts", !r.some(m => m.listing_id === "nuts"), `got ids: ${r.map(m=>m.listing_id).join(",")}`);
}

// 3. Vague provider message fails safety check
{
  const r = await post("/api/claude/parse-listing", { message: "got some food lol, free to anyone" });
  check("Vague message triggers clarification", r.safety_passed === false && !!r.clarification_question, `passed=${r.safety_passed}, q=${r.clarification_question}`);
}

// 4. Old food fails safety check
{
  const r = await post("/api/claude/parse-listing", { message: "I made lasagna 3 days ago, should still be fine. 6 portions, pickup at dorm." });
  check("3-day-old food fails safety", r.safety_passed === false, `passed=${r.safety_passed}`);
}

// 5. Microwave recipe has no stove/oven
{
  const r = await post("/api/claude/recipe", {
    food_items: ["chili"], kitchen_type: "microwave", dietary_restrictions: [], health_conditions: [], cultural_preferences: [],
  });
  const stepText = (r.steps || []).join(" ").toLowerCase();
  const badWords = ["stove", "oven", "skillet", "saucepan", "sauté", "sautee", "broil"];
  const found = badWords.find(w => stepText.includes(w));
  check("Microwave recipe has no stove/oven", !found, `found "${found}" in steps`);
}

// 6. Notification stays under 70 words AND no banned words
{
  const r = await post("/api/claude/notify", {
    food_description: "chicken stew", portions: 6, points_earned: 15, current_points: 100, next_milestone_name: "Regular badge", next_milestone_points: 200,
  });
  const wc = r.message.split(/\s+/).length;
  const banned = ["food bank", "charity", "donation", "welfare", "handout", "beneficiary"];
  const found = banned.find(w => r.message.toLowerCase().includes(w));
  check(`Notify under 70 words (got ${wc})`, wc < 70, r.message);
  check("Notify has no banned words", !found, found ? `found "${found}"` : "");
}

console.log(`\n${pass} passed, ${fail} failed.`);
console.log(fail === 0 ? "\n✅ Demo-safe. Ship it." : "\n⚠️ Fix the failures before stage.");
