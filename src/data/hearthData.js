export const LISTINGS = [
  {
    id: "l1", title: "Bruin Pantry — Produce + Pantry Boxes",
    provider: "UCLA Bruin Pantry", providerType: "campus org",
    pickup: "Mon–Fri · 10am – 4pm", window: "open today",
    neighborhood: "UCLA Campus", distance: "5 min walk",
    tags: ["vegan", "gluten-free", "halal", "kosher", "groceries"], portions: 40,
    matchReason: "No-questions-asked pantry with produce, dry goods, and canned protein",
    image: "sage", imgLabel: "[produce box]", badge: "available now",
    mapLabel: "A", lat: 34.0714, lng: -118.4448,
  },
  {
    id: "l2", title: "MSA Iftar Community Plates",
    provider: "UCLA Muslim Students Assoc.", providerType: "campus org",
    pickup: "Tonight · 7:30pm – 9pm", window: "tonight",
    neighborhood: "UCLA Campus", distance: "4 min walk",
    tags: ["halal", "hot meal", "microwave ok"], portions: 55,
    matchReason: "Halal chicken, basmati rice, lentil shorba, dates — open to anyone",
    image: "warm", imgLabel: "[iftar plate]", badge: "serving now",
    mapLabel: "B", lat: 34.0716, lng: -118.4437,
  },
  {
    id: "l3", title: "Shabbat Dinner Leftovers — Challah + Soup",
    provider: "Hillel at UCLA", providerType: "campus org",
    pickup: "Saturday · 12pm – 3pm", window: "Saturday",
    neighborhood: "Westwood", distance: "8 min walk",
    tags: ["kosher", "hot meal", "microwave ok"], portions: 18,
    matchReason: "Homemade chicken matzo ball soup and fresh challah — fully kosher",
    image: "cool", imgLabel: "[challah soup]", badge: "available now",
    mapLabel: "C", lat: 34.0730, lng: -118.4404,
  },
  {
    id: "l4", title: "Ghormeh Sabzi + Saffron Rice",
    provider: "Maman Bahrami", providerType: "home cook",
    pickup: "Today · 5pm – 8pm", window: "tonight",
    neighborhood: "Brentwood", distance: "20 min walk",
    tags: ["halal", "gluten-free", "hot meal", "microwave ok"], portions: 8,
    matchReason: "40-year family recipe — halal herb stew with lamb and crispy tahdig",
    image: "plum", imgLabel: "[ghormeh sabzi]", badge: "available now",
    mapLabel: "D", lat: 34.0602, lng: -118.4810,
  },
  {
    id: "l5", title: "Diddy Riese End-of-Day Cookies",
    provider: "Diddy Riese", providerType: "restaurant",
    pickup: "Tonight · 9pm – 10pm", window: "tonight",
    neighborhood: "Westwood Village", distance: "10 min walk",
    tags: ["vegetarian", "grab-n-go"], portions: 60,
    matchReason: "Westwood's legendary cookie spot donates day-old cookies nightly",
    image: "butter", imgLabel: "[cookies]", badge: "serving now",
    mapLabel: "E", lat: 34.0636, lng: -118.4468,
  },
  {
    id: "l6", title: "Chole Bhature",
    provider: "Aryan", providerType: "home cook",
    pickup: "Today · 1pm – 4pm", window: "this afternoon",
    neighborhood: "UCLA Campus", distance: "3 min walk",
    tags: ["vegan", "hot meal", "microwave ok"], portions: 7,
    matchReason: "Spiced chickpea curry with fluffy fried bhature — made for a study group",
    image: "warm", imgLabel: "[chole bhature]", badge: "available now",
    mapLabel: "F", lat: 34.0702, lng: -118.4500,
  },
]

export const RESOURCES = [
  { id: "r1", title: "CalFresh enrollment — food assistance for students", kicker: "benefits", time: "apply online", image: "cool" },
  { id: "r2", title: "UCLA Basic Needs Hub — free resources on campus", kicker: "on campus", time: "open weekdays", image: "sage" },
  { id: "r3", title: "Westwood farmers market every Thursday", kicker: "fresh produce", time: "Thurs 2–7pm", image: "plum" },
  { id: "r4", title: "Bruin Shelter — short-term housing support", kicker: "housing", time: "referral-based", image: "warm" },
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

export const RECIPES = {
  Persian: {
    title: "Making the most of ghormeh sabzi",
    tips: [
      { h: "Tonight", b: "Serve over the saffron rice — it's ready as-is. The dried limes give it depth." },
      { h: "Tomorrow", b: "Add a little water and simmer to loosen the stew. Tastes better the next day." },
      { h: "Stretch it", b: "Mix leftover stew with eggs for a quick herby scramble." },
    ],
    safety: "Refrigerate within 2 hours. Keeps 4 days covered. Reheat until steaming.",
  },
  Ethiopian: {
    title: "Enjoying doro wat & injera",
    tips: [
      { h: "Tonight", b: "Tear injera and scoop the wat — eat together, it's meant to be hands-on." },
      { h: "Tomorrow", b: "Leftover injera crisps up in a dry pan. Use as a flatbread with the stew." },
      { h: "Heads up", b: "Injera ferments — keep refrigerated and eat within 2 days." },
    ],
    safety: "Refrigerate within 2 hours. Consume injera within 2 days.",
  },
  Korean: {
    title: "Getting the most from kimchi jjigae",
    tips: [
      { h: "Tonight", b: "Eat hot with the rice. The broth is the best part — don't leave it." },
      { h: "Tomorrow", b: "Reboil for 5 minutes — jjigae tastes even better reheated." },
      { h: "Stretch it", b: "Crack an egg into the simmering stew for extra protein." },
    ],
    safety: "Refrigerate within 2 hours. Good for 3–4 days. Reheat fully.",
  },
  Lebanese: {
    title: "Kofta & toum — a few ideas",
    tips: [
      { h: "Tonight", b: "Eat warm with the toum and parsley salad — the garlic sauce makes it." },
      { h: "Tomorrow", b: "Slice cold kofta into pita with the pickled turnip. No heating needed." },
      { h: "Stretch it", b: "Crumble kofta over rice with a fried egg for a full meal." },
    ],
    safety: "Refrigerate within 2 hours. Good for 3 days. Reheat kofta until hot throughout.",
  },
  Mexican: {
    title: "Getting the most from your tamales",
    tips: [
      { h: "Tonight", b: "Steam or microwave in the husk for 90 seconds. Peel and eat." },
      { h: "Tomorrow", b: "Pan-fry without the husk for crispy edges. Top with salsa or hot sauce." },
      { h: "Stretch it", b: "Unwrap and slice — tamale 'croutons' in soup or with eggs." },
    ],
    safety: "Refrigerate in husks within 2 hours. Good for 5 days or freeze up to 3 months.",
  },
  'North Indian': {
    title: "Chole bhature — a few ideas",
    tips: [
      { h: "Tonight", b: "Eat the bhature warm and fluffy. The chole only gets better as it sits." },
      { h: "Tomorrow", b: "Reheat chole with a splash of water. Eat with toast if the bhature is gone." },
      { h: "Stretch it", b: "Add a can of chickpeas to the leftover chole to double the portions." },
    ],
    safety: "Refrigerate within 2 hours. Chole keeps 4 days. Bhature best eaten same day.",
  },
  'Pantry Staples': {
    title: "Making pantry staples go far",
    tips: [
      { h: "Tonight", b: "Cook the rice with twice the water and a pinch of salt. Add canned beans warm." },
      { h: "Tomorrow", b: "Mash beans with olive oil and spread on toast with sliced banana." },
      { h: "Stretch it", b: "Oats with banana and a drizzle of anything sweet — 5-minute breakfast." },
    ],
    safety: "Store dry goods in a cool dry place. Refrigerate anything opened.",
  },
  default: {
    title: "A note from FULL",
    tips: [
      { h: "Tonight", b: "Eat it as-is — it's ready and balanced. No prep needed." },
      { h: "Tomorrow", b: "Reheat with a splash of water to keep it moist. Add hot sauce if you have it." },
      { h: "Stretch it", b: "Pair with eggs or toast to make the meal go further." },
    ],
    safety: "Refrigerate within 2 hours. Good for 3–4 days covered. Reheat until steaming.",
  },
}
