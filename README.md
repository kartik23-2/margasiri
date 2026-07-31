# Margasiri

India's hidden villages, valleys and heritage sites, sorted by live distance from you. English, Hindi, Kannada.

## Quick Start

```bash
npm install
npm run dev
```

Map and in-app journey screens need:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
```

## Working Now

- Next.js 14 App Router app with Supabase auth/profile wiring.
- Place browsing, saved places, profile map, trip planning, weather, utility notes, and multilingual UI.
- `/map` and `/profile/map` use Google Maps for place pins.
- `/directions/[slug]` uses Google Maps plus live browser GPS tracking for in-app journeys.
- Place images resolve to real Wikimedia/Wikipedia photos where available, with generated fallback art only when no photo is found.

## Directions

Margasiri keeps the directions experience inside the app. Place cards and place detail pages open `/directions/[slug]`, where Google Maps renders the destination, current/saved browser location, and a Google route.

Tap `Start journey` to start live GPS tracking. The app watches your position, updates the current-location marker, refreshes the route from your latest location, and shows distance, estimated time, GPS accuracy, and last update time.

## Deploying

Deploy to Vercel with:

```bash
vercel deploy --prod
```

Set Supabase env vars and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel production. Because this is a browser map key, restrict it in Google Cloud Console to your allowed domains.

For Google Maps production:

- Enable billing on the Google Cloud project attached to the key.
- Enable the Maps JavaScript API and Directions API.
- Use HTTP referrer restrictions for the browser key, not IP restrictions.
- Add allowed referrers such as `https://margasiri.vercel.app/*`, `https://*.vercel.app/*`, and `http://localhost:3000/*` for local development.

If Google rejects the key, Margasiri listens for Google's `gm_authFailure` callback and shows an in-app setup message on `/map`, `/profile/map`, and `/directions/[slug]`.
