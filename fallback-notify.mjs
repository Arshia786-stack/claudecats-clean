const BASE = "http://localhost:3001";

async function notify(input) {
  const res = await fetch(`${BASE}/api/claude/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await res.json()).message;
}

const input = {
  food_description: "homemade jollof rice",
  portions: 8,
  points_earned: 15,
  current_points: 325,
  next_milestone_name: "Community Feast invite",
  next_milestone_points: 500,
};

console.log("🍛 Running notify 5x. Pick the one that hits hardest.\n");
for (let i = 1; i <= 5; i++) {
  console.log(`--- RUN ${i} ---`);
  console.log(await notify(input));
  console.log();
}
console.log("✅ Pick your favorite. Save it as FALLBACK_NOTIFICATION and send to Jason.");
