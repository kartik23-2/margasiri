# Margasiri

India's hidden villages, valleys and heritage sites — sorted by live distance from you. English, Hindi, Kannada.

This is the real application, not a mockup: a working Next.js 14 (App Router) + TypeScript + Tailwind codebase, with a Prisma schema ready for PostgreSQL/PostGIS. It builds and runs today on static seed data (51 verified Karnataka places + 33 seeded across other states), and is structured so swapping in a live database is a small change, not a rewrite.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Home page, `/explore`, individual `/place/[slug]` pages, and `/state/[slug]` pages all work immediately — no database required, because they currently read from `lib/data/places.ts`.

## What's real vs. what's next

**Working right now:**
- Full Next.js app, builds clean (`npm run build` — verified, 108 static pages pre-rendered for SEO)
- Live geolocation + real Haversine distance calculation, both client-side and via `/api/places`
- Search, state filter, category filter on `/explore`
- Individual SEO-ready pages for every place and every state (this is the SEO growth engine from the roadmap doc)
- "Verified" vs "Community-submitted, unverified" badge already wired into the data model and the UI
- Prisma schema modeling the full plan: states, districts, places, translations, images, reviews, saved places, and a `Submission` quarantine table for crowdsourcing

**Needs a real database to go further** (see below):
- Currently all data lives in `lib/data/places.ts` (TypeScript, not a database) — this was deliberate, so the app runs and demos with zero setup
- Swapping to Prisma + Postgres is a contained change: see `app/api/places/route.ts`, which has the exact swap commented in

## Connecting a real database

1. Get a Postgres instance with PostGIS available — **Supabase** or **Neon** both work well and have generous free tiers, or **Railway**.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Enable PostGIS and add the geography column (see the comment block at the bottom of `prisma/schema.prisma` — it has the exact SQL). This is what makes "places within N km" queries fast once you're past a few thousand rows; below that, plain lat/lng columns (already in the schema) are fine.
5. Write a seed script (`prisma/seed.ts`) that inserts the places from `lib/data/places.ts` — that file is already structured 1:1 with the schema, so this is mostly a loop, not a rewrite.
6. Update `app/api/places/route.ts` to query Prisma instead of the static array (the swap is commented directly in that file).

## Project structure

```
app/
  page.tsx              Home — hero, live location toggle, nearby places
  explore/page.tsx       Search + filter + full listing
  place/[slug]/page.tsx  Individual place page (SEO-critical, statically generated)
  state/[slug]/page.tsx  State overview page
  api/places/route.ts    API route — swap this for Prisma when ready
components/
  Nav.tsx
  PlaceCard.tsx           Core reusable card, used on home/explore/state pages
lib/
  data/places.ts          Current data source — 84 places, typed, ready to seed a DB from
  geo.ts                  Haversine distance + Google Maps directions URL builder
  i18n.ts                 EN/HI/KN dictionary (UI strings — see note below)
prisma/
  schema.prisma           Full database schema, PostGIS upgrade path documented inline
```

## Language status

- UI dictionary (`lib/i18n.ts`) has English, Hindi, and Kannada strings, but **is not yet wired into the pages** — pages are English-only right now. Next step: a language context/provider and swapping hardcoded strings for `t(lang, 'key')` calls.
- Place descriptions are English-only. The Prisma schema already has a `PlaceTranslation` model (one row per place per language) ready for this — translating the 51 Karnataka descriptions into Hindi and Kannada is the next real content task, not a technical blocker.

## Known gaps (intentionally not built yet)

- No authentication yet (`User` model exists in the schema, no auth flow wired up)
- No image upload / real photos — using picsum.photos placeholders, matching the earlier prototype
- No admin/moderation panel for the `Submission` table yet
- No mobile app (React Native) yet — this is the web app only

## Deploying

This is a standard Next.js app — deploys cleanly to Vercel (`vercel deploy`) or any Node host. Set `DATABASE_URL` as an environment variable once a real database is connected.
