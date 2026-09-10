/* ECLIPSE '26 — static content data
   Swap these arrays out for a real API/CMS later; the rest of the app
   only depends on the shapes below (id, name, price, ...). */

const PASSES = [
  {
    id: "bronze",
    name: "Bronze",
    tagline: "Get in the door",
    price: 499,
    perks: [
      "All 3 days, general grounds access",
      "Open-air stage viewing",
      "Standard entry queue",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    tagline: "For the regulars",
    price: 899,
    perks: [
      "Everything in Bronze",
      "Priority entry to one headline show",
      "10% off festival merch",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "Skip the lines",
    price: 1499,
    perks: [
      "Everything in Silver",
      "Backstage lounge access",
      "Free festival tee",
      "Skip-the-line at all food stalls",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    tagline: "The whole show",
    price: 2499,
    perks: [
      "Everything in Gold",
      "Meet & greet with one headliner",
      "Reserved front-row viewing",
      "Exclusive afterparty entry",
    ],
  },
];

const ARTISTS = [
  {
    id: "nova-shore",
    name: "Nova Shore",
    genre: "Electronic / House",
    day: "Day 1 · Main Stage",
    blurb: "Sunset-to-midnight house sets built for a crowd that doesn't sit down.",
    img: "https://picsum.photos/seed/nova-shore/480/360",
  },
  {
    id: "the-tremors",
    name: "The Tremors",
    genre: "Indie Rock",
    day: "Day 1 · Amphitheatre",
    blurb: "Four-piece indie outfit known for turning small rooms into singalongs.",
    img: "https://picsum.photos/seed/the-tremors/480/360",
  },
  {
    id: "arka-verses",
    name: "Arka Verses",
    genre: "Hip-Hop",
    day: "Day 2 · Main Stage",
    blurb: "Bars-first rapper with a live band backing every verse.",
    img: "https://picsum.photos/seed/arka-verses/480/360",
  },
  {
    id: "ragasm",
    name: "Ragasm",
    genre: "Classical Fusion",
    day: "Day 2 · Open Lawns",
    blurb: "Carnatic vocals over electronic percussion — a genuine collision of eras.",
    img: "https://picsum.photos/seed/ragasm/480/360",
  },
  {
    id: "static-parade",
    name: "Static Parade",
    genre: "Alt Rock",
    day: "Day 3 · Amphitheatre",
    blurb: "Loud, unpolished, and exactly what a closing night needs.",
    img: "https://picsum.photos/seed/static-parade/480/360",
  },
  {
    id: "midnight-vinyl",
    name: "Midnight Vinyl",
    genre: "Lo-fi / Chill",
    day: "Day 3 · Late Lounge",
    blurb: "The wind-down set for the last hour of the last night.",
    img: "https://picsum.photos/seed/midnight-vinyl/480/360",
  },
];

const FOOD = [
  { id: "wood-pizza", name: "Wood-Fired Pizza", tag: "Veg", price: 220, icon: "🍕" },
  { id: "momos", name: "Steamed Momos", tag: "Veg / Non-Veg", price: 120, icon: "🥟" },
  { id: "cold-coffee", name: "Cold Coffee", tag: "Veg", price: 90, icon: "🥤" },
  { id: "loaded-fries", name: "Loaded Fries", tag: "Veg", price: 150, icon: "🍟" },
  { id: "sundae", name: "Ice Cream Sundae", tag: "Veg", price: 130, icon: "🍨" },
  { id: "wrap", name: "Butter Chicken Wrap", tag: "Non-Veg", price: 180, icon: "🌯" },
];

const GAMES = [
  { id: "laser-tag", name: "Laser Tag Arena", price: 150, icon: "🔦", desc: "15-minute team match, gear included." },
  { id: "vr-zone", name: "VR Zone", price: 180, icon: "🥽", desc: "Three rides, one headset, zero regrets." },
  { id: "escape-room", name: "Escape Room", price: 200, icon: "🗝️", desc: "45 minutes, one team, one lock to beat." },
  { id: "gaming-arena", name: "Gaming Arena Pass", price: 100, icon: "🎮", desc: "All-day access to the console/PC bay." },
  { id: "bungee-run", name: "Bungee Run", price: 80, icon: "🏃", desc: "Sprint, stretch, get yanked back. Repeat." },
  { id: "henna-tattoo", name: "Henna & Tattoo Stall", price: 60, icon: "🎨", desc: "Temporary art, permanent photos." },
];
