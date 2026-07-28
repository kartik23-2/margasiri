# Margasiri

India's hidden villages, valleys and heritage sites, sorted by live distance from you. English, Hindi, Kannada.

This is a working Next.js 14 App Router + TypeScript + Tailwind application with Supabase auth/profile wiring, static place data, place browsing maps, and a Prisma schema ready for PostgreSQL/PostGIS.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Home, Explore, Map, Saved, Profile, place detail pages, and state pages all build from the app code.

Map browsing screens also need:

```bash
NEXT_PUBLIC_TILE_PROVIDER_URL="https://your-provider/style.json"
```

Use a MapLibre-compatible OpenStreetMap-data style from MapTiler, Stadia Maps, Geoapify, or your own `tileserver-gl`. Do not use the public `tile.openstreetmap.org` server for a production app.

## Working Now

- Full Next.js app, builds clean with static pages pre-rendered for SEO.
- 1237 places in `lib/data/places.ts`.
- Bottom tab app navigation: Home, Explore, Map, Saved, Profile.
- Live geolocation and Haversine distance calculation for sorting places by distance.
- Search and bottom-sheet filters on `/explore`.
- First-class `/map` tab with clustered pins for all places.
- `/saved`, `/profile`, settings, Google sign-in, and email/password auth flows.
- Map browsing through MapLibre GL JS.
- Place details use a simple external Google Maps directions link.

## Directions

Margasiri intentionally links out to Google Maps for navigation instead of running in-app turn-by-turn routing.

The place detail page uses:

```text
https://www.google.com/maps/dir/?api=1&destination={lat},{lng}
```

If the browser has already captured a last known in-app location from Home or Explore, the link includes origin:

```text
https://www.google.com/maps/dir/?api=1&origin={userLat},{userLng}&destination={lat},{lng}
```

This keeps navigation simple: no routing API, no OSRM server, no traffic-data promise, no billing keys, and no infrastructure commitment before real usage shows that in-app navigation is worth building again. Google Maps gives users live traffic, voice guidance, and familiar navigation while Margasiri keeps their place open in a separate tab.

## Map Browsing

The Map tab and Profile Map are separate from navigation. They use MapLibre GL JS only to show pins and clusters. A managed OpenStreetMap-data tile provider is the recommended default; full tile self-hosting can be revisited later if map browsing traffic grows enough to justify the operational work.

## Connecting Supabase

1. Copy `.env.example` to `.env`.
2. Set:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=""
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""
   SUPABASE_SERVICE_ROLE_KEY=""
   ```
3. Run `supabase/schema.sql` in the Supabase SQL editor to create profile, saved, visited, contribution, and RLS tables.
4. Enable Google in Supabase Auth Providers if using Google sign-in.

## Project Structure

```text
app/
  page.tsx                    Home feed
  explore/page.tsx             Search and filter browsing
  map/page.tsx                 All-places MapLibre map
  place/[slug]/page.tsx        SEO-ready place details with Google Maps directions
  api/places/route.ts          Static places API, ready to swap to DB
components/
  BottomTabBar.tsx             Persistent app navigation
  GoogleDirectionsLink.tsx     External Google Maps directions link
  AllPlacesMap.tsx             Clustered all-places map
  ProfileMap.tsx               Saved/visited user map
  PlaceCard.tsx                Reusable destination card
lib/
  data/places.ts               Current static data source
  geo.ts                       Distance and Google Maps URL helpers
  lastLocation.ts              Last browser location captured by Home/Explore
  mapLibre.ts                  MapLibre CDN and tile-provider helpers
  supabase/                    Supabase clients
```

## Language Status

- UI dictionary (`lib/i18n.ts`) has English, Hindi, and Kannada strings, but hardcoded page text still needs to be fully wired into that dictionary.
- Place descriptions are English-only. The Prisma schema has a `PlaceTranslation` model ready for translated content.

## Deploying

Deploy to Vercel with:

```bash
vercel deploy --prod
```

Set Supabase env vars and `NEXT_PUBLIC_TILE_PROVIDER_URL` in Vercel production. Without the tile style, map browsing screens will show setup messages instead of falling back to public OSM infrastructure.
