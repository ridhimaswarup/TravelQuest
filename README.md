# TravelQuest 

**Plan trips in India and abroad with itineraries, live weather, currency-based budgets and time differences.**

TravelQuest is a frontend-only travel planner using **HTML, CSS and JavaScript**. There is no backend, no build step and no framework. Open `index.html` and it works.

---

## Features

- **Home base:** choose where you live. Your own city is left out of the lists, your currency is set, and you can discover your own city too.
- **Boarding-pass chooser:** pick *India* or *World* from two boarding-pass cards.
- **15 destinations:**
  - **India:** Goa, Shimla, Manali, Kedarnath, Mumbai, Udaipur, Kerala
  - **Abroad:** Paris, London, New York, Switzerland, Norway, Australia, Seoul, Tokyo
- **Trip planner:** set dates, trip length, who you are travelling with, your budget and your vibes (food, nature, culture, nightlife and more).
- **Day-by-day itinerary:** built from the places, food and shopping spots of the destination, matched to your vibes.
- **Live weather:** a real forecast for your dates (up to 16 days ahead) or the typical weather for those dates, plus the temperature right now.
- **Budget breakdown:** split into accommodation, food, transport, activities and miscellaneous, shown in your home currency and the destination's currency using live exchange rates.
- **Time difference:** how far ahead of or behind home the destination is, and what time it is there right now.
- **Know before you go:** language, currency, travel tips and more for each place.
- **Discover your own city:** a one-day or weekend plan for the city where you live, with a checklist of places you've explored.
- **Saved trips:** save a trip and open it again later (stored in your browser).
- **Travel song:** a short clip of a song linked to the destination.

---

## Tech

| Part | Used for |
|------|----------|
| HTML, CSS, JavaScript | The whole app (no framework) |
| [Open-Meteo](https://open-meteo.com/) | Weather forecast and historical averages (free, no key) |
| [open.er-api.com](https://open.er-api.com/) | Exchange rates (free, no key) |
| YouTube IFrame API | Destination song clips |
| Browser `localStorage` | Saved trips, home place, visited places |
| `Intl` (built into the browser) | Time zones and daylight saving |

---

## Getting started

1. Clone or download the repo:
   ```bash
   git clone https://github.com/ridhimaswarup/TravelQuest.git
   ```
2. Open `frontend/index.html` in your browser.
   Or run a small local server from the `frontend` folder:
   ```bash
   cd TravelQuest/frontend
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`.

An internet connection is needed for the weather, exchange rates and song clips.

---

## Project structure

```
TravelQuest/
└── frontend/
    ├── index.html      # page layout and icons
    ├── style.css       # all styling and animations
    ├── script.js       # data, planner logic, weather, currency, itinerary
    └── images/         # destination photos and hero artwork
```

---

## How it works

1. Pick where you live, and your currency is set.
2. Choose India or the world, then a destination.
3. Fill in your trip details and press **Build my adventure**.
4. Get your forecast, budget, time difference and day-by-day plan, and save the trip if you like it.

---
