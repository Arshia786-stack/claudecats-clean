export const LISTINGS = [
  {
    id: "l1", title: "Chicken & rice bowls",
    provider: "Mission Food Pantry", providerType: "pantry",
    pickup: "Today, 5:00 – 7:30pm", window: "closes in 2h 40m",
    neighborhood: "Mission District", distance: "0.4 mi", walkTime: "8 min walk",
    tags: ["protein", "halal", "hot meal"], portions: 42,
    matchReason: "High protein, open now, fits your 5pm window",
    image: "warm", imgLabel: "[chicken & rice]", badge: "serving now",
    map: { x: 38, y: 42, label: "A", tone: "ember" },
  },
  {
    id: "l2", title: "Lentil stew + fresh bread",
    provider: "St. Anthony's Kitchen", providerType: "community kitchen",
    pickup: "Today, 4:30 – 6:00pm", window: "closes in 1h 10m",
    neighborhood: "SoMa", distance: "0.7 mi", walkTime: "14 min walk",
    tags: ["vegetarian", "vegan option", "hot meal"], portions: 28,
    matchReason: "Plant-based, 18g protein per serving",
    image: "sage", imgLabel: "[lentil stew]", badge: "serving now",
    map: { x: 56, y: 55, label: "B", tone: "ember" },
  },
  {
    id: "l3", title: "Grocery boxes — produce + pantry",
    provider: "SF Marin Food Bank", providerType: "food bank",
    pickup: "Today until 8:00pm", window: "5 hours left",
    neighborhood: "Bayview", distance: "1.1 mi", walkTime: "22 min walk",
    tags: ["groceries", "family size", "dairy-free"], portions: 14,
    matchReason: "Includes lean protein (eggs, beans, chicken)",
    image: "cool", imgLabel: "[grocery box]", badge: "plenty available",
    map: { x: 68, y: 30, label: "C", tone: "ember" },
  },
  {
    id: "l4", title: "Halal chicken shawarma wraps",
    provider: "Noor Community Table", providerType: "community",
    pickup: "Today, 6:00 – 8:00pm", window: "opens in 45 min",
    neighborhood: "Tenderloin", distance: "1.3 mi", walkTime: "25 min walk",
    tags: ["halal", "protein", "hot meal"], portions: 60,
    matchReason: "Halal, high protein, opens right around 6pm",
    image: "warm", imgLabel: "[shawarma wrap]", badge: "opens soon",
    map: { x: 28, y: 22, label: "D", tone: "ember" },
  },
  {
    id: "l5", title: "Vegetable curry & roti",
    provider: "Shanti Community Meals", providerType: "community",
    pickup: "Today, 5:30 – 7:00pm", window: "closes in 3h",
    neighborhood: "Outer Mission", distance: "1.6 mi", walkTime: "30 min walk",
    tags: ["vegetarian", "dairy-free", "hot meal"], portions: 22,
    matchReason: "Protein from lentils, no dairy",
    image: "plum", imgLabel: "[veg curry]", badge: "serving now",
    map: { x: 46, y: 68, label: "E", tone: "ember" },
  },
  {
    id: "l6", title: "Fresh sandwiches + fruit",
    provider: "GLIDE Daily Bread", providerType: "community",
    pickup: "Today, 5:00 – 7:00pm", window: "closes in 2h 10m",
    neighborhood: "Tenderloin", distance: "1.4 mi", walkTime: "26 min walk",
    tags: ["grab-n-go", "protein"], portions: 35,
    matchReason: "Quick grab, turkey + egg options",
    image: "sage", imgLabel: "[sandwich tray]", badge: "serving now",
    map: { x: 20, y: 50, label: "F", tone: "sage" },
  },
]

export const RESOURCES = [
  { id: "r1", title: "CalFresh enrollment in one visit", kicker: "benefits", time: "12 min read", image: "cool" },
  { id: "r2", title: "Free public transit to food sites", kicker: "transit", time: "3 min", image: "sage" },
  { id: "r3", title: "Showers & laundry near Mission", kicker: "hygiene", time: "locations", image: "plum" },
  { id: "r4", title: "SNAP-eligible grocery list", kicker: "benefits", time: "printable", image: "warm" },
]

export const PROVIDER_PARSE = {
  input: "we have about 30 chicken & rice bowls ready at 5pm, hot, mission district pickup til 7:30",
  parsed: {
    title: "Chicken & rice bowls",
    portions: 30,
    tags: ["protein", "hot meal", "halal"],
    pickup: "Today · 5:00 – 7:30pm",
    location: "Mission District",
    safety: [
      { label: "Held at ≥140°F", status: "ok" },
      { label: "Prepared within last 2 hrs", status: "ok" },
      { label: "Allergens declared", status: "ok" },
      { label: "Pickup window under 4 hrs", status: "ok" },
    ],
  },
}

export const SPONSOR_METRICS = {
  name: "Acme Foundation",
  period: "Week of Apr 13 – Apr 19, 2026",
  hero: [
    { label: "Meals served", value: "4,812", delta: "+12%", tone: "sage" },
    { label: "Unique neighbors", value: "1,207", delta: "+8%", tone: "sage" },
    { label: "Active providers", value: "38", delta: "+3", tone: "sage" },
    { label: "Avg. match time", value: "2.4 min", delta: "-0.6", tone: "ember" },
  ],
  chart: [
    40, 52, 48, 60, 55, 72, 68, 80, 74, 90, 88, 102,
    95, 108, 112, 120, 115, 128, 132, 140, 135, 148, 155, 162,
  ],
  neighborhoods: [
    { name: "Mission District", meals: 1280, pct: 0.27 },
    { name: "Tenderloin", meals: 1104, pct: 0.23 },
    { name: "Bayview", meals: 865, pct: 0.18 },
    { name: "SoMa", meals: 720, pct: 0.15 },
    { name: "Outer Mission", meals: 480, pct: 0.10 },
    { name: "Other", meals: 363, pct: 0.07 },
  ],
  stories: [
    { neighbor: "A student at SF State", quote: "I found a halal meal 10 min from my dorm at 9pm. First hot meal in two days." },
    { neighbor: "A parent in Bayview", quote: "Grocery box covered three dinners. The kids actually liked the lentils." },
  ],
}

export const RECIPE = {
  title: "3 things you can do with chicken & rice",
  subtitle: "A note from FULL, based on what you reserved",
  tips: [
    { h: "Tonight", b: "Eat it as-is — it's balanced and ready. Squeeze lemon if you have it." },
    { h: "Tomorrow lunch", b: "Wrap leftovers in flatbread with any greens or pickles. Add hot sauce." },
    { h: "Stretch it further", b: "Simmer the rice with extra water and a bouillon cube to feed two." },
  ],
  safety: "Refrigerate within 2 hours. Good for 3–4 days covered. Reheat until steaming.",
}
