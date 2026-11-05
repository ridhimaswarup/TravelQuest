const $ = (id) => document.getElementById(id);

// Returns an SVG icon from the sprite in index.html, e.g. icon("pin") or icon("sun", "big")
const icon = (name, extraClass = "") => `<svg class="icon ${extraClass}"><use href="#i-${name}"/></svg>`;

const money = (n, code = "INR") =>
  new Intl.NumberFormat(code === "INR" ? "en-IN" : "en", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(n);

/* ----- dates (all in local time, so there are no timezone shifts) ----- */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => new Date(s + "T00:00:00");

function dateRange(startISO, endISO) {
  const out = [];
  const d = parseISO(startISO), end = parseISO(endISO);
  while (d <= end && out.length < 31) { out.push(toISO(d)); d.setDate(d.getDate() + 1); }
  return out;
}

function shiftYear(iso, years) {
  const d = parseISO(iso);
  d.setFullYear(d.getFullYear() + years);
  return toISO(d);
}

const average = (list) => list.reduce((a, b) => a + b, 0) / list.length;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed (" + res.status + ")");
  return res.json();
}

// Same as fetchJSON, but tries again once after a short pause (free APIs sometimes hiccup or rate-limit for a second)
async function fetchRetry(url, tries = 2) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try { return await fetchJSON(url); }
    catch (err) { lastError = err; if (i < tries - 1) await new Promise((r) => setTimeout(r, 700)); }
  }
  throw lastError;
}



// Shared "know before you go" facts for every place in India (a place can override any of them)
const IN_KNOW = { plug: "Types C, D, M · 230V", emergency: "112 (all emergencies)", tipping: "About 10% at restaurants if no service charge is added",
  phrases: [["Hello", "Namaste"], ["Thank you", "Dhanyavaad"], ["How much?", "Kitna hua?"]] };

/* Songs: `youtubeId` is optional. If it is missing, still "PASTE_VIDEO_ID", or YouTube refuses to play it here
   (many official videos block embedding, and YouTube also refuses pages opened as file://), the song box
   automatically plays a free 30-second preview from the iTunes catalogue instead. So every song works with no setup. */
const DESTINATIONS = [
  /* ---------- India ---------- */
  { name: "Goa", country: "India", region: "india", icon: "waves", cur: "INR", coords: [15.4909, 73.8278],
    colors: ["#4f6b6e", "#a8785a"], tags: ["Beaches", "Nightlife", "Food"], description: "Sun, sand, seafood and sunset parties.",
    food: [["Goan fish curry rice", "Ritz Classic", "Panaji"], ["Bebinca (layered dessert)", "Confeitaria 31 de Janeiro", "Panaji"]],
    shops: [["Anjuna Flea Market", "Anjuna", "Beachwear, handicrafts and jewellery."], ["Mapusa Market", "Mapusa", "Spices, cashews and Goan sausages."]],
    know: { ...IN_KNOW, language: "Konkani, English, Hindi", tip: "Carry cash for beach shacks and flea markets, and note that many close in the monsoon." },
    outfits: ["Cotton shirt", "Shorts", "Sunglasses", "Sandals"],
    cafes: [["Artjuna Café", "Anjuna", 4.5, "₹₹", "Garden café with great breakfast."], ["Infantaria", "Calangute", 4.3, "₹", "Local bakery favourite."], ["Fisherman's Wharf", "Cavelossim", 4.4, "₹₹₹", "Riverside seafood dinners."]] },
  { name: "Shimla", country: "India", region: "india", icon: "mountain", cur: "INR", coords: [31.1048, 77.1734],
    colors: ["#4a5a4e", "#7f9582"], tags: ["Mountains", "Snow", "Relaxation"], description: "Colonial charm in the Himalayan foothills.",
    food: [["Chaat and sweets", "Baljees", "Mall Road"], ["South Indian snacks and coffee", "Indian Coffee House", "Mall Road"]],
    shops: [["Lakkar Bazaar", "Near The Ridge", "Wooden crafts and walking sticks."], ["Mall Road", "Central Shimla", "Woollens, shawls and souvenirs."]],
    know: { ...IN_KNOW, language: "Hindi, Pahari, English", tip: "Weather turns fast, so keep a light jacket handy even in summer." },
    outfits: ["Warm jacket", "Sweater", "Jeans", "Boots"],
    cafes: [["Wake & Bake", "Mall Road", 4.4, "₹₹", "Cosy Himalayan view café."], ["Indian Coffee House", "Mall Road", 4.2, "₹", "Retro classic since 1957."]] },
  { name: "Manali", country: "India", region: "india", icon: "mountain", cur: "INR", coords: [32.2396, 77.1887],
    colors: ["#3f4c5c", "#7c8fa3"], tags: ["Adventure", "Snow", "Nature"], description: "Rivers, rides and snowy Himalayan passes.",
    food: [["Fresh trout", "Johnson's Cafe", "Manali"], ["Momos and thukpa", "Chopsticks", "Mall Road"]],
    shops: [["Tibetan Market", "Manali", "Shawls, caps and handicrafts."], ["Mall Road", "Manali", "Woollens and Kullu souvenirs."]],
    know: { ...IN_KNOW, language: "Hindi, Pahari, English", tip: "Altitude can cause headaches, so go slow on day one and drink plenty of water." },
    outfits: ["Jacket", "Sweater", "Jeans", "Boots"],
    cafes: [["Cafe 1947", "Old Manali", 4.5, "₹₹", "Riverside hangout."], ["Drifters' Cafe", "Old Manali", 4.3, "₹₹", "Backpacker favourite."]],
    song: { title: "Illahi", artist: "Arijit Singh · Yeh Jawaani Hai Deewani", youtubeId: "fdubeMFwuGs", start: 3, end: 33,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your Manali trip" } },
  { name: "Kedarnath", country: "India", region: "india", icon: "landmark", cur: "INR", coords: [30.7352, 79.0669],
    colors: ["#5e4638", "#a8704a"], tags: ["Spiritual", "Trekking", "Mountains"], description: "A sacred Himalayan trek to the ancient shrine.",
    food: [["Aloo paratha and chai", "Tea Stall", "Rambara"], ["Hot dal-chawal meals", "Local Dhaba", "Gaurikund"]],
    shops: [["Gaurikund Market", "Gaurikund", "Prasad, rudraksha and warm gloves."]],
    know: { ...IN_KNOW, language: "Hindi, Garhwali", tip: "Phone networks are patchy on the trek, so download offline maps before you go." },
    outfits: ["Padded jacket", "Gloves", "Trek pants", "Trek shoes"],
    cafes: [["Local Dhaba", "Gaurikund", 4.0, "₹", "Hot meals on the trail."], ["Tea Stall", "Rambara", 4.1, "₹", "Chai with mountain views."]] },
  { name: "Mumbai", country: "India", region: "india", icon: "building", cur: "INR", coords: [19.076, 72.8777],
    colors: ["#38454f", "#a67c52"], tags: ["City", "Food", "Entertainment"], description: "The city that never sleeps — Bollywood and vada pav.",
    food: [["Vada pav", "Ashok Vada Pav", "Dadar"], ["Pav bhaji", "Sardar Pav Bhaji", "Tardeo"]],
    shops: [["Colaba Causeway", "Colaba", "Bags, jewellery and souvenirs."], ["Fashion Street", "Churchgate", "Budget clothes and accessories."]],
    know: { ...IN_KNOW, language: "Marathi, Hindi, English", tip: "Local trains are the fastest way around, but avoid peak hours with luggage." },
    outfits: ["Cotton tee", "Light jeans", "Sneakers", "Sunglasses"],
    cafes: [["Kala Ghoda Café", "Fort", 4.5, "₹₹", "Artsy brunch spot."], ["Leopold Café", "Colaba", 4.2, "₹₹", "Iconic since 1871."]] },
  { name: "Udaipur", country: "India", region: "india", icon: "landmark", cur: "INR", coords: [24.5854, 73.7125],
    colors: ["#5a4658", "#a58a5a"], tags: ["Heritage", "Lakes", "Romance"], description: "The City of Lakes and royal palaces.",
    food: [["Mewari thali and millet dishes", "Millets of Mewar", "Old City"], ["Lakeside Rajasthani dinner", "Ambrai", "Lake Pichola"]],
    shops: [["Hathi Pol Bazaar", "Old City", "Miniature paintings, puppets and textiles."], ["Shilpgram", "Havala", "Rajasthani crafts in a village-style fair."]],
    know: { ...IN_KNOW, language: "Hindi, Mewari, English", tip: "Bargain politely in the bazaars, and dress modestly at temples and palaces." },
    outfits: ["Kurta / dress", "Sun hat", "Sunglasses", "Juttis"],
    cafes: [["Ambrai", "Lake Pichola", 4.6, "₹₹₹", "Dinner facing the City Palace."], ["Jheel's Ginger Coffee Bar", "Gangaur Ghat", 4.4, "₹₹", "Lakeside coffee."]],
    // Optional: put the part after "v=" of the YouTube link of "Masakali" in youtubeId. Left as is, the iTunes preview plays.
    song: { title: "Masakali", artist: "Mohit Chauhan · Delhi-6", youtubeId: "SS3lIQdKP-A", start: 15, end: 35,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your Udaipur trip" } },
  { name: "Kerala", country: "India", region: "india", icon: "leaf", cur: "INR", coords: [9.9312, 76.2673],
    colors: ["#3f5a49", "#6f9a80"], tags: ["Backwaters", "Nature", "Relaxation"], description: "Houseboats, tea hills and Ayurvedic calm.",
    food: [["Puttu and kadala curry", "Dhe Puttu", "Kochi"], ["Malabar biryani", "Kayees Rahmathulla Café", "Mattancherry"]],
    shops: [["Jew Town Spice Market", "Mattancherry", "Spices, tea and antiques."], ["Broadway Market", "Ernakulam", "Spices, cashews and textiles."]],
    know: { ...IN_KNOW, language: "Malayalam, English", phrases: [["Hello", "Namaskaram"], ["Thank you", "Nanni"], ["How much?", "Ethra aanu?"]], tip: "Carry a light raincoat, because showers can start suddenly outside winter." },
    outfits: ["Breathable tee", "Shorts", "Rain jacket", "Sandals"],
    cafes: [["Kashi Art Café", "Fort Kochi", 4.5, "₹₹", "Gallery café."], ["Dhe Puttu", "Kochi", 4.3, "₹₹", "Kerala breakfast classics."]] },

  /* ---------- Abroad ---------- */
  { name: "Paris", country: "France", region: "abroad", icon: "landmark", cur: "EUR", coords: [48.8566, 2.3522],
    colors: ["#6b4450", "#b27483"], tags: ["Art", "Fashion", "Romance"], description: "Cafés, museums and the glittering Eiffel Tower.",
    food: [["Pistachio escargot pastry", "Du Pain et des Idées", "10th arr."], ["Buckwheat crêpes", "Breizh Café", "Le Marais"]],
    shops: [["Galeries Lafayette", "Opéra", "Fashion, beauty and a rooftop terrace."], ["Marché aux Puces de Saint-Ouen", "Saint-Ouen", "Vintage furniture and finds."]],
    know: { plug: "Types C, E · 230V", emergency: "112 (15 ambulance, 17 police)", language: "French", tipping: "Service is included; rounding up is a nice extra", phrases: [["Hello", "Bonjour"], ["Thank you", "Merci"], ["The bill, please", "L'addition, s'il vous plaît"]], tip: "Say “bonjour” when you walk into a shop. It really matters." },
    outfits: ["Trench coat", "Sweater", "Jeans", "Sneakers"],
    cafes: [["Café de Flore", "Saint-Germain", 4.3, "€€€", "Legendary literary café."], ["Du Pain et des Idées", "10th arr.", 4.7, "€", "Best pastries in town."]],
    // Optional: put the part after "v=" of the YouTube link of "Amour Plastique" in youtubeId. Left as is, the iTunes preview plays.
    song: { title: "Paris", artist: "The Chainsmokers", youtubeId: "RhU9MZ98jxo", start: 13, end: 43,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your Paris trip" } },
  { name: "London", country: "United Kingdom", region: "abroad", icon: "landmark", cur: "GBP", coords: [51.5072, -0.1276],
    colors: ["#3a404d", "#a5575c"], tags: ["History", "Culture", "Shopping"], description: "Royal history, museums and markets.",
    food: [["Bacon naan roll", "Dishoom", "Covent Garden"], ["Salt beef bagel", "Beigel Bake", "Brick Lane"]],
    shops: [["Camden Market", "Camden", "Vintage clothes, street food and crafts."], ["Liberty London", "Regent Street", "Fabrics, gifts and the famous prints."]],
    know: { plug: "Type G · 230V", emergency: "999 or 112", language: "English", tipping: "10–12.5% if service isn't already included", phrases: [["Thank you", "Cheers"], ["Excuse me", "Sorry"], ["Subway", "The Tube"]], tip: "Tap a contactless card or phone on the Tube instead of buying paper tickets." },
    outfits: ["Waterproof coat", "Sweater", "Jeans", "Walking boots"],
    cafes: [["Monmouth Coffee", "Borough Market", 4.6, "££", "Famous for flat whites."], ["Dishoom", "Covent Garden", 4.7, "££", "Bombay-style café."]] },
  { name: "New York", country: "USA", region: "abroad", icon: "building", cur: "USD", coords: [40.7128, -74.006],
    colors: ["#2f2e2e", "#b08a3e"], tags: ["City", "Food", "Entertainment"], description: "Skyscrapers, Broadway and pizza slices.",
    food: [["Classic cheese slice", "Joe's Pizza", "Greenwich Village"], ["Pastrami on rye", "Katz's Delicatessen", "Lower East Side"]],
    shops: [["Strand Bookstore", "Greenwich Village", "Books by the mile, new and used."], ["Chelsea Market", "Chelsea", "Food, gifts and small makers."]],
    know: { plug: "Types A, B · 120V (you may need a converter)", emergency: "911", language: "English (and many more)", tipping: "18–20% at restaurants, it is expected", phrases: [["Subway", "The train"], ["Bathroom", "Restroom"], ["Takeaway", "To go"]], tip: "Most subway rides work with a contactless tap, so you rarely need a ticket." },
    outfits: ["Light jacket", "Layers", "Jeans", "Sneakers"],
    cafes: [["Russ & Daughters", "Lower East Side", 4.6, "$$", "Classic bagels."], ["Joe Coffee", "Greenwich Village", 4.4, "$$", "NYC coffee staple."]],
    // Video V8gvSEtzOQg, clip starts at 3:18 (198 s) and plays 30 s. If YouTube ever blocks it, the box falls back to the iTunes preview automatically.
    song: { title: "Empire State of Mind", artist: "JAY-Z ft. Alicia Keys", youtubeId: "V8gvSEtzOQg", start: 198, end: 228,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your New York trip" } },
  { name: "Switzerland", country: "Europe", region: "abroad", icon: "mountain", cur: "CHF", coords: [46.6863, 7.8632],
    colors: ["#44566b", "#b0615c"], tags: ["Alps", "Nature", "Scenic"], description: "Snowy peaks, lakes and scenic train rides.",
    food: [["Swiss chocolate and ice cream", "Confiserie Sprüngli", "Zürich"], ["Rösti and Swiss classics", "Zeughauskeller", "Zürich"]],
    shops: [["Bahnhofstrasse", "Zürich", "Swiss watches, chocolate and luxury shops."], ["Bucherer", "Lucerne", "Swiss watches."]],
    know: { plug: "Type J · 230V", emergency: "112 (144 ambulance, 117 police)", language: "German, French, Italian", tipping: "Service is included; rounding up is common", phrases: [["Hello", "Grüezi"], ["Thank you", "Danke / Merci"], ["Excuse me", "Entschuldigung"]], tip: "Public transport is excellent but pricey, so check rail passes before buying tickets." },
    outfits: ["Down jacket", "Gloves", "Hiking pants", "Hiking boots"],
    cafes: [["Café Luce", "Lucerne", 4.5, "$$$", "Lake views and cakes."], ["Sprüngli", "Zürich", 4.6, "$$$", "Swiss chocolate heaven."]],
    song: { title: "Home", artist: "Esmzeros", youtubeId: "DHEOF_rcND8", start: 123, end: 153,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your Switzerland trip" } },
  { name: "Norway", country: "Europe", region: "abroad", icon: "snow", cur: "NOK", coords: [59.9139, 10.7522],
    colors: ["#3b5456", "#6b9a8f"], tags: ["Fjords", "Nature", "Northern Lights"], description: "Dramatic fjords and aurora skies.",
    food: [["Fresh seafood and fish soup", "Fiskeriet", "Oslo"], ["Smoked salmon and fish", "Bergen Fish Market", "Bergen"]],
    shops: [["Husfliden", "Oslo", "Norwegian knitwear and crafts."], ["Mathallen Food Hall", "Oslo", "Brown cheese, chocolate and local food gifts."]],
    know: { plug: "Types C, F · 230V", emergency: "112 police, 113 ambulance", language: "Norwegian (English widely spoken)", tipping: "Not expected; rounding up is appreciated", phrases: [["Hello", "Hei"], ["Thank you", "Takk"], ["Excuse me", "Unnskyld"]], tip: "Everything is expensive, so look for supermarket meals and picnic lunches." },
    outfits: ["Winter parka", "Scarf & beanie", "Thermal pants", "Insulated boots"],
    cafes: [["Kaffebrenneriet", "Oslo", 4.5, "$$", "Norwegian coffee roasters."], ["Fiskeriet", "Oslo", 4.4, "$$$", "Fresh seafood."]],
    // Optional: put the part after "v=" of the YouTube link of Sia's "Snowman" in youtubeId. Left as is, the iTunes preview plays.
    song: { title: "Snowman", artist: "Sia", youtubeId: "PASTE_VIDEO_ID", start: 8, end: 38,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your Norway trip" } },
  { name: "Australia", country: "Oceania", region: "abroad", icon: "sun", cur: "AUD", coords: [-33.8688, 151.2093],
    colors: ["#4f6e6c", "#b5714a"], tags: ["Beaches", "Wildlife", "Adventure"], description: "Reefs, kangaroos and the Outback.",
    food: [["Flat white coffee", "Single O", "Surry Hills"], ["Italian pastries and cannoli", "Brunetti", "Carlton"]],
    shops: [["Queen Victoria Market", "Melbourne", "Fresh food, souvenirs and local goods."], ["The Rocks Markets", "Sydney", "Handmade crafts and gifts."]],
    know: { plug: "Type I · 230V", emergency: "000", language: "English", tipping: "Not expected; 10% for great service", phrases: [["Hello", "G'day"], ["Afternoon", "Arvo"], ["You're welcome", "No worries"]], tip: "The sun is strong. Wear sunscreen and a hat even on cloudy days." },
    outfits: ["Light tee", "Shorts", "Cap", "Sandals"],
    cafes: [["Single O", "Surry Hills", 4.5, "$$", "Specialty coffee."], ["Brunetti", "Carlton", 4.4, "$$", "Italian-style café."]] },
  { name: "Seoul", country: "South Korea", region: "abroad", icon: "building", cur: "KRW", coords: [37.5665, 126.978],
    colors: ["#3e4660", "#b0687a"], tags: ["Food", "Fashion", "K-culture"], description: "K-pop, street food and palaces.",
    food: [["Tteokbokki and street food", "Gwangjang Market", "Jongno"], ["Ginseng chicken soup", "Tosokchon Samgyetang", "Jongno"]],
    shops: [["Myeongdong", "Jung-gu", "K-beauty and skincare."], ["Insadong", "Jongno", "Traditional crafts and tea."]],
    know: { plug: "Types C, F · 220V", emergency: "112 police, 119 fire & ambulance", language: "Korean", tipping: "Not customary", phrases: [["Hello", "Annyeonghaseyo"], ["Thank you", "Gamsahamnida"], ["Please give me this", "Igeo juseyo"]], tip: "Get a T-money card for the subway and buses. It works almost everywhere." },
    outfits: ["Trendy jacket", "Knit sweater", "Wide jeans", "Chunky sneakers"],
    cafes: [["Cafe Onion", "Seongsu", 4.5, "₩₩", "Industrial-style bakery."], ["Anthracite Coffee", "Hapjeong", 4.4, "₩₩", "Cool converted factory café."]] },
  { name: "Tokyo", country: "Japan", region: "abroad", icon: "building", cur: "JPY", coords: [35.6762, 139.6503],
    colors: ["#46405c", "#a8688a"], tags: ["Technology", "Food", "Culture"], description: "Neon streets, sushi and quiet temples.",
    food: [["Tonkotsu ramen", "Ichiran Shibuya", "Shibuya"], ["Fresh sushi", "Sushi Zanmai", "Tsukiji"]],
    shops: [["Don Quijote", "Shibuya", "Snacks, gifts and quirky finds."], ["Akihabara", "Akihabara", "Electronics, anime and games."]],
    know: { plug: "Types A, B · 100V", emergency: "110 police, 119 fire & ambulance", language: "Japanese", tipping: "Not customary and can confuse staff", phrases: [["Hello", "Konnichiwa"], ["Thank you", "Arigatou gozaimasu"], ["Excuse me", "Sumimasen"]], tip: "Carry some cash, since small places may not take cards. A Suica card covers trains." },
    outfits: ["Layered outfit", "Comfy sneakers", "Light jacket", "Day backpack"],
    cafes: [["Blue Bottle Kiyosumi", "Koto", 4.5, "¥¥", "Minimal coffee spot."], ["Kayaba Coffee", "Yanaka", 4.4, "¥¥", "Historic wooden café."]],
    // Optional `song`: youtubeId = the part after "v=" in a YouTube link; start/end = seconds of the clip that plays
    song: { title: "Shinunoga e-wa", artist: "Fujii Kaze", youtubeId: "dawrQnvwMTY", start: 56, end: 86,
            label: "TRIP SOUNDTRACK", caption: "30-second hook · soundtrack for your Tokyo trip" } }
];

/* ======================================================================
   3) SPOTS
   Row = [name, area, lat, lon, icon, vibes, best time]
   vibes: R Relaxation · A Adventure · F Food · P Photography · C Culture · S Shopping · N Nature · L Nightlife
   best time: a morning · p afternoon · e evening · \"\" any. icon \"utensils\"/\"coffee\" = food stop (lunch / dinner).
   Most iconic first (they win ties). Coordinates are approximate. To add a place, add one row.
   ====================================================================== */

const SPOTS = {
  Goa: [
    ["Baga Beach", "Baga", 15.5553, 73.7517, "waves", "RLP", "p"],
    ["Fort Aguada", "Candolim", 15.4922, 73.7737, "landmark", "CP", "p"],
    ["Old Goa Churches", "Old Goa", 15.5009, 73.9116, "landmark", "C", "a"],
    ["Sunset at Vagator", "Vagator", 15.6000, 73.7390, "camera", "PRL", "e"],
    ["Anjuna Flea Market", "Anjuna", 15.5731, 73.7418, "bag", "SF", "p"],
    ["Palolem Beach", "Palolem", 15.0100, 74.0232, "waves", "RN", "a"],
    ["Dudhsagar Falls", "Mollem", 15.3144, 74.3143, "mountain", "AN", "a"],
    ["Fontainhas Latin Quarter", "Panjim", 15.4976, 73.8319, "building", "CP", "a"],
    ["Calangute Beach", "Calangute", 15.5440, 73.7553, "waves", "RL", "p"],
    ["Tito's Lane", "Baga", 15.5559, 73.7519, "moon", "L", "e"],
    ["Mapusa Market", "Mapusa", 15.5915, 73.8090, "bag", "SF", "a"],
    ["Chapora Fort", "Chapora", 15.6055, 73.7352, "landmark", "PAC", "p"],
    ["Agonda Beach", "Agonda", 15.0436, 73.9876, "waves", "RN", "p"],
    ["Artjuna Café", "Anjuna", 15.5757, 73.7398, "coffee", "FR", ""],
    ["Infantaria", "Calangute", 15.5470, 73.7545, "coffee", "F", ""],
    ["Fisherman's Wharf", "Cavelossim", 15.1650, 73.9420, "utensils", "FR", ""],
    ["Britto's", "Baga", 15.5585, 73.7507, "utensils", "FL", ""],
    ["Gunpowder", "Assagao", 15.5932, 73.7792, "utensils", "F", ""]
  ],
  Shimla: [
    ["The Ridge", "Central Shimla", 31.1043, 77.1722, "camera", "CPR", "e"],
    ["Mall Road", "Central Shimla", 31.1034, 77.1700, "bag", "SFR", "e"],
    ["Jakhu Temple", "Jakhu Hill", 31.1011, 77.1846, "landmark", "CAN", "a"],
    ["Kufri", "Kufri", 31.0984, 77.2678, "mountain", "AN", "a"],
    ["Christ Church", "The Ridge", 31.1046, 77.1727, "landmark", "CP", "p"],
    ["Scandal Point", "Central Shimla", 31.1040, 77.1709, "camera", "P", "e"],
    ["Viceregal Lodge", "Observatory Hill", 31.1005, 77.1450, "landmark", "CPN", "a"],
    ["Naldehra", "Naldehra", 31.0114, 77.1536, "leaf", "NAR", "p"],
    ["Annandale Ground", "Annandale", 31.1099, 77.1964, "leaf", "NR", "p"],
    ["Himachal State Museum", "Shimla", 31.1008, 77.1586, "landmark", "C", "p"],
    ["Chail", "Chail", 30.9667, 77.2000, "mountain", "NR", "a"],
    ["Wake & Bake", "Mall Road", 31.1031, 77.1704, "coffee", "FR", ""],
    ["Indian Coffee House", "Mall Road", 31.1033, 77.1710, "coffee", "FC", ""],
    ["Ashiana Restaurant", "The Ridge", 31.1036, 77.1722, "utensils", "F", ""],
    ["Baljees", "Mall Road", 31.1028, 77.1702, "utensils", "FS", ""]
  ],
  Manali: [
    ["Solang Valley", "Solang", 32.3161, 77.1569, "mountain", "AP", "a"],
    ["Hadimba Temple", "Manali", 32.2480, 77.1809, "landmark", "CN", "a"],
    ["Old Manali", "Old Manali", 32.2610, 77.1790, "building", "CFRS", "e"],
    ["Rohtang Pass", "Rohtang", 32.3716, 77.2466, "mountain", "AP", "a"],
    ["River Rafting on the Beas", "Pirdi", 31.9886, 77.1105, "waves", "A", "a"],
    ["Jogini Falls", "Vashisht", 32.2740, 77.1930, "leaf", "NA", "a"],
    ["Vashisht Hot Springs", "Vashisht", 32.2662, 77.1885, "waves", "RC", "p"],
    ["Naggar Castle", "Naggar", 32.1244, 77.1740, "landmark", "CP", "p"],
    ["Manu Temple", "Old Manali", 32.2599, 77.1759, "landmark", "C", "p"],
    ["Mall Road", "Manali", 32.2433, 77.1893, "bag", "SF", "e"],
    ["Tibetan Monastery", "Manali", 32.2440, 77.1895, "landmark", "CR", "p"],
    ["Cafe 1947", "Old Manali", 32.2615, 77.1795, "coffee", "FR", ""],
    ["Drifters' Cafe", "Old Manali", 32.2606, 77.1788, "coffee", "FR", ""],
    ["Johnson's Cafe", "Manali", 32.2467, 77.1842, "utensils", "F", ""],
    ["Chopsticks", "Mall Road", 32.2429, 77.1890, "utensils", "F", ""]
  ],
  Kedarnath: [
    ["Kedarnath Temple", "Kedarnath", 30.7352, 79.0669, "landmark", "C", "a"],
    ["Gaurikund Trek Start", "Gaurikund", 30.6540, 79.0250, "mountain", "AN", "a"],
    ["Shankaracharya Samadhi", "Kedarnath", 30.7347, 79.0665, "landmark", "CR", "p"],
    ["Bhairavnath Temple", "Kedarnath", 30.7335, 79.0680, "landmark", "CP", "p"],
    ["Chorabari Tal", "Kedarnath", 30.7773, 79.0517, "leaf", "NAP", "a"],
    ["Vasuki Tal", "Kedarnath", 30.7780, 79.1000, "mountain", "ANP", "a"],
    ["Sonprayag", "Sonprayag", 30.6250, 79.0010, "leaf", "NR", "p"],
    ["Triyuginarayan Temple", "Triyuginarayan", 30.6500, 79.0900, "landmark", "C", "a"],
    ["Guptkashi Vishwanath Temple", "Guptkashi", 30.5240, 79.0750, "landmark", "C", "a"],
    ["Omkareshwar Temple", "Ukhimath", 30.5147, 79.0863, "landmark", "C", "p"],
    ["Local Dhaba", "Gaurikund", 30.6538, 79.0252, "utensils", "F", ""],
    ["Tea Stall", "Rambara", 30.6850, 79.0470, "coffee", "FN", ""],
    ["GMVN Canteen", "Kedarnath", 30.7345, 79.0655, "utensils", "F", ""]
  ],
  Mumbai: [
    ["Gateway of India", "Colaba", 18.9220, 72.8347, "landmark", "CP", "p"],
    ["Marine Drive", "Nariman Point", 18.9440, 72.8235, "waves", "RP", "e"],
    ["Colaba Causeway", "Colaba", 18.9157, 72.8268, "bag", "SF", "p"],
    ["Elephanta Caves", "Elephanta Island", 18.9633, 72.9315, "landmark", "CA", "a"],
    ["Juhu Beach", "Juhu", 19.0990, 72.8267, "waves", "RF", "e"],
    ["Bandra Street Art", "Bandra West", 19.0596, 72.8295, "camera", "PC", "p"],
    ["Chhatrapati Shivaji Terminus", "Fort", 18.9400, 72.8353, "landmark", "CP", "a"],
    ["Haji Ali Dargah", "Worli", 18.9827, 72.8089, "landmark", "CP", "e"],
    ["Kanheri Caves", "Borivali", 19.2056, 72.9068, "mountain", "CNA", "a"],
    ["Chor Bazaar", "Mutton Street", 18.9608, 72.8280, "bag", "S", "p"],
    ["Siddhivinayak Temple", "Prabhadevi", 19.0170, 72.8302, "landmark", "C", "a"],
    ["Bandstand Promenade", "Bandra", 19.0426, 72.8199, "waves", "RP", "e"],
    ["Chowpatty Beach", "Girgaon", 18.9544, 72.8133, "waves", "FR", "e"],
    ["Kala Ghoda Café", "Fort", 18.9288, 72.8325, "coffee", "FC", ""],
    ["Leopold Café", "Colaba", 18.9226, 72.8315, "utensils", "FL", ""],
    ["Britannia & Co.", "Ballard Estate", 18.9328, 72.8420, "utensils", "FC", ""],
    ["Bademiya", "Colaba", 18.9220, 72.8319, "utensils", "F", ""],
    ["Cafe Mondegar", "Colaba", 18.9236, 72.8318, "utensils", "FL", ""]
  ],
  Udaipur: [
    ["City Palace", "Old City", 24.5764, 73.6835, "landmark", "CP", "a"],
    ["Lake Pichola Boat Ride", "Lake Pichola", 24.5710, 73.6800, "waves", "RP", "e"],
    ["Jag Mandir", "Lake Pichola", 24.5629, 73.6808, "landmark", "CRP", "p"],
    ["Saheliyon Ki Bari", "Udaipur", 24.6003, 73.6921, "leaf", "NR", "a"],
    ["Sajjangarh Fort", "Sajjangarh", 24.5950, 73.6480, "landmark", "PNC", "e"],
    ["Bagore Ki Haveli", "Gangaur Ghat", 24.5798, 73.6812, "landmark", "C", "e"],
    ["Jagdish Temple", "Old City", 24.5791, 73.6832, "landmark", "C", "a"],
    ["Fateh Sagar Lake", "Fateh Sagar", 24.5995, 73.6755, "waves", "RP", "e"],
    ["Ahar Cenotaphs", "Ahar", 24.5900, 73.7230, "landmark", "C", "p"],
    ["Eklingji Temple", "Eklingji", 24.7135, 73.7112, "landmark", "C", "a"],
    ["Hathi Pol Bazaar", "Old City", 24.5805, 73.6825, "bag", "S", "p"],
    ["Kumbhalgarh Fort", "Kumbhalgarh", 25.1528, 73.5870, "landmark", "CAP", "a"],
    ["Ambrai", "Lake Pichola", 24.5774, 73.6790, "utensils", "FR", ""],
    ["Jheel's Ginger Coffee Bar", "Gangaur Ghat", 24.5780, 73.6821, "coffee", "F", ""],
    ["Millets of Mewar", "Old City", 24.5767, 73.6836, "utensils", "F", ""],
    ["Upre by 1559 AD", "Lake Pichola", 24.5783, 73.6797, "utensils", "FR", ""]
  ],
  Kerala: [
    ["Alleppey Houseboat Cruise", "Alappuzha", 9.5100, 76.3400, "waves", "RNP", "a"],
    ["Munnar Tea Gardens", "Munnar", 10.0889, 77.0595, "leaf", "NPR", "a"],
    ["Fort Kochi", "Fort Kochi", 9.9658, 76.2421, "landmark", "CP", "p"],
    ["Kathakali Show", "Fort Kochi", 9.9650, 76.2410, "landmark", "C", "e"],
    ["Periyar Wildlife Sanctuary", "Thekkady", 9.5990, 77.1700, "leaf", "NA", "a"],
    ["Varkala Cliff", "Varkala", 8.7379, 76.7003, "waves", "RPL", "e"],
    ["Chinese Fishing Nets", "Fort Kochi", 9.9684, 76.2418, "camera", "P", "e"],
    ["Mattancherry Palace", "Mattancherry", 9.9577, 76.2594, "landmark", "C", "a"],
    ["Jew Town Spice Market", "Mattancherry", 9.9563, 76.2598, "bag", "SF", "p"],
    ["Athirappilly Waterfalls", "Athirappilly", 10.2852, 76.5698, "leaf", "NP", "a"],
    ["Kumarakom Bird Sanctuary", "Kumarakom", 9.6170, 76.4300, "leaf", "NR", "a"],
    ["Eravikulam National Park", "Munnar", 10.1676, 77.0522, "mountain", "NA", "a"],
    ["Marari Beach", "Mararikulam", 9.6050, 76.2950, "waves", "R", "p"],
    ["Kashi Art Café", "Fort Kochi", 9.9655, 76.2427, "coffee", "FC", ""],
    ["Dhe Puttu", "Kochi", 9.9570, 76.2990, "utensils", "F", ""],
    ["Kayees Rahmathulla Café", "Mattancherry", 9.9610, 76.2580, "utensils", "F", ""],
    ["Teapot Café", "Fort Kochi", 9.9650, 76.2428, "coffee", "FR", ""]
  ],
  Paris: [
    ["Eiffel Tower", "7th arr.", 48.8584, 2.2945, "landmark", "CP", "e"],
    ["Louvre Museum", "1st arr.", 48.8606, 2.3376, "landmark", "C", "a"],
    ["Montmartre & Sacré-Cœur", "Montmartre", 48.8867, 2.3431, "landmark", "CPR", "p"],
    ["Seine River Cruise", "Pont Neuf", 48.8570, 2.3413, "waves", "RP", "e"],
    ["Notre-Dame Area", "Île de la Cité", 48.8530, 2.3499, "landmark", "C", "a"],
    ["Palace of Versailles", "Versailles", 48.8049, 2.1204, "landmark", "CPN", "a"],
    ["Musée d'Orsay", "7th arr.", 48.8600, 2.3266, "landmark", "C", "p"],
    ["Arc de Triomphe & Champs-Élysées", "8th arr.", 48.8738, 2.2950, "bag", "CSP", "p"],
    ["Luxembourg Gardens", "6th arr.", 48.8462, 2.3371, "leaf", "RN", "a"],
    ["Le Marais", "Marais", 48.8575, 2.3622, "bag", "SCF", "p"],
    ["Sainte-Chapelle", "Île de la Cité", 48.8554, 2.3450, "landmark", "CP", "a"],
    ["Moulin Rouge", "Pigalle", 48.8841, 2.3323, "moon", "L", "e"],
    ["Canal Saint-Martin", "10th arr.", 48.8710, 2.3640, "waves", "RLP", "e"],
    ["Café de Flore", "Saint-Germain", 48.8541, 2.3326, "coffee", "FC", ""],
    ["Du Pain et des Idées", "10th arr.", 48.8711, 2.3631, "coffee", "F", ""],
    ["Breizh Café", "Marais", 48.8631, 2.3615, "utensils", "F", ""],
    ["Marché des Enfants Rouges", "Marais", 48.8630, 2.3626, "utensils", "FS", ""],
    ["Angelina", "Rue de Rivoli", 48.8651, 2.3285, "coffee", "FR", ""]
  ],
  London: [
    ["Tower of London", "Tower Hill", 51.5081, -0.0759, "landmark", "C", "a"],
    ["British Museum", "Bloomsbury", 51.5194, -0.1270, "landmark", "C", "a"],
    ["Camden Market", "Camden", 51.5415, -0.1465, "bag", "SF", "p"],
    ["London Eye", "South Bank", 51.5033, -0.1196, "camera", "P", "e"],
    ["Buckingham Palace", "Westminster", 51.5014, -0.1419, "landmark", "CP", "a"],
    ["Notting Hill & Portobello Road", "Notting Hill", 51.5171, -0.2056, "bag", "SPC", "p"],
    ["Tower Bridge", "Tower Hill", 51.5055, -0.0754, "camera", "P", "p"],
    ["Hyde Park", "Kensington", 51.5073, -0.1657, "leaf", "RN", "a"],
    ["Covent Garden", "Covent Garden", 51.5117, -0.1226, "bag", "SF", "p"],
    ["Borough Market", "Southwark", 51.5055, -0.0910, "bag", "FS", "a"],
    ["Soho", "Soho", 51.5136, -0.1337, "moon", "L", "e"],
    ["Westminster Abbey & Big Ben", "Westminster", 51.4994, -0.1273, "landmark", "CP", "a"],
    ["Kew Gardens", "Kew", 51.4787, -0.2956, "leaf", "NR", "a"],
    ["Tate Modern", "Bankside", 51.5076, -0.0994, "landmark", "C", "p"],
    ["Monmouth Coffee", "Borough Market", 51.5052, -0.0905, "coffee", "F", ""],
    ["Dishoom", "Covent Garden", 51.5131, -0.1269, "utensils", "FC", ""],
    ["The Wolseley", "Piccadilly", 51.5072, -0.1415, "utensils", "F", ""],
    ["Beigel Bake", "Brick Lane", 51.5247, -0.0718, "utensils", "F", ""]
  ],
  "New York": [
    ["Statue of Liberty", "Liberty Island", 40.6892, -74.0445, "landmark", "CP", "a"],
    ["Central Park", "Manhattan", 40.7829, -73.9654, "leaf", "RN", "a"],
    ["Times Square", "Midtown", 40.7580, -73.9855, "bag", "SLP", "e"],
    ["Brooklyn Bridge", "Brooklyn", 40.7061, -73.9969, "camera", "PR", "e"],
    ["Empire State Building", "Midtown", 40.7484, -73.9857, "building", "P", "e"],
    ["The High Line", "Chelsea", 40.7480, -74.0048, "leaf", "RPN", "p"],
    ["Metropolitan Museum of Art", "Upper East Side", 40.7794, -73.9632, "landmark", "C", "a"],
    ["9/11 Memorial & Museum", "Lower Manhattan", 40.7115, -74.0134, "landmark", "C", "a"],
    ["Chelsea Market", "Chelsea", 40.7424, -74.0061, "bag", "FS", "p"],
    ["DUMBO", "Brooklyn", 40.7033, -73.9881, "camera", "PRC", "p"],
    ["Greenwich Village", "Greenwich Village", 40.7336, -74.0027, "moon", "LC", "e"],
    ["Top of the Rock", "Midtown", 40.7593, -73.9794, "camera", "P", "e"],
    ["Grand Central Terminal", "Midtown", 40.7527, -73.9772, "landmark", "CP", "a"],
    ["Russ & Daughters", "Lower East Side", 40.7224, -73.9883, "utensils", "FC", ""],
    ["Joe Coffee", "Greenwich Village", 40.7330, -74.0006, "coffee", "F", ""],
    ["Katz's Delicatessen", "Lower East Side", 40.7223, -73.9874, "utensils", "FC", ""],
    ["Joe's Pizza", "Greenwich Village", 40.7306, -74.0021, "utensils", "F", ""],
    ["Levain Bakery", "Upper West Side", 40.7797, -73.9803, "coffee", "FR", ""]
  ],
  Switzerland: [
    ["Interlaken", "Interlaken", 46.6863, 7.8632, "waves", "RAN", "a"],
    ["Jungfraujoch", "Jungfrau Region", 46.5475, 7.9851, "mountain", "ANP", "a"],
    ["Chapel Bridge", "Lucerne", 47.0516, 8.3074, "landmark", "CP", "p"],
    ["Zermatt & the Matterhorn", "Zermatt", 46.0207, 7.7491, "mountain", "APN", "a"],
    ["Château de Chillon", "Lake Geneva", 46.4143, 6.9275, "landmark", "CRP", "p"],
    ["Landwasser Viaduct", "Graubünden", 46.6764, 9.6790, "camera", "PN", "p"],
    ["Zürich Old Town", "Zürich", 47.3713, 8.5440, "building", "CS", "a"],
    ["Lauterbrunnen Valley", "Lauterbrunnen", 46.5936, 7.9086, "leaf", "NP", "a"],
    ["Bern Old Town", "Bern", 46.9480, 7.4474, "building", "C", "a"],
    ["Grindelwald First", "Grindelwald", 46.6597, 8.0536, "mountain", "AP", "a"],
    ["Rhine Falls", "Schaffhausen", 47.6779, 8.6153, "leaf", "NP", "a"],
    ["Mount Pilatus", "Lucerne", 46.9786, 8.2523, "mountain", "AN", "a"],
    ["Jet d'Eau", "Geneva", 46.2073, 6.1556, "camera", "RP", "e"],
    ["Café Luce", "Lucerne", 47.0505, 8.3070, "coffee", "F", ""],
    ["Sprüngli", "Zürich", 47.3697, 8.5389, "coffee", "FS", ""],
    ["Zeughauskeller", "Zürich", 47.3704, 8.5390, "utensils", "FC", ""],
    ["Café Schober", "Zürich", 47.3732, 8.5440, "coffee", "F", ""]
  ],
  Norway: [
    ["Geirangerfjord Cruise", "Geiranger", 62.1014, 7.2056, "waves", "NPR", "a"],
    ["Northern Lights Hunt", "Tromsø", 69.6492, 18.9553, "camera", "PAN", "e"],
    ["Lofoten Islands", "Reine", 67.9323, 13.0891, "mountain", "NPA", "a"],
    ["Bryggen Wharf", "Bergen", 60.3971, 5.3240, "landmark", "CP", "p"],
    ["Preikestolen Hike", "Stavanger", 58.9863, 6.1900, "mountain", "AP", "a"],
    ["Oslo Opera House", "Oslo", 59.9075, 10.7530, "landmark", "CP", "p"],
    ["Fram Museum", "Oslo", 59.9031, 10.6998, "landmark", "C", "a"],
    ["Vigeland Sculpture Park", "Oslo", 59.9270, 10.7005, "leaf", "CN", "a"],
    ["Flåm Railway", "Flåm", 60.8627, 7.1138, "mountain", "NP", "a"],
    ["Trolltunga", "Odda", 60.1241, 6.7400, "mountain", "AN", "a"],
    ["Fløyen Viewpoint", "Bergen", 60.3960, 5.3440, "camera", "PNR", "p"],
    ["Nidaros Cathedral", "Trondheim", 63.4269, 10.3969, "landmark", "C", "a"],
    ["Akershus Fortress", "Oslo", 59.9075, 10.7366, "landmark", "CP", "p"],
    ["Kaffebrenneriet", "Oslo", 59.9163, 10.7498, "coffee", "F", ""],
    ["Mathallen Food Hall", "Oslo", 59.9223, 10.7527, "utensils", "FS", ""],
    ["Fiskeriet", "Oslo", 59.9145, 10.7490, "utensils", "F", ""],
    ["Bergen Fish Market", "Bergen", 60.3946, 5.3242, "utensils", "FC", ""]
  ],
  Australia: [
    ["Sydney Opera House", "Sydney", -33.8568, 151.2153, "landmark", "CP", "e"],
    ["Bondi Beach", "Sydney", -33.8915, 151.2767, "waves", "RAP", "a"],
    ["Great Barrier Reef", "Cairns", -16.7570, 145.9740, "waves", "AN", "a"],
    ["Melbourne Laneways", "Melbourne", -37.8167, 144.9692, "camera", "PCF", "p"],
    ["Uluru Sunset", "Uluru", -25.3444, 131.0369, "mountain", "NPC", "e"],
    ["Great Ocean Road", "Victoria", -38.6624, 143.1048, "mountain", "NPA", "a"],
    ["Sydney Harbour Bridge", "Sydney", -33.8523, 151.2108, "landmark", "AP", "p"],
    ["The Rocks", "Sydney", -33.8594, 151.2087, "bag", "CSF", "p"],
    ["Blue Mountains", "Katoomba", -33.7320, 150.3117, "mountain", "NA", "a"],
    ["Queen Victoria Market", "Melbourne", -37.8076, 144.9568, "bag", "FS", "a"],
    ["Daintree Rainforest", "Daintree", -16.1700, 145.4180, "leaf", "NA", "a"],
    ["Manly Beach", "Sydney", -33.7970, 151.2880, "waves", "RF", "p"],
    ["Royal Botanic Gardens", "Melbourne", -37.8304, 144.9796, "leaf", "RN", "a"],
    ["Single O", "Surry Hills", -33.8830, 151.2110, "coffee", "F", ""],
    ["Brunetti", "Carlton", -37.7996, 144.9667, "coffee", "F", ""],
    ["Chin Chin", "Melbourne", -37.8147, 144.9704, "utensils", "FL", ""],
    ["Bennelong", "Sydney Opera House", -33.8571, 151.2152, "utensils", "FC", ""]
  ],
  Seoul: [
    ["Gyeongbokgung Palace", "Jongno", 37.5796, 126.9770, "landmark", "CP", "a"],
    ["Bukchon Hanok Village", "Jongno", 37.5826, 126.9830, "building", "CP", "a"],
    ["Myeongdong Street Food", "Myeongdong", 37.5636, 126.9853, "bag", "FS", "e"],
    ["Hongdae", "Mapo", 37.5563, 126.9237, "moon", "LS", "e"],
    ["N Seoul Tower", "Namsan", 37.5512, 126.9882, "camera", "PR", "e"],
    ["Han River Picnic", "Banpo", 37.5115, 126.9958, "leaf", "RP", "e"],
    ["Changdeokgung & Secret Garden", "Jongno", 37.5794, 126.9910, "landmark", "CN", "a"],
    ["Insadong", "Jongno", 37.5740, 126.9850, "bag", "CS", "p"],
    ["Dongdaemun Design Plaza", "Dongdaemun", 37.5669, 127.0092, "building", "SPC", "p"],
    ["Namdaemun Market", "Jung-gu", 37.5593, 126.9770, "bag", "SF", "a"],
    ["Lotte World Tower", "Jamsil", 37.5126, 127.1025, "building", "SP", "p"],
    ["Bukhansan National Park", "Bukhansan", 37.6594, 126.9770, "mountain", "AN", "a"],
    ["Starfield Library", "Gangnam", 37.5110, 127.0590, "bag", "SP", "p"],
    ["Cafe Onion", "Seongsu", 37.5445, 127.0440, "coffee", "FC", ""],
    ["Anthracite Coffee", "Hapjeong", 37.5489, 126.9139, "coffee", "FC", ""],
    ["Gwangjang Market", "Jongno", 37.5701, 126.9996, "utensils", "FS", ""],
    ["Tosokchon Samgyetang", "Jongno", 37.5780, 126.9710, "utensils", "FC", ""]
  ],
  Delhi: [
    ["Red Fort", "Old Delhi", 28.6562, 77.2410, "landmark", "CP", "a"],
    ["India Gate", "Rajpath", 28.6129, 77.2295, "landmark", "PR", "e"],
    ["Humayun's Tomb", "Nizamuddin", 28.5933, 77.2507, "landmark", "CPN", "a"],
    ["Qutub Minar", "Mehrauli", 28.5245, 77.1855, "landmark", "CP", "a"],
    ["Chandni Chowk", "Old Delhi", 28.6506, 77.2303, "bag", "FSC", "p"],
    ["Lotus Temple", "Kalkaji", 28.5535, 77.2588, "landmark", "CRP", "p"],
    ["Lodhi Garden", "Lodhi Road", 28.5931, 77.2197, "leaf", "RNP", "a"],
    ["Hauz Khas Village", "Hauz Khas", 28.5494, 77.2001, "moon", "LFP", "e"],
    ["Dilli Haat", "INA", 28.5710, 77.2073, "bag", "SFC", "p"],
    ["Akshardham Temple", "Akshardham", 28.6127, 77.2773, "landmark", "CP", "e"],
    ["Jama Masjid", "Old Delhi", 28.6507, 77.2334, "landmark", "CP", "a"],
    ["Sunder Nursery", "Nizamuddin", 28.5934, 77.2437, "leaf", "NRP", "p"],
    ["Connaught Place", "Connaught Place", 28.6315, 77.2167, "bag", "SL", "e"],
    ["Indian Coffee House", "Connaught Place", 28.6330, 77.2200, "coffee", "FC", ""],
    ["Karim's", "Jama Masjid", 28.6496, 77.2339, "utensils", "FC", ""],
    ["Paranthe Wali Gali", "Chandni Chowk", 28.6564, 77.2305, "utensils", "FC", ""],
    ["Khan Chacha", "Khan Market", 28.6002, 77.2270, "utensils", "F", ""]
  ],
  Bengaluru: [
    ["Lalbagh Botanical Garden", "Lalbagh", 12.9507, 77.5848, "leaf", "NRP", "a"],
    ["Bangalore Palace", "Vasanth Nagar", 12.9988, 77.5921, "landmark", "CP", "p"],
    ["Cubbon Park", "Kasturba Road", 12.9763, 77.5929, "leaf", "RN", "a"],
    ["Vidhana Soudha", "Ambedkar Veedhi", 12.9796, 77.5906, "landmark", "CP", "p"],
    ["Commercial Street", "Shivajinagar", 12.9833, 77.6081, "bag", "S", "p"],
    ["Nandi Hills", "Chikkaballapur", 13.3702, 77.6835, "mountain", "APN", "a"],
    ["ISKCON Temple", "Rajajinagar", 13.0098, 77.5511, "landmark", "C", "e"],
    ["Church Street", "MG Road", 12.9753, 77.6055, "moon", "LF", "e"],
    ["Bannerghatta National Park", "Bannerghatta", 12.8003, 77.5769, "leaf", "NA", "a"],
    ["Tipu Sultan's Summer Palace", "KR Market", 12.9593, 77.5737, "landmark", "C", "p"],
    ["Indiranagar", "Indiranagar", 12.9784, 77.6408, "moon", "LFS", "e"],
    ["Ulsoor Lake", "Ulsoor", 12.9825, 77.6194, "waves", "RP", "e"],
    ["Mavalli Tiffin Room", "Lalbagh Road", 12.9556, 77.5855, "coffee", "FC", ""],
    ["Third Wave Coffee", "Indiranagar", 12.9716, 77.6412, "coffee", "F", ""],
    ["Vidyarthi Bhavan", "Basavanagudi", 12.9441, 77.5732, "utensils", "FC", ""],
    ["Toit", "Indiranagar", 12.9790, 77.6402, "utensils", "FL", ""],
    ["CTR", "Malleshwaram", 13.0027, 77.5700, "utensils", "FC", ""]
  ],
  Tokyo: [
    ["Shibuya Crossing", "Shibuya", 35.6595, 139.7005, "building", "LSP", "e"],
    ["Senso-ji Temple", "Asakusa", 35.7148, 139.7967, "landmark", "C", "a"],
    ["Akihabara", "Akihabara", 35.6984, 139.7731, "bag", "S", "p"],
    ["Tsukiji Outer Market", "Tsukiji", 35.6655, 139.7707, "bag", "FS", "a"],
    ["Meiji Shrine", "Harajuku", 35.6764, 139.6993, "landmark", "CN", "a"],
    ["teamLab Planets", "Toyosu", 35.6489, 139.7898, "camera", "PC", "p"],
    ["Golden Gai", "Shinjuku", 35.6940, 139.7035, "moon", "L", "e"],
    ["Tokyo Skytree", "Sumida", 35.7101, 139.8107, "camera", "P", "e"],
    ["Ueno Park", "Ueno", 35.7156, 139.7745, "leaf", "NC", "a"],
    ["Takeshita Street", "Harajuku", 35.6702, 139.7027, "bag", "SP", "p"],
    ["Imperial Palace East Gardens", "Chiyoda", 35.6852, 139.7528, "leaf", "CN", "a"],
    ["Odaiba Seaside Park", "Odaiba", 35.6300, 139.7750, "waves", "RP", "e"],
    ["Kamakura Great Buddha", "Kamakura", 35.3167, 139.5358, "landmark", "CN", "a"],
    ["Blue Bottle Kiyosumi", "Koto", 35.6800, 139.7993, "coffee", "F", ""],
    ["Kayaba Coffee", "Yanaka", 35.7211, 139.7680, "coffee", "FC", ""],
    ["Ichiran Shibuya", "Shibuya", 35.6590, 139.7000, "utensils", "F", ""],
    ["Sushi Zanmai", "Tsukiji", 35.6653, 139.7713, "utensils", "F", ""],
    ["Omoide Yokocho", "Shinjuku", 35.6930, 139.6998, "utensils", "FL", ""]
  ]
};


const ID = "Government photo ID (Aadhaar, passport or driving licence)";
const BOOKING = "Booking confirmations (printed or on your phone)";

const india = (status, headline, steps, carry, tips, link) => ({
  label: "ENTRY & DOCUMENTS", status, headline, stepsTitle: "BEFORE YOU GO", steps, carry, tips, link, linkText: "OFFICIAL TOURISM WEBSITE" });
const openIndia = (steps, extraCarry, tips, link) =>
  india("NO PERMIT NEEDED", "Open entry, just carry your ID", steps, [ID, BOOKING, extraCarry], tips, link);

const visa = (headline, steps, carry, tips, link) => ({
  label: "VISA FOR INDIAN CITIZENS", status: "VISA REQUIRED", headline, stepsTitle: "HOW TO APPLY", steps, carry, tips, link, linkText: "OFFICIAL VISA WEBSITE" });
const schengen = (country, firstStep, link, tip) => visa(`Schengen short-stay visa (${country})`,
  [firstStep, "Book an appointment at the visa application centre", "Submit your documents and give biometrics", "Track your application and collect your passport"],
  ["Passport valid beyond your stay", "Schengen travel medical insurance", "Return flight and hotel bookings", "Bank statements as proof of funds", "Day-by-day itinerary"],
  ["Apply early, appointment slots fill up in peak season", tip, "One Schengen visa covers the other Schengen countries too"], link);

const entryInfo = {
  // ---------- India ----------
  Goa: openIndia(["Book stays early for peak season and long weekends", "Check the local rules of any water-sports operator before booking", "Plan beach days around lifeguard hours"],
    "Valid driving licence if you rent a scooter", ["Wear a helmet on rented scooters", "Follow lifeguard flags on the beaches", "Never drink and drive, checks are common"], "https://goatourism.gov.in"),
  Shimla: openIndia(["Book stays early in the summer rush", "Book the Kalka–Shimla toy train in advance if you want the ride", "Check road and snow advisories before winter travel"],
    "Train tickets if you take the toy train", ["Weather changes quickly, so carry warm layers", "Mall Road is pedestrian-only in parts", "Roads can close after snowfall"], "https://himachaltourism.gov.in"),
  Manali: india("PERMIT NEEDED (ROHTANG)", "Rohtang Pass permit",
    ["Check the current Rohtang Pass access rules on the HP Tourism website", "Apply for the permit online before your visit if it is required", "Keep a printout or screenshot of the permit with you"],
    ["Government photo ID", "Permit copy (printed or on your phone)", "Vehicle registration papers if you drive your own"],
    ["Daily numbers are capped, so apply early", "The pass can close for snow or weather, so keep a backup plan", "Altitude can cause headaches, so go slow on day one"], "https://himachaltourism.gov.in"),
  Kedarnath: india("REGISTRATION REQUIRED", "Yatra registration is mandatory",
    ["Register on the official Uttarakhand yatra portal before you travel", "Save the registration slip as a printout and on your phone", "Keep the slip handy for checks along the route"],
    ["Photo ID used for the registration", "Registration slip (printed or on your phone)", "Personal medicines and a basic first-aid kit"],
    ["Check weather and route advisories before you leave", "The trek is demanding, so build in rest days", "Book stays near Gaurikund and Sonprayag early"], "https://registrationandtouristcare.uk.gov.in"),
  Mumbai: openIndia(["Stay close to the areas you will visit most to cut travel time", "Get a local transport card or use ride apps", "Book the Elephanta Caves ferry early on weekends"],
    "Ferry or entry tickets for sites you plan to visit", ["The monsoon (June to September) brings heavy rain, so keep buffer time", "Some museums close one day a week", "Local trains are very crowded at peak hours"], "https://maharashtratourism.gov.in"),
  Udaipur: openIndia(["Book lake-view stays early in peak season", "Book palace and boat-ride tickets at official counters", "Plan palace visits for the morning to avoid crowds"],
    "Cash or UPI for entry tickets", ["Palaces and temples have dress and camera rules", "Camera fees can apply inside some palaces", "Summers are hot, so carry water and a hat"], "https://www.tourism.rajasthan.gov.in"),
  Kerala: openIndia(["Book houseboats through registered operators", "Reserve wildlife-area entries (like Periyar) in advance", "Check monsoon advisories before you travel"],
    "Wildlife entry tickets", ["Wildlife areas limit daily visitors, so book early", "Carry a raincoat in monsoon months", "Use registered boat and tour operators"], "https://www.keralatourism.org"),

  // ---------- Abroad ----------
  Paris: schengen("France", "Create your application on the official France-Visas portal", "https://france-visas.gouv.fr", "Apply to the country where you will spend the most nights"),
  Switzerland: schengen("Switzerland", "Fill the Schengen visa application form", "https://www.sem.admin.ch", "Apply to Switzerland if it is your main destination"),
  Norway: schengen("Norway", "Fill the online application on the Norwegian immigration site", "https://www.udi.no/en/", "Apply to Norway if it is your main destination"),
  London: visa("UK Standard Visitor visa",
    ["Fill the online application on GOV.UK", "Book a biometrics appointment at a visa application centre", "Submit your documents and give biometrics", "Wait for the decision and collect your passport"],
    ["Passport with blank pages", "Bank statements as proof of funds", "Accommodation and itinerary details", "Proof of job, study or business in India", "Details of your previous international travel"],
    ["Answer every question on the form accurately, mistakes can delay a decision", "Apply well before your travel dates", "Keep copies of everything you submit"], "https://www.gov.uk/standard-visitor-visa"),
  "New York": visa("US B-1/B-2 visitor visa",
    ["Complete the DS-160 form online", "Pay the visa fee", "Schedule your biometrics and interview appointments", "Attend the interview with your documents"],
    ["Passport valid for your stay", "DS-160 confirmation page", "Appointment confirmation letter", "Recent photograph", "Proof of ties to India (job, study, family)"],
    ["Interview slots can have long waits, so book early", "Be clear and consistent about your travel plans", "Do not book non-refundable tickets before the visa is approved"], "https://travel.state.gov"),
  Australia: visa("Visitor visa (subclass 600)",
    ["Create an ImmiAccount on the Australian Home Affairs website", "Complete the visitor visa application online", "Upload your documents and pay the fee", "Give biometrics if you are asked, then wait for the decision"],
    ["Passport valid for your stay", "Bank statements as proof of funds", "Itinerary and accommodation details", "Proof of job or study in India", "Travel health insurance (recommended)"],
    ["Do not book non-refundable flights before the visa is granted", "Apply well before your travel dates", "Keep your documents clear and up to date"], "https://immi.homeaffairs.gov.au"),
  Seoul: visa("Korean short-term visa",
    ["Check your visa type on the Korea Visa Portal", "Submit your application at the Korean embassy or its authorised visa centre", "Pay the fee and give biometrics if asked", "Collect your passport after processing"],
    ["Passport valid beyond your stay", "Completed application form and photograph", "Flight and hotel bookings", "Bank statements as proof of funds", "Proof of job or study in India"],
    ["Requirements can differ by embassy, so check the latest list", "Check whether you need a single or multiple entry visa", "Apply early for spring and autumn travel"], "https://www.visa.go.kr"),
  Tokyo: visa("Japan tourist visa",
    ["Check the list of documents on the Japanese embassy website", "Submit your application through the embassy or an accredited agency", "Wait for processing", "Collect your passport with the visa"],
    ["Passport valid beyond your stay", "Application form and photograph", "Day-by-day itinerary in Japan", "Flight bookings", "Bank statements as proof of funds"],
    ["Prepare a clear daily itinerary, it is part of the application", "Apply well before cherry blossom and autumn seasons", "Keep copies of everything you submit"], "https://www.mofa.go.jp/j_info/visit/visa/index.html")
};

// The card itself
// fromIndia = the visitor lives in India (so the Indian-passport visa info applies). Otherwise show a generic "check your passport" card.
function entryHTML(dest, fromIndia = true) {
  let e = entryInfo[dest.name];
  if (!e) return "";
  if (!fromIndia) e = { label: "ENTRY & DOCUMENTS", status: "CHECK YOUR PASSPORT", headline: "Entry rules depend on your passport", stepsTitle: "BEFORE YOU GO",
    steps: [`Check whether your passport needs a visa or permit for ${dest.name}`, "Apply early on the official site if it does", "Make sure your passport is valid for the whole stay"],
    carry: ["Passport valid beyond your stay", "Return ticket and accommodation details", "Travel insurance"],
    tips: ["Rules change often, so always check the official site", "Some places need a visa or e-permit even for short visits"], link: e.link, linkText: "OFFICIAL WEBSITE" };
  const list = (cls, items, ic) => `<ul class="${cls}">${items.map((t) => `<li>${icon(ic)} <span>${t}</span></li>`).join("")}</ul>`;
  return `
    <div class="entry">
      <div class="label">${icon("landmark")} ${e.label}</div>
      <span class="entry-status">${e.status}</span>
      <h3 class="entry-head">${e.headline}</h3>
      <h4>${e.stepsTitle}</h4>
      <ol>${e.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <h4>CARRY THESE</h4>${list("carry", e.carry, "check")}
      <h4>GOOD TO KNOW</h4>${list("tips", e.tips, "sparkles")}
      <a class="btn btn-primary small" href="${e.link}" target="_blank" rel="noopener">${e.linkText} ${icon("arrow", "arrow")}</a>
      <small>Rules change often. Confirm on the official site before you book.</small>
    </div>`;
}

// "Know before you go": plug, emergency number, language, tipping, 3 phrases and one tip (data lives in DESTINATIONS)
function knowHTML(dest) {
  const k = dest.know;
  if (!k) return "";
  const fact = (ic, label, value) => `<div class="fact">${icon(ic)}<div><div class="fld">${label}</div><div>${value}</div></div></div>`;
  return `
    <h3 class="block-title">KNOW BEFORE YOU GO</h3>
    <div class="know">
      <div class="facts">
        ${fact("plug", "PLUGS & VOLTAGE", k.plug)}${fact("phone", "EMERGENCY", k.emergency)}${fact("chat", "LANGUAGE", k.language)}${fact("wallet", "TIPPING", k.tipping)}
      </div>
      <div class="phrases">
        <div class="label">3 PHRASES TO LEARN</div>
        ${k.phrases.map(([en, local]) => `<div class="phrase"><span>${en}</span><b>${local}</b></div>`).join("")}
        <div class="know-tip">${icon("sparkles")} ${k.tip}</div>
      </div>
    </div>`;
}

/* ======================================================================
   5) WEATHER
   Open-Meteo (free, no key). Card shows: now (right now) + trip (real forecast if dates are within
   16 days, otherwise typical weather of the same dates over the last 3 years).
   If Open-Meteo can't be reached, "right now" falls back to a simpler Open-Meteo call, then to wttr.in.
   Failure of everything → an honest message.
   ====================================================================== */

// Open-Meteo weather code → label + icon. A code uses the first row whose number is >= the code.
const WMO = [[0, "Clear Sky", "sun"], [2, "Partly Cloudy", "cloud-sun"], [3, "Cloudy", "cloud"], [48, "Foggy", "cloud"],
             [67, "Rainy", "cloud-rain"], [77, "Snowy", "snow"], [82, "Rain Showers", "cloud-rain"],
             [86, "Snow Showers", "snow"], [99, "Thunderstorms", "cloud-rain"]];
function describeWeather(code) {
  const [, sky, ic] = WMO.find(([max]) => code <= max) || WMO[WMO.length - 1];
  return { sky, icon: ic };
}

// wttr.in gives a text description instead of a code, so map the words to our labels + icons
function describeWords(text) {
  const t = (text || "").toLowerCase();
  if (/thunder/.test(t)) return { sky: "Thunderstorms", icon: "cloud-rain" };
  if (/snow|sleet|blizzard|ice/.test(t)) return { sky: "Snowy", icon: "snow" };
  if (/rain|drizzle|shower/.test(t)) return { sky: "Rainy", icon: "cloud-rain" };
  if (/fog|mist|haze/.test(t)) return { sky: "Foggy", icon: "cloud" };
  if (/partly|patchy/.test(t)) return { sky: "Partly Cloudy", icon: "cloud-sun" };
  if (/cloud|overcast/.test(t)) return { sky: "Cloudy", icon: "cloud" };
  return { sky: "Clear Sky", icon: "sun" };
}

// Most frequent {sky, icon} in a list
function mostCommonSky(list) {
  const count = {};
  list.forEach((x) => { count[x.sky] = (count[x.sky] || 0) + 1; });
  return list.reduce((best, x) => (count[x.sky] > count[best.sky] ? x : best));
}

// Real forecast for the trip dates (only works for dates inside the next 16 days)
function forecastForTrip(data, days, trip) {
  const d = data.daily;
  if (!d) return null;
  const idx = days.map((day) => d.time.indexOf(day)).filter((i) => i !== -1);
  if (!idx.length) return null;
  const pick = (key) => idx.map((i) => d[key][i]);
  const sky = mostCommonSky(pick("weather_code").map(describeWeather));
  const rain = Math.round(average(pick("precipitation_probability_max").map((r) => r ?? 0)));
  return {
    kind: "forecast", sky: sky.sky, icon: sky.icon, rainText: `Rain chance ${rain}%`,
    tempText: `${Math.round(average(pick("temperature_2m_min")))}° – ${Math.round(average(pick("temperature_2m_max")))}°C`,
    note: idx.length === days.length ? `Live forecast for ${trip.start} → ${trip.end}.`
      : `Live forecast, but only for the first ${idx.length} day(s). Your trip runs past the 16-day forecast limit.`
  };
}

// Typical weather: the same dates in the previous 3 years (Open-Meteo historical archive)
async function expectedForTrip(lat, lon, days) {
  const results = await Promise.allSettled([1, 2, 3].map((back) =>
    fetchRetry("https://archive-api.open-meteo.com/v1/archive" + `?latitude=${lat}&longitude=${lon}`
      + `&start_date=${shiftYear(days[0], -back)}&end_date=${shiftYear(days[days.length - 1], -back)}`
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto").then((j) => j.daily)));

  const highs = [], lows = [], wet = [], skies = [];
  let years = 0;
  results.forEach((r) => {
    if (r.status !== "fulfilled" || !r.value || !r.value.time) return;
    years++;
    const d = r.value;
    d.time.forEach((_, i) => {
      if (d.temperature_2m_max[i] == null || d.temperature_2m_min[i] == null) return;
      highs.push(d.temperature_2m_max[i]);
      lows.push(d.temperature_2m_min[i]);
      wet.push((d.precipitation_sum[i] ?? 0) >= 1 ? 1 : 0);          // 1 mm or more = a rainy day
      if (d.weather_code[i] != null) skies.push(describeWeather(d.weather_code[i]));
    });
  });
  if (!highs.length || !skies.length) return null;

  const sky = mostCommonSky(skies);
  return {
    kind: "expected", sky: sky.sky, icon: sky.icon,
    tempText: `${Math.round(average(lows))}° – ${Math.round(average(highs))}°C`,
    rainText: `Rainy on about ${Math.round(average(wet) * 100)}% of days`,
    note: `Not a live forecast. This is the typical weather for these dates, averaged over the last ${years} year(s).`
  };
}

// "Right now" temperature, trying three sources in turn. Returns { now, data } (data = the full forecast if we got it).
async function getNowAndForecast(lat, lon) {
  const base = "https://api.open-meteo.com/v1/forecast" + `?latitude=${lat}&longitude=${lon}&timezone=auto`;

  // 1) the full request: now + 16-day daily forecast
  try {
    const data = await fetchRetry(base + "&current=temperature_2m,weather_code"
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=16");
    if (data && data.current) return { now: { temp: Math.round(data.current.temperature_2m), ...describeWeather(data.current.weather_code) }, data };
  } catch (err) { console.warn("Weather: full Open-Meteo request failed", err); }

  // 2) a simpler Open-Meteo request (only the current weather)
  try {
    const data = await fetchRetry(base + "&current_weather=true");
    const c = data && data.current_weather;
    if (c) return { now: { temp: Math.round(c.temperature), ...describeWeather(c.weathercode) }, data: null };
  } catch (err) { console.warn("Weather: simple Open-Meteo request failed", err); }

  // 3) a different weather service (wttr.in), in case Open-Meteo is blocked or busy
  try {
    const data = await fetchJSON(`https://wttr.in/${lat},${lon}?format=j1`);
    const c = data && data.current_condition && data.current_condition[0];
    if (c) return { now: { temp: Math.round(Number(c.temp_C)), ...describeWords(c.weatherDesc && c.weatherDesc[0] && c.weatherDesc[0].value) }, data: null };
  } catch (err) { console.warn("Weather: wttr.in request failed", err); }

  return { now: null, data: null };
}

// Returns { now, trip } — either can be null if it couldn't be loaded
async function getWeather(dest, trip) {
  const [lat, lon] = dest.coords;
  const { now, data } = await getNowAndForecast(lat, lon);

  let tripWeather = null;
  if (trip.start && trip.end) {
    const days = dateRange(trip.start, trip.end);
    if (data) tripWeather = forecastForTrip(data, days, trip);
    if (!tripWeather) { try { tripWeather = await expectedForTrip(lat, lon, days); } catch (err) { console.warn("Weather: archive request failed", err); } }
  }
  return { now, trip: tripWeather };
}

// The whole weather card
function weatherHTML(dest, weather) {
  const w = weather.trip;
  const heading = { forecast: "FORECAST FOR YOUR DATES", expected: "EXPECTED DURING YOUR TRIP" };
  const tripBlock = w ? `
      <span class="wicon">${icon(w.icon, "big")}</span>
      <div class="label">${heading[w.kind]}</div>
      <div class="temp">${w.tempText}</div>
      <strong>${w.sky}</strong>
      <p>${w.rainText}</p>
      <small>${w.note}</small>` : `
      <div class="label">WEATHER FOR YOUR DATES</div>
      <p>Weather isn't available right now. Check your internet connection and try again.</p>`;
  const nowBlock = weather.now
    ? `<div class="now-row">${icon(weather.now.icon)} <span class="now-temp">${weather.now.temp}°C</span> <span>${weather.now.sky}</span></div>`
    : `<small>Live temperature isn't available at the moment.</small>`;
  return `
    <div class="weather">${tripBlock}
      <div class="weather-now">
        <div class="label">RIGHT NOW IN ${dest.name.toUpperCase()}</div>${nowBlock}
      </div>${timeDiffHTML(dest)}
    </div>`;
}

/* ======================================================================
   6) CURRENCY
   Home places (where the user lives), exchange rates (open.er-api.com, free) and the budget card.
   ====================================================================== */

// Where the user lives. skip = destination left out of the lists · guide = city with a "Discover your city" plan in SPOTS
const home = (label, cur, skip = null, guide = skip) => ({ label, cur, skip, guide });
const HOME_PLACES = {
  "In India": [
    home("Mumbai, India", "INR", "Mumbai"), home("Goa, India", "INR", "Goa"), home("Udaipur, India", "INR", "Udaipur"),
    home("Shimla, India", "INR", "Shimla"), home("Manali, India", "INR", "Manali"), home("Kerala, India", "INR", "Kerala"),
    home("Delhi, India", "INR", null, "Delhi"), home("Bengaluru, India", "INR", null, "Bengaluru"), home("Another city in India", "INR")
  ],
  "Abroad": [
    home("Paris, France", "EUR", "Paris"), home("London, United Kingdom", "GBP", "London"), home("New York, USA", "USD", "New York"),
    home("Tokyo, Japan", "JPY", "Tokyo"), home("Seoul, South Korea", "KRW", "Seoul"),
    home("Switzerland", "CHF", "Switzerland", null), home("Norway", "NOK", "Norway", null), home("Australia", "AUD", "Australia", null),
    home("Dubai, UAE", "AED"), home("Singapore", "SGD"), home("Toronto, Canada", "CAD"), home("Another city abroad (US dollars)", "USD")
  ]
};
const ALL_HOMES = Object.values(HOME_PLACES).flat();

// ---------- Time difference between where you live and the selected destination ----------
// IANA time zones, so daylight saving is handled by the browser (Intl) and the gap is the real one for today.
const HOME_TZ = {
  "Paris, France": "Europe/Paris", "London, United Kingdom": "Europe/London", "New York, USA": "America/New_York",
  "Tokyo, Japan": "Asia/Tokyo", "Seoul, South Korea": "Asia/Seoul", "Switzerland": "Europe/Zurich", "Norway": "Europe/Oslo",
  "Australia": "Australia/Sydney", "Dubai, UAE": "Asia/Dubai", "Singapore": "Asia/Singapore", "Toronto, Canada": "America/Toronto"
};   // every "... India" place is Asia/Kolkata; "Another city abroad" has no zone, so no time difference is shown
const DEST_TZ = {
  Paris: "Europe/Paris", London: "Europe/London", "New York": "America/New_York", Switzerland: "Europe/Zurich", Norway: "Europe/Oslo",
  Australia: "Australia/Sydney", Seoul: "Asia/Seoul", Tokyo: "Asia/Tokyo"
};   // India destinations are all Asia/Kolkata
const homeTZ = () => HOME_TZ[myHome.label] || (/India/.test(myHome.label) ? "Asia/Kolkata" : null);
const destTZ = (dest) => DEST_TZ[dest.name] || (dest.region === "india" ? "Asia/Kolkata" : null);

// minutes the zone is ahead of UTC right now
function tzOffsetMin(tz, d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric" }).formatToParts(d).map((x) => [x.type, x.value]));
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(d / 1000) * 1000) / 60000;
}

// Time difference block for the results page (sits under the weather). Empty when we don't know the zones.
function timeDiffHTML(dest) {
  const hz = homeTZ(), dz = destTZ(dest);
  if (!hz || !dz) return "";
  const diff = tzOffsetMin(dz) - tzOffsetMin(hz);                     // + = destination is ahead of you
  const from = /^Another/.test(myHome.label) ? (/India/.test(myHome.label) ? "India" : "home") : myHome.label.split(",")[0];
  const there = new Date().toLocaleTimeString("en-US", { timeZone: dz, hour: "numeric", minute: "2-digit" });
  const h = Math.floor(Math.abs(diff) / 60), m = Math.abs(diff) % 60;
  const gap = [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
  const headline = diff === 0 ? "Same time" : `${gap} ${diff > 0 ? "ahead" : "behind"}`;
  const detail = diff === 0 ? `${dest.name} is in the same time zone as ${from}.` : `${dest.name} is ${gap} ${diff > 0 ? "ahead of" : "behind"} ${from}.`;
  return `
      <div class="weather-now time-diff">
        <div class="label">TIME DIFFERENCE</div>
        <div class="now-row">${icon("clock")} <span class="now-temp">${headline}</span></div>
        <small>${detail} It's ${there} in ${dest.name} right now.</small>
      </div>`;
}


const budgetSplit = { Accommodation: 0.35, Food: 0.25, Transport: 0.20, Activities: 0.15, Miscellaneous: 0.05 };

const rateCache = {};
async function getRates(base) {
  if (rateCache[base]) return rateCache[base];
  const json = await fetchJSON(`https://open.er-api.com/v6/latest/${base}`);
  if (json.result !== "success") throw new Error("Exchange rate request failed");
  return (rateCache[base] = json.rates);
}

// rate = how much destination money you get for 1 unit of home money (e.g. 1 INR → 1.8 JPY)
async function getExchange(home, dest) {
  if (home === dest) return { same: true, home, dest };
  try {
    const rate = (await getRates(home))[dest];
    return rate ? { home, dest, rate } : null;
  } catch (err) { return null; }               // null → the UI says the rate isn't available
}

const fmtRate = (n) => n >= 100 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n >= 0.1 ? n.toFixed(3) : n.toFixed(4);

// Exchange-rate strip at the top of the budget card, e.g. "1 JPY = 0.553 INR"
function fxHTML(fx) {
  if (fx && fx.same) return "";
  if (!fx) return `<div class="fx"><small>Live exchange rate isn't available right now.</small></div>`;
  return `
    <div class="fx">
      <span class="fx-main">1 ${fx.dest} = ${fmtRate(1 / fx.rate)} ${fx.home}</span>
      <span class="fx-sub">1 ${fx.home} = ${fmtRate(fx.rate)} ${fx.dest}</span>
    </div>`;
}

// The whole budget card: rate strip, one bar per category, and the total
function budgetHTML(trip, dest, fx) {
  const convert = fx && !fx.same;
  const lines = Object.entries(budgetSplit).map(([name, share]) => {
    const amount = Math.round(trip.budget * share);
    return `
      <div>
        <div class="budget-line"><span>${name}</span><span>${money(amount, trip.home)}${convert ? " · " + money(amount * fx.rate, fx.dest) : ""}</span></div>
        <div class="bar"><span style="width:${share * 250}%"></span></div>
      </div>`;
  }).join("");
  return `
    <div class="budget">
      <div class="label">BUDGET BREAKDOWN</div>
      ${fxHTML(fx)}${lines}
      <div class="total"><div class="label">ESTIMATED TOTAL</div><strong>${money(trip.budget, trip.home)}</strong>
        ${convert ? `<div class="fx-total">≈ ${money(trip.budget * fx.rate, fx.dest)} in ${dest.name}</div>` : ""}</div>
    </div>`;
}

/* ======================================================================
   7) SONG
   The song box appears only for places with a `song` in DESTINATIONS. Icons live in the sprite in index.html.
   Play order: YouTube clip (if the video id is real and embeddable) → otherwise a 30-second iTunes preview.
   ====================================================================== */

let songPlayer = null;        // the YouTube player (created the first time play is clicked)
let songTimer = null;         // checks the time so the clip stops at its end
let youtubeApiPromise = null; // makes sure the YouTube script loads only once
let songAudioEl = null;       // the plain <audio> used for the iTunes preview fallback
let songMode = null;          // "youtube" or "preview"

function songHTML(dest) {
  const s = dest.song;
  if (!s) return "";
  const link = /^[\w-]{11}$/.test(s.youtubeId)
    ? `https://www.youtube.com/watch?v=${s.youtubeId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(s.title + " " + s.artist.split("·")[0].trim())}`;
  return `
    <div class="song">
      <div class="song-row">
        <div class="song-cover">${icon("music")}</div>
        <div class="song-info">
          <div class="song-label">${icon("trend")} ${s.label}</div>
          <div class="song-title">${s.title}</div>
          <div class="song-artist">${s.artist}</div>
        </div>
        <button class="song-play" id="songPlayBtn" aria-label="Play or pause ${s.title}">${icon("play")}</button>
      </div>
      <div class="song-foot">
        <span id="songStatus">${s.caption}</span>
        <a href="${link}" target="_blank" rel="noopener">Full song on YouTube</a>
      </div>
      <!-- Invisible holder: YouTube swaps the inner div for its player, so the hiding is on the OUTER div -->
      <div class="song-audio"><div id="songAudio"></div></div>
    </div>`;
}

function loadYouTubeApi() {
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) { resolve(); return; }
      window.onYouTubeIframeAPIReady = resolve;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = reject;
      document.head.appendChild(tag);
    });
  }
  return youtubeApiPromise;
}

// Finds a 30-second preview of the song in the free iTunes catalogue (no key needed)
async function findPreview(song) {
  const artist = song.artist.split("·")[0].replace(/ft\..*/i, "").trim();
  const json = await fetchJSON(`https://itunes.apple.com/search?term=${encodeURIComponent(song.title + " " + artist)}&entity=song&limit=10`);
  const title = song.title.toLowerCase();
  const results = (json.results || []).filter((r) => r.previewUrl);
  const hit = results.find((r) => r.trackName && r.trackName.toLowerCase().includes(title)) || null;
  return hit ? hit.previewUrl : null;
}

// Fallback: play the iTunes preview with a normal audio element
async function startPreview(song, button) {
  $("songStatus").textContent = "Loading preview…";
  try {
    const url = await findPreview(song);
    if (!url) throw new Error("No preview found");
    stopSong();                                              // clear a failed YouTube player first
    songAudioEl = new Audio(url);
    songMode = "preview";
    songAudioEl.addEventListener("play", () => { button.innerHTML = icon("pause"); $("songStatus").textContent = song.caption.replace("30-second hook", "30-second preview"); });
    songAudioEl.addEventListener("pause", () => { button.innerHTML = icon("play"); });
    songAudioEl.addEventListener("ended", () => { button.innerHTML = icon("play"); });
    await songAudioEl.play();
  } catch (err) {
    console.warn("Song preview failed", err);
    button.innerHTML = icon("play");
    $("songStatus").textContent = "Couldn't play this song here. Try the YouTube link.";
  }
}

// Play / pause button for the song box
function setupSongPlayer(dest) {
  const button = $("songPlayBtn");
  if (!button) return;
  const song = dest.song;

  button.addEventListener("click", async () => {
    if (songMode === "preview" && songAudioEl) {           // preview exists → pause or resume
      if (songAudioEl.paused) songAudioEl.play(); else songAudioEl.pause();
      return;
    }
    if (songPlayer) {                                      // YouTube player exists → pause or resume
      if (songPlayer.getPlayerState() === YT.PlayerState.PLAYING) songPlayer.pauseVideo();
      else songPlayer.playVideo();
      return;
    }
    if (!/^[\w-]{11}$/.test(song.youtubeId)) { startPreview(song, button); return; }   // no real video id → preview

    $("songStatus").textContent = "Loading…";
    try { await loadYouTubeApi(); }
    catch (err) { youtubeApiPromise = null; startPreview(song, button); return; }       // YouTube blocked → preview

    songMode = "youtube";
    songPlayer = new YT.Player("songAudio", {
      width: "200", height: "200", videoId: song.youtubeId,
      playerVars: { start: song.start, autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
      events: {
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) {
            button.innerHTML = icon("pause");
            $("songStatus").textContent = song.caption;
            clearInterval(songTimer);
            songTimer = setInterval(() => {                // end of the clip → stop and rewind
              if (songPlayer && songPlayer.getCurrentTime() >= song.end) { songPlayer.pauseVideo(); songPlayer.seekTo(song.start, true); }
            }, 250);
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            button.innerHTML = icon("play");
            clearInterval(songTimer);
          }
        },
        // The video can't be embedded (owner blocked it, or the page is opened as file://) → use the preview instead
        onError: () => { startPreview(song, button); }
      }
    });
  });
}

// Removing the player from the page is what actually stops the music
function stopSong() {
  clearInterval(songTimer);
  if (songPlayer) { try { songPlayer.destroy(); } catch (err) { /* already gone */ } songPlayer = null; }
  if (songAudioEl) { try { songAudioEl.pause(); } catch (err) { /* already gone */ } songAudioEl = null; }
  songMode = null;
}

/* ======================================================================
   8) ITINERARY (TQMap)
   Vibe-based itinerary. Same choices → same plan.
   Score = vibes matched · each place used once · days grouped by distance · meals picked nearby.
   Used by page flow: TQMap.buildItinerary / planNoteHTML / itineraryHTML
   ====================================================================== */

const TQMap = (() => {
  "use strict";

  const VIBE_LETTERS = { R: "Relaxation", A: "Adventure", F: "Food", P: "Photography", C: "Culture", S: "Shopping", N: "Nature", L: "Nightlife" };
  const DAY_TIMES = ["10:00", "14:30", "18:00"];             // morning / afternoon / evening slots
  const SLOT_OF = { a: 0, p: 1, e: 2 };
  const FOOD_ICONS = ["utensils", "coffee"];
  const DAY_COLORS = ["#e4572e", "#2e86ab", "#3fa34d", "#8e5ea2", "#e0a100", "#17a398", "#c2185b", "#5c6bc0"];
  const dayColor = (d) => DAY_COLORS[d % DAY_COLORS.length];   // same colour on the day card and the map pins
  const FREE_DAY_IDEAS = [
    ["Slow morning + souvenir shopping", "Sleep in, then browse local shops for gifts"],
    ["Revisit your favourite spot", "Go back to the place you enjoyed most on this trip"],
    ["Wander without a plan", "Pick a neighbourhood and follow your nose"],
    ["Rest, spa or beach time", "Recharge, edit photos and write your travel notes"],
    ["Local market morning", "Pick up snacks and handicrafts from a neighbourhood market"],
    ["Ask a local", "Ask your host or a café owner for their favourite hidden spot"]
  ];

  /* ---------- ITINERARY BUILDER (no randomness: same choices → same plan) ----------
     1. each place scores = how many of the picked vibes it matches
     2. best scorers are chosen, each used ONCE
     3. places are grouped into days by distance
     4. each day gets breakfast, places in morning/afternoon/evening, lunch + dinner nearby
     5. days left over become "free days" */

  // Distance between two [lat, lon] points in km
  function kmBetween([lat1, lon1], [lat2, lon2]) {
    const rad = Math.PI / 180, dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
  }

  // Compact rows in SPOTS → objects, marking which match the user's vibes
  function spotList(destName, picked, skip = []) {
    return (SPOTS[destName] || []).filter((row) => !skip.includes(row[0])).map(([name, area, lat, lon, ic, letters, when], order) => {
      const tags = letters.split("").map((l) => VIBE_LETTERS[l]);
      return { name, area, at: [lat, lon], icon: ic, tags, order, slot: SLOT_OF[when] ?? 1,
               food: FOOD_ICONS.includes(ic), matched: tags.filter((t) => picked.includes(t)) };
    });
  }

  // Give each place of a day a time slot. Tries every arrangement and keeps the one where places sit
  // closest to their best time (2 slots away costs 4x more than 1, so mornings stay mornings).
  function slotPlaces(group) {
    let bestCost = Infinity, bestSlots = [];
    const tryAll = (i, used, slots, cost) => {
      if (i === group.length) { if (cost < bestCost) { bestCost = cost; bestSlots = slots.slice(); } return; }
      for (let s = 0; s < 3; s++) if (!used.includes(s)) tryAll(i + 1, [...used, s], [...slots, s], cost + (s - group[i].slot) ** 2);
    };
    tryAll(0, [], [], 0);
    return group.map((place, i) => ({ place, slot: bestSlots[i] })).sort((a, b) => a.slot - b.slot)
      .map(({ place, slot }) => ({ time: DAY_TIMES[slot], place }));
  }

  // Day heading = the two vibes that best describe the day (picked vibes count double)
  function dayTitle(group, picked) {
    const score = {};
    group.forEach((p) => p.tags.forEach((t) => { score[t] = (score[t] || 0) + (picked.includes(t) ? 2 : 1); }));
    return Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 2).join(" · ");
  }

  // Remove and return the closest unused food spot within 40 km (dinner = restaurants only, not cafés)
  function takeFood(foods, anchor, dinner) {
    let best = -1, bestScore = 40;
    foods.forEach((f, i) => {
      if (dinner && f.icon !== "utensils") return;
      const score = kmBetween(anchor, f.at) - f.matched.length * 0.3;
      if (score < bestScore) { best = i; bestScore = score; }
    });
    return best === -1 ? null : foods.splice(best, 1)[0];
  }

  const blank = (time, kind, name, ic, area = "") => ({ time, kind, name, area, icon: ic, at: null, tags: [], matched: [] });

  function mealStop(time, label, food, genericName) {
    if (!food) return blank(time, "meal", genericName, "utensils");
    const what = food.icon === "coffee" && label === "Lunch" ? "Café break" : label;
    return { time, kind: "food", name: `${what} at ${food.name}`, area: food.area, icon: food.icon, at: food.at, tags: food.tags, matched: food.matched };
  }

  function buildItinerary(dest, dayCount, picked = []) {
    const all = spotList(dest.name, picked, dest.skip);   // dest.skip = places to leave out (optional)
    const foods = all.filter((s) => s.food);
    const places = all.filter((s) => !s.food).sort((a, b) => b.matched.length - a.matched.length || a.order - b.order);
    const perDay = dayCount <= 4 ? 3 : 2;                    // short trips are packed, long trips relaxed
    const left = places.slice(0, perDay * dayCount);
    const centre = places[0] ? places[0].at : [0, 0];         // free-day meals are picked near the main sight
    const dinnerName = picked.includes("Food") ? "Dinner — try a local speciality" : picked.includes("Nightlife") ? "Dinner, then a night out" : "Dinner";

    const plan = [];
    let freeDays = 0;
    for (let d = 0; d < dayCount; d++) {
      if (!left.length) {                                    // all places used → free day
        const idea = FREE_DAY_IDEAS[freeDays++ % FREE_DAY_IDEAS.length];
        plan.push({ title: "Free day", note: "", free: true, stops: [
          blank("09:00", "meal", "Breakfast at your stay", "coffee"),
          blank("11:00", "free", idea[0], "sparkles", idea[1]),
          mealStop("13:30", "Lunch", takeFood(foods, centre, false), "Lunch at a local favourite"),
          mealStop("20:00", "Dinner", takeFood(foods, centre, true), dinnerName)
        ] });
        continue;
      }
      const seed = left.shift();                             // best remaining place + the places closest to it
      const group = [seed];
      while (group.length < perDay && left.length) {
        let near = 0;
        left.forEach((p, i) => { if (kmBetween(seed.at, p.at) < kmBetween(seed.at, left[near].at)) near = i; });
        group.push(left.splice(near, 1)[0]);
      }
      const slotted = slotPlaces(group);
      const stops = [blank("08:30", "meal", "Breakfast at your stay", "coffee")];
      slotted.forEach(({ time, place }) => stops.push({ time, kind: "place", name: place.name, area: place.area, icon: place.icon, at: place.at, tags: place.tags, matched: place.matched }));
      stops.push(mealStop("13:00", "Lunch", takeFood(foods, slotted[0].place.at, false), "Lunch at a local favourite"));
      stops.push(mealStop("20:30", "Dinner", takeFood(foods, slotted[slotted.length - 1].place.at, true), dinnerName));
      stops.sort((a, b) => a.time.localeCompare(b.time));

      let far = 0;                                           // warn when a day's stops are far apart
      group.forEach((p, i) => group.slice(i + 1).forEach((q) => { far = Math.max(far, kmBetween(p.at, q.at)); }));
      plan.push({ title: dayTitle(group, picked), free: false, stops,
                  note: far > 120 ? `Stops are up to ${Math.round(far)} km apart — allow time for a flight, train or drive.` : "" });
    }
    return plan;
  }

  /* ---------- ITINERARY CARDS ---------- */
  function stopHTML(s, d, i) {
    const tags = s.kind === "place"
      ? s.tags.slice(0, 3).map((t) => `<span class="vtag${s.matched.includes(t) ? " hit" : ""}">${t}</span>`).join("") : "";
    return `
      <div class="stop kind-${s.kind}">
        <b>${s.time}</b> — ${icon(s.icon || "pin")} ${s.name}
        ${s.area ? `<div class="area">${s.area}</div>` : ""}
        ${tags ? `<div class="vtags">${tags}</div>` : ""}
      </div>`;
  }

  const itineraryHTML = (plan) => plan.map((day, d) => `
      <div class="day" style="--dc:${dayColor(d)}">
        <h4>DAY ${String(d + 1).padStart(2, "0")}</h4>
        <div class="day-title">${day.title}</div>
        ${day.note ? `<div class="day-note">${day.note}</div>` : ""}
        ${day.stops.map((s, i) => stopHTML(s, d, i)).join("")}
      </div>`).join("");

  // One line above the itinerary explaining how it was built
  function planNoteHTML(dest, picked) {
    const places = (SPOTS[dest.name] || []).filter((row) => !FOOD_ICONS.includes(row[4]));
    const has = (vibe) => places.some((row) => row[5].split("").some((l) => VIBE_LETTERS[l] === vibe));
    const missing = picked.filter((v) => !has(v));
    const base = picked.length
      ? `Built around your vibes: <b>${picked.join(", ")}</b>. Highlighted tags show what matched.`
      : `A balanced mix of the best of ${dest.name}. Pick some vibes in the planner to personalise it.`;
    const extra = missing.length ? ` There are no ${missing.join(" / ")} spots in ${dest.name}, so we added the best of the rest.` : "";
    return `<p class="plan-note">${base}${extra}</p>`;
  }

  return { buildItinerary, itineraryHTML, planNoteHTML };
})();

/* ======================================================================
   9) PAGE FLOW
   Settings, UI builders, and every button / event.
   ====================================================================== */

/* ---------- 1) SETTINGS & STATE ---------- */
const vibes = [
  { label: "Relaxation", icon: "waves" }, { label: "Adventure", icon: "mountain" },
  { label: "Food", icon: "utensils" }, { label: "Photography", icon: "camera" },
  { label: "Culture", icon: "landmark" }, { label: "Shopping", icon: "bag" },
  { label: "Nature", icon: "leaf" }, { label: "Nightlife", icon: "moon" }
];
const whoOptions = [
  { label: "Solo", icon: "user" }, { label: "Couple", icon: "heart" },
  { label: "Friends", icon: "users" }, { label: "Family", icon: "home" }
];

const findDestination = (name) => DESTINATIONS.find((d) => d.name === name);
const photoOf = (dest) => `images/${dest.name.toLowerCase().replace(/\s+/g, "")}.jpg`;   // e.g. images/newyork.jpg
const outfitIcon = (label) => /sun/i.test(label) ? "sun" : /boot|shoe|sandal|sneaker|jutti/i.test(label) ? "boot" : /backpack/i.test(label) ? "backpack" : "shirt";

let currentRegion = "india";
let selectedDestination = null;
let myHome = ALL_HOMES.find((h) => h.label === localStorage.getItem("travelquestHomePlace")) || ALL_HOMES.find((h) => h.label === "Another city in India");
let tripDetails = { days: 5, who: "Solo", vibes: [], budget: 25000, start: "", end: "", home: myHome.cur };   // home = currency of where the user lives
let localDays = 1, localPicked = [], localSkip = true, localWeatherCity = null;                                                                      // "Discover your city" choices

const getSavedTrips = () => JSON.parse(localStorage.getItem("travelquestTrips") || "[]");
const setSavedTrips = (trips) => localStorage.setItem("travelquestTrips", JSON.stringify(trips));

// Re-colours a section for a destination. Only primary + accent are stored; the pale shades are mixed from them.
function applyTheme(el, dest) {
  const [primary, accent] = dest.colors;
  el.style.setProperty("--primary", primary);
  el.style.setProperty("--accent", accent);
  el.style.setProperty("--tint-peach", `color-mix(in srgb, ${accent} 22%, #fffaf3)`);
  el.style.setProperty("--tint", `color-mix(in srgb, ${primary} 12%, #fffaf3)`);
}

/* ---------- 2) UI BUILDERS (each returns an HTML string) ---------- */
function destinationCardHTML(dest) {
  return `
    <article class="card" data-name="${dest.name}">
      <div class="card-img"><img src="${photoOf(dest)}" alt="${dest.name}" loading="lazy" onerror="this.style.display='none'"></div>
      <div class="card-body">
        <h3>${icon(dest.icon)} ${dest.name}</h3>
        <div class="country">${dest.country}</div>
        <p>${dest.description}</p>
        <div>${dest.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        <span class="explore">EXPLORE ${icon("arrow", "arrow")}</span>
      </div>
    </article>`;
}

// Google Maps search link (a search, so it never breaks): shop / place name + area + city
const mapsLink = (...parts) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.filter(Boolean).join(", "))}`;

function placeCard(ic, name, meta, text, url) {
  return `
    <div class="place">
      <div class="place-head"><span class="pico">${icon(ic)}</span><div><h5>${name}</h5><div class="meta">${meta}</div></div></div>
      <p>${text}</p>
      <a class="gmap" href="${url}" target="_blank" rel="noopener">${icon("pin")} OPEN IN GOOGLE MAPS ${icon("arrow", "arrow")}</a>
    </div>`;
}

// "Places you'll love": cafés, must-try food (dish + the shop to try it at) and where to shop. No photos needed.
function placesHTML(dest) {
  const where = (area) => `<span>${icon("pin")} ${area}</span>`;
  const group = (label, cards) => cards.length ? `<div class="label">${label}</div><div class="place-grid">${cards.join("")}</div>` : "";
  const cafes = dest.cafes.map(([name, area, rating, price, desc]) =>
    placeCard("coffee", name, `${where(area)}<span>${icon("star")} ${rating} · ${price}</span>`, desc, mapsLink(name, area, dest.name)));
  const food = (dest.food || []).map(([dish, shop, area]) =>
    placeCard("utensils", dish, where(area), `Try it at <b>${shop}</b>.`, mapsLink(shop, area, dest.name)));
  const shops = (dest.shops || []).map(([name, area, what]) =>
    placeCard("bag", name, where(area), what, mapsLink(name, area, dest.name)));
  return `<h3 class="block-title">PLACES YOU'LL LOVE</h3>
    <div class="places">${group("CAFÉS & EATS", cafes)}${group("MUST-TRY FOOD", food)}${group("WHERE TO SHOP", shops)}</div>`;
}

// The entire results section for one trip
function renderResults(dest, trip, weather, fx) {
  stopSong();
  trip.home = trip.home || "INR";                        // older saved trips have no currency
  applyTheme($("results"), dest);
  const plan = TQMap.buildItinerary(dest, trip.days, trip.vibes);
  const dateText = trip.start && trip.end ? `${trip.start} → ${trip.end} · ${trip.days} days` : `${trip.days} days`;

  $("results").innerHTML = `
    <div class="results-hero">
      <img src="${photoOf(dest)}" alt="" onerror="this.style.display='none'">
      <div>
        <p class="label">${icon(dest.icon)} ${dest.country}</p>
        <h2 class="title">YOUR ${dest.name.toUpperCase()} ADVENTURE</h2>
        <p>${dateText} · ${trip.who} · ${trip.vibes.length ? trip.vibes.join(", ") : "Open to anything"}</p>
      </div>
    </div>

    <div class="info-grid">${weatherHTML(dest, weather)}${budgetHTML(trip, dest, fx)}</div>

    <h3 class="block-title">YOUR ITINERARY</h3>
    ${TQMap.planNoteHTML(dest, trip.vibes)}
    <div class="days">${TQMap.itineraryHTML(plan)}</div>

    ${placesHTML(dest)}

    ${knowHTML(dest)}

    <div class="two-col">
      ${entryHTML(dest, trip.home === "INR")}
      <div class="panel wear-panel">
        <div class="label">WHAT SHOULD I WEAR?</div>
        <div class="outfits">${dest.outfits.map((l) => `<div class="outfit">${icon(outfitIcon(l))}${l}</div>`).join("")}</div>
        ${songHTML(dest)}
      </div>
    </div>


    <div class="save-wrap"><button class="btn btn-primary big" id="saveBtn">${icon("heart")} SAVE THIS TRIP</button></div>`;

  $("saveBtn").addEventListener("click", () => saveTrip(dest, trip));
  setupSongPlayer(dest);
}

function renderMyTrips() {
  const trips = getSavedTrips().filter((t) => findDestination(t.name));   // skip broken entries
  $("tripsGrid").innerHTML = trips.length ? trips.map((t) => `
    <div class="card trip-card">
      <h3>${icon(findDestination(t.name).icon)} ${t.name}</h3>
      <p>${icon("calendar")} ${t.start && t.end ? t.start + " → " + t.end : t.days + " days"}</p>
      <p>${icon("wallet")} ${money(t.budget, t.home || "INR")}</p>
      <p>${icon("backpack")} ${t.who} · ${t.vibes.length ? t.vibes.join(", ") : "Open to anything"}</p>
      <button class="btn btn-primary" data-view="${t.id}">VIEW</button>
      <button class="btn btn-outline" data-delete="${t.id}">DELETE</button>
    </div>`).join("") : `<p class="empty">No saved trips yet. Build one and hit “Save this trip”!</p>`;
}

/* ---------- 3) FLOW & EVENTS ---------- */
const show = (id) => $(id).classList.remove("hidden");
const hide = (id) => $(id).classList.add("hidden");
const scrollToSection = (id) => $(id).scrollIntoView({ behavior: "smooth" });

const visibleDestinations = (region) => DESTINATIONS.filter((d) => d.region === region && d.name !== myHome.skip);   // your own city is left out

// ---------- "Discover your own city" ----------
// A 1-day or weekend plan from the SPOTS list of the city where you live, plus live weather, a checklist and where to eat.
const LOCAL_FOOD = ["utensils", "coffee"];
const MOODS = [["Chill day", ["Relaxation", "Nature"], "waves"], ["Foodie crawl", ["Food", "Shopping"], "utensils"],
               ["Explorer", ["Adventure", "Culture", "Photography"], "mountain"], ["Night out", ["Nightlife", "Food"], "moon"]];
const localPlaces = (city) => SPOTS[city].filter((r) => !LOCAL_FOOD.includes(r[4]));          // attractions only
const getVisited = (city) => (JSON.parse(localStorage.getItem("travelquestVisited") || "{}")[city] || []);
function toggleVisited(city, name) {
  const all = JSON.parse(localStorage.getItem("travelquestVisited") || "{}");
  const list = all[city] || [];
  all[city] = list.includes(name) ? list.filter((n) => n !== name) : [...list, name];
  localStorage.setItem("travelquestVisited", JSON.stringify(all));
}

function renderLocalPlan() {
  const city = myHome.guide;
  if (!city) return;
  const dest = { name: city, skip: localSkip ? getVisited(city) : [] };
  $("localNote").innerHTML = TQMap.planNoteHTML(dest, localPicked).replace("Pick some vibes in the planner to personalise it.", "Pick a mood or some vibes above to personalise it.");
  $("localPlan").innerHTML = TQMap.itineraryHTML(TQMap.buildItinerary(dest, localDays, localPicked)).replaceAll("at your stay", "at home");
}

function renderLocalCheck() {
  const city = myHome.guide;
  if (!city) return;
  const places = localPlaces(city), seen = getVisited(city);
  const done = places.filter((r) => seen.includes(r[0])).length;
  $("localCheck").innerHTML = `
    <div class="label">YOUR CITY CHECKLIST</div>
    <div class="check-count"><strong>${done}</strong> of ${places.length} places explored</div>
    <div class="bar"><span style="width:${Math.round((done / places.length) * 100)}%"></span></div>
    <button class="chip${localSkip ? " active" : ""}" data-skip="1">${icon("check")} Plan only places I haven't been to</button>
    <div class="check-list">${places.map((r, i) => `
      <button class="check-row${seen.includes(r[0]) ? " done" : ""}" data-i="${i}"><span class="tick">${icon("check")}</span><span>${r[0]}<small>${r[1]}</small></span></button>`).join("")}
    </div>`;
}

async function renderLocalWeather(city) {
  const box = $("localWeather");
  box.innerHTML = `<div class="label">RIGHT NOW IN ${city.toUpperCase()}</div><p>Checking the weather…</p>`;
  const row = SPOTS[city][0];                                       // the first spot gives us the city's coordinates
  const { now } = await getWeather({ coords: [row[2], row[3]] }, {});
  if (myHome.guide !== city) return;                                // the user switched city while we waited
  if (!now) { localWeatherCity = null; box.innerHTML = `<div class="label">RIGHT NOW IN ${city.toUpperCase()}</div><p>Live weather isn't available right now.</p>`; return; }
  const tip = /rain|shower|thunder|snow|fog/i.test(now.sky) ? "Not the best weather outside. Start with indoor spots like museums, markets and cafés."
    : now.temp >= 32 ? "It's hot. Keep outdoor spots for the morning or after sunset."
    : now.temp <= 10 ? "It's cold. Layer up and plan a cosy café stop."
    : "Lovely weather to be out. A good day to walk around.";
  box.innerHTML = `<span class="wicon">${icon(now.icon, "big")}</span><div class="label">RIGHT NOW IN ${city.toUpperCase()}</div>
    <div class="temp">${now.temp}°C</div><strong>${now.sky}</strong><div class="local-tip">${icon("sparkles")} ${tip}</div>`;
}

function renderLocal() {
  const city = myHome.guide;
  if (!city) return;
  $("localTitle").textContent = `Discover ${city}`;
  renderLocalPlan();
  renderLocalCheck();
  $("localEat").innerHTML = `<div class="label">WHERE TO EAT</div>` + SPOTS[city].filter((r) => LOCAL_FOOD.includes(r[4]))
    .map(([name, area, , , ic]) => `<div class="eat-row">${icon(ic)}<div><b>${name}</b><small>${area}</small></div></div>`).join("");
  if (localWeatherCity !== city) { localWeatherCity = city; renderLocalWeather(city); }       // fetched once per city
}

// The user picked (or changed) where they live: currency, filtered lists, counts, discover button
function applyHome() {
  tripDetails.home = myHome.cur;
  localStorage.setItem("travelquestHomePlace", myHome.label);
  $("whereNote").textContent = `Currency set to ${myHome.cur}.` + (myHome.skip ? ` ${myHome.skip} is left out of the lists because you live there.` : "");
  $("homeLine").innerHTML = `${myHome.label} · ${myHome.cur} <a href="#explore">change</a>`;
  ["india", "abroad"].forEach((r) => { $(r + "Count").textContent = visibleDestinations(r).length; });
  $("discoverBtn").classList.toggle("hidden", !myHome.guide);
  $("discoverBtn").textContent = myHome.guide ? `DISCOVER ${myHome.guide.toUpperCase()}` : "";
  if (!$("local").classList.contains("hidden")) { if (myHome.guide) renderLocal(); else hide("local"); }
  if (selectedDestination && selectedDestination.name === myHome.skip) { selectedDestination = null; hide("planner"); hide("results"); }
  if (!$("destinations").classList.contains("hidden")) showRegion(currentRegion, false);
  rescaleBudget();
  updateFxPreview();
}

// Step 2: the destination list for India or Abroad
function showRegion(region, scroll = true) {
  currentRegion = region;
  const isIndia = region === "india";
  $("destLabel").textContent = isIndia ? "India" : "Abroad";
  $("destTitle").textContent = isIndia ? "WHERE IN INDIA?" : "WHERE IN THE WORLD?";
  $("destSub").textContent = isIndia ? "Pick a place. We'll help you plan the rest." : "Your next adventure could be anywhere.";
  $("destGrid").innerHTML = visibleDestinations(region).map(destinationCardHTML).join("");
  rescaleBudget();
  show("destinations");
  if (scroll) scrollToSection("destinations");
}

// Step 3: a destination was clicked
function selectDestination(name) {
  selectedDestination = findDestination(name);
  document.querySelectorAll("#destGrid .card").forEach((c) => c.classList.toggle("selected", c.dataset.name === name));
  $("selectedDest").innerHTML = `${icon(selectedDestination.icon, "xl")} ${selectedDestination.name}`;
  applyTheme($("planner"), selectedDestination);
  updateFxPreview();
  stopSong();
  hide("results");
  show("planner");
  scrollToSection("planner");
}

function updateBudget() {
  tripDetails.budget = Number($("budgetSlider").value);
  $("budgetLabel").textContent = money(tripDetails.budget, tripDetails.home);
}

// Slider ranges are written in rupees. For another home currency, scale them by today's rate.
async function rescaleBudget() {
  const base = currentRegion === "india" ? { min: 5000, max: 150000, step: 1000, value: 25000 }
                                         : { min: 50000, max: 600000, step: 5000, value: 150000 };
  let factor = 1;
  if (tripDetails.home !== "INR") {
    try { factor = (await getRates("INR"))[tripDetails.home] || 1; } catch (err) { factor = 1; }
  }
  const nice = (n) => { const p = Math.pow(10, Math.floor(Math.log10(n))); return Math.max(1, Math.round(n / p) * p); };
  const slider = $("budgetSlider");
  slider.min = nice(base.min * factor);
  slider.max = nice(base.max * factor);
  slider.step = nice(base.step * factor);
  slider.value = nice(base.value * factor);
  updateBudget();
}

// Small line under the "where do you stay" dropdown, e.g. "1 JPY = 0.553 INR"
async function updateFxPreview() {
  if (!selectedDestination) { $("fxPreview").textContent = ""; return; }
  const fx = await getExchange(tripDetails.home, selectedDestination.cur);
  $("fxPreview").textContent = !fx ? "Live exchange rate isn't available right now."
    : fx.same ? `You'll spend in ${fx.dest}, so no conversion is needed.`
    : `1 ${fx.dest} = ${fmtRate(1 / fx.rate)} ${fx.home}`;
}

// Single-choice chips (duration, who)
function singleChoice(containerId, onPick) {
  $(containerId).addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(`#${containerId} .chip`).forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    onPick(chip);
  });
}

// Fill the end date from the start date + trip length
function updateEndDate() {
  if (!tripDetails.start) { tripDetails.end = ""; $("endDate").value = ""; return; }
  const end = parseISO(tripDetails.start);
  end.setDate(end.getDate() + tripDetails.days - 1);
  tripDetails.end = toISO(end);
  $("endDate").value = tripDetails.end;
}

// A date field changed: keep the dates valid and work out the trip length
function handleDates(e) {
  tripDetails.start = $("startDate").value;
  tripDetails.end = $("endDate").value;
  if (tripDetails.start) $("endDate").min = tripDetails.start;
  if (tripDetails.start && tripDetails.end && tripDetails.end < tripDetails.start) {
    tripDetails.end = tripDetails.start;
    $("endDate").value = tripDetails.end;
  }
  if (tripDetails.start && tripDetails.end) {
    tripDetails.days = Math.max(1, Math.round((parseISO(tripDetails.end) - parseISO(tripDetails.start)) / 86400000) + 1);
    document.querySelectorAll("#durationChips .chip").forEach((c) => c.classList.toggle("active", Number(c.dataset.days) === tripDetails.days));
  } else if (tripDetails.start && e.target.id === "startDate") updateEndDate();
}

// Step 4: build the trip in the browser and show it
async function buildTrip() {
  if (!selectedDestination) { alert("Please pick a destination first!"); return; }
  stopSong();
  hide("results"); show("loading");
  const steps = ["Checking destination", "Understanding your travel style", "Building your itinerary", "Finding places to explore", "Preparing your trip"];
  $("loadSteps").innerHTML = steps.map((s, i) => `<li style="animation-delay:${i * 0.25}s">${icon("check")} ${s}</li>`).join("");
  scrollToSection("loading");

  // Real dates are needed. With only a duration chip, start today and work out the end date.
  let { start, end } = tripDetails;
  if (!start || !end) {
    const s = new Date(), e = new Date();
    e.setDate(s.getDate() + tripDetails.days - 1);
    start = toISO(s); end = toISO(e);
  }
  const dest = selectedDestination;
  const trip = { days: Math.round((parseISO(end) - parseISO(start)) / 86400000) + 1, who: tripDetails.who,
                 vibes: tripDetails.vibes, budget: tripDetails.budget, start, end, home: tripDetails.home };

  try {
    const [weather, fx] = await Promise.all([                // the loading screen stays for at least 1.8 s
      getWeather(dest, trip), getExchange(trip.home, dest.cur), new Promise((r) => setTimeout(r, 1800))
    ]);
    hide("loading");
    renderResults(dest, trip, weather, fx);
    show("results");
    scrollToSection("results");
  } catch (error) {
    hide("loading"); show("planner");
    alert("Could not generate trip: " + error.message);
  }
}

function saveTrip(dest, trip) {
  const trips = getSavedTrips();
  if (!(trip.id && trips.some((x) => x.id === trip.id))) {      // not already saved
    trips.push({ ...trip, id: Date.now(), name: dest.name });
    setSavedTrips(trips);
    renderMyTrips();
  }
  const btn = $("saveBtn");
  btn.innerHTML = `${icon("check")} TRIP SAVED`;
  btn.disabled = true;
}

/* ----- wire everything up ----- */
document.querySelectorAll("[data-region]").forEach((el) =>
  el.addEventListener("click", (e) => { e.preventDefault(); $("navLinks").classList.remove("open"); showRegion(el.dataset.region); }));

$("destGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) selectDestination(card.dataset.name);
});

$("whoChips").innerHTML = whoOptions.map((w, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-who="${w.label}">${icon(w.icon)} ${w.label}</button>`).join("");
$("vibeChips").innerHTML = vibes.map((v) => `<button class="chip" data-vibe="${v.label}">${icon(v.icon)} ${v.label}</button>`).join("");
$("vibeChips").addEventListener("click", (e) => {            // multi-select
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("active");
  tripDetails.vibes = [...document.querySelectorAll("#vibeChips .active")].map((c) => c.dataset.vibe);
});
singleChoice("whoChips", (chip) => { tripDetails.who = chip.dataset.who; });
singleChoice("durationChips", (chip) => { tripDetails.days = Number(chip.dataset.days); updateEndDate(); });

$("startDate").min = toISO(new Date());                       // can't pick past dates
$("startDate").addEventListener("change", handleDates);
$("endDate").addEventListener("change", handleDates);
$("budgetSlider").addEventListener("input", updateBudget);
$("buildBtn").addEventListener("click", buildTrip);

// Step 0: where do you live?
$("homePlace").innerHTML = Object.entries(HOME_PLACES).map(([group, list]) =>
  `<optgroup label="${group}">${list.map((h) => `<option>${h.label}</option>`).join("")}</optgroup>`).join("");
$("homePlace").value = myHome.label;
$("homePlace").addEventListener("change", () => { myHome = ALL_HOMES.find((h) => h.label === $("homePlace").value); applyHome(); });
$("discoverBtn").addEventListener("click", () => { show("local"); renderLocal(); scrollToSection("local"); });
$("localVibes").innerHTML = vibes.map((v) => `<button class="chip" data-vibe="${v.label}">${icon(v.icon)} ${v.label}</button>`).join("");
$("localVibes").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("active");
  localPicked = [...document.querySelectorAll("#localVibes .active")].map((c) => c.dataset.vibe);
  renderLocalPlan();
});
singleChoice("localDays", (chip) => { localDays = Number(chip.dataset.days); renderLocalPlan(); });

// Mood buttons set the vibes in one tap ("Surprise me" picks two at random)
$("localMoods").innerHTML = MOODS.map(([label, , ic], i) => `<button class="chip" data-mood="${i}">${icon(ic)} ${label}</button>`).join("")
  + `<button class="chip" data-mood="surprise">${icon("sparkles")} Surprise me</button>`;
$("localMoods").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  localPicked = chip.dataset.mood === "surprise"
    ? vibes.map((v) => v.label).sort(() => Math.random() - 0.5).slice(0, 2)
    : MOODS[Number(chip.dataset.mood)][1];
  document.querySelectorAll("#localVibes .chip").forEach((c) => c.classList.toggle("active", localPicked.includes(c.dataset.vibe)));
  renderLocalPlan();
});

// Checklist: tick places you've been to, or turn "plan only new places" on / off
$("localCheck").addEventListener("click", (e) => {
  const city = myHome.guide;
  if (e.target.closest("[data-skip]")) { localSkip = !localSkip; renderLocalCheck(); renderLocalPlan(); return; }
  const row = e.target.closest(".check-row");
  if (!row || !city) return;
  toggleVisited(city, localPlaces(city)[Number(row.dataset.i)][0]);
  renderLocalCheck();
  renderLocalPlan();
});

// My Trips: VIEW / DELETE
$("tripsGrid").addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.view) {
    const t = getSavedTrips().find((x) => x.id == btn.dataset.view);
    if (!t) return;
    selectedDestination = findDestination(t.name);
    const [weather, fx] = await Promise.all([getWeather(selectedDestination, t), getExchange(t.home || "INR", selectedDestination.cur)]);   // fresh data every time
    renderResults(selectedDestination, t, weather, fx);
    show("results"); scrollToSection("results");
  }
  if (btn.dataset.delete) {
    setSavedTrips(getSavedTrips().filter((x) => x.id != btn.dataset.delete));
    renderMyTrips();
  }
});

// Navbar: solid background on scroll + mobile menu
window.addEventListener("scroll", () => $("navbar").classList.toggle("solid", window.scrollY > 60));
$("menuBtn").addEventListener("click", () => $("navLinks").classList.toggle("open"));
$("navLinks").addEventListener("click", (e) => { if (e.target.tagName === "A") $("navLinks").classList.remove("open"); });

// "PLAN A TRIP": with no destination picked yet, scroll to the chooser instead
document.querySelector('#navLinks a[href="#planner"]').addEventListener("click", (e) => {
  if (!selectedDestination) { e.preventDefault(); scrollToSection("explore"); }
});

renderMyTrips();
applyHome();          // sets currency, filters the lists and fills the boarding-pass counts

/* ----- always start at the top on page load / refresh ----- */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.addEventListener("load", () => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));

const hero = $("home");                                         // the <header id="home"> section
const pictures = document.querySelectorAll(".hero .sc");        // all the scattered pictures

hero.addEventListener("mousemove", (event) => {
  // -0.5 = far left/top, 0 = middle, +0.5 = far right/bottom
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;
  pictures.forEach((pic) => {
    const amount = Number(pic.dataset.d);
    pic.style.transform = `translate(${x * amount}px, ${y * amount}px)`;
  });
});

// Mouse leaves the hero → pictures glide back to their spot
hero.addEventListener("mouseleave", () => pictures.forEach((pic) => { pic.style.transform = "translate(0px, 0px)"; }));