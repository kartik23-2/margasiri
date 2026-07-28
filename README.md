# Margasiri

India's hidden villages, valleys and heritage sites, sorted by live distance from you. English, Hindi, Kannada.

This is a working Next.js 14 App Router + TypeScript + Tailwind application with Supabase auth/profile wiring, static place data, in-app journey screens, and a Prisma schema ready for PostgreSQL/PostGIS.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Home, Explore, Map, Saved, Profile, place detail pages, journey pages, and state pages all build from the app code.

Map screens also need:

```bash
NEXT_PUBLIC_TILE_PROVIDER_URL="https://your-provider/style.json"
OSRM_SERVER_URL="http://your-private-osrm-host:5000"
```

Use a MapLibre-compatible OpenStreetMap-data style from MapTiler, Stadia Maps, Geoapify, or your own `tileserver-gl`. Do not use the public `tile.openstreetmap.org` server for a production app.

## Working Now

- Full Next.js app, builds clean with static pages pre-rendered for SEO.
- 1237 places in `lib/data/places.ts`.
- Bottom tab app navigation: Home, Explore, Map, Saved, Profile.
- Live geolocation and Haversine distance calculation.
- Search and bottom-sheet filters on `/explore`.
- First-class `/map` tab with clustered pins for all places.
- `/saved`, `/profile`, settings, Google sign-in, and email/password auth flows.
- In-app journey screen with live position tracking, rerouting checks, arrival detection, and turn-by-turn bottom sheet.
- Map rendering through MapLibre GL JS.
- Journey routing through `/api/journey/route`, which proxies to a private OSRM server.

## OpenStreetMap Routing And Tiles

Margasiri now uses an open-source map stack instead of Mapbox.

- **Rendering:** MapLibre GL JS. This was chosen over Leaflet because the existing journey implementation already used Mapbox GL-style vector maps, markers, camera movement, and route layers. MapLibre is the open-source fork of Mapbox GL JS, so the migration keeps the same model with much less rewrite risk.
- **Tiles:** configured by `NEXT_PUBLIC_TILE_PROVIDER_URL`. Start with a managed OSM-data vector tile provider such as MapTiler, Stadia Maps, or Geoapify. This keeps the app on OpenStreetMap data without taking on tile generation infrastructure immediately.
- **Routing:** a private self-hosted OSRM server, proxied through `/api/journey/route`. The OSRM server itself should not be exposed directly to the public internet.

This is not zero-cost. It trades Mapbox's per-request billing for operational responsibility: a VPS, monitoring, OSM extract refreshes, disk space, and someone accountable when routing is down. The upside is no vendor per-call ceiling as usage grows and full control over routing data.

Recommended starter OSRM host: a modest VPS such as Hetzner CX22, DigitalOcean Basic 2 vCPU / 4 GB RAM, or AWS Lightsail 2 vCPU / 4 GB RAM with enough disk for the India extract and preprocessed OSRM files. If preprocessing fails or route traffic grows, increase RAM/disk first.

Run the repeatable refresh script on the OSRM server:

```bash
bash scripts/update-osrm-data.sh
```

The script downloads the Geofabrik India extract and runs:

```text
osrm-extract -> osrm-partition -> osrm-customize
```

Run `osrm-routed` privately and set `OSRM_SERVER_URL` in Vercel to that private base URL. Schedule `scripts/update-osrm-data.sh` monthly to start; stale OSM data means stale route quality.

If managed vector tiles become too expensive later, the next step is full tile self-hosting with OpenMapTiles + `tileserver-gl` using the same India OSM extract. That is intentionally documented as a later scaling move, not the day-one default.

Scope note: OSRM does not provide live traffic-aware routing or ETAs. Journey durations are route estimates only.

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
  place/[slug]/page.tsx        SEO-ready place details
  journey/[slug]/page.tsx      Full-screen in-app navigation
  api/journey/route/route.ts   OSRM proxy for route geometry and steps
  api/places/route.ts          Static places API, ready to swap to DB
components/
  BottomTabBar.tsx             Persistent app navigation
  JourneyMap.tsx               MapLibre + OSRM live journey screen
  JourneyStepsSheet.tsx        Turn-by-turn sheet
  AllPlacesMap.tsx             Clustered all-places map
  ProfileMap.tsx               Saved/visited user map
  PlaceCard.tsx                Reusable destination card
lib/
  data/places.ts               Current static data source
  geo.ts                       Distance helpers
  mapLibre.ts                  MapLibre CDN and tile-provider helpers
  supabase/                    Supabase clients
scripts/
  update-osrm-data.sh          OSRM India extract refresh/preprocess script
```

## Language Status

- UI dictionary (`lib/i18n.ts`) has English, Hindi, and Kannada strings, but hardcoded page text still needs to be fully wired into that dictionary.
- Place descriptions are English-only. The Prisma schema has a `PlaceTranslation` model ready for translated content.

## Deploying

Deploy to Vercel with:

```bash
vercel deploy --prod
```

Set Supabase env vars, `NEXT_PUBLIC_TILE_PROVIDER_URL`, and `OSRM_SERVER_URL` in Vercel production. Without the tile style and OSRM URL, map and routing screens will show setup messages instead of silently falling back to public OSM infrastructure.
