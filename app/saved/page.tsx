import Link from 'next/link';
import { T } from '@/components/LanguageProvider';
import PlaceCard from '@/components/PlaceCard';
import { PLACES } from '@/lib/data/places';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Saved | Margasiri'
};

export const dynamic = 'force-dynamic';

function placesFromRows(rows: { place_slug: string }[]) {
  const slugs = new Set(rows.map((row) => row.place_slug));
  return PLACES.filter((place) => slugs.has(place.slug));
}

export default async function SavedPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-xs uppercase tracking-widest opacity-50"><T k="wishlist" /></p>
        <h1 className="font-display text-4xl"><T k="savedPlaces" /></h1>
        <p className="mt-5 rounded-2xl border border-black/10 bg-paper-light p-5 text-sm opacity-75">
          <T k="supabaseSavedMissing" />
        </p>
      </main>
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl bg-indigo p-6 text-paper-light">
          <p className="text-xs uppercase tracking-widest opacity-60"><T k="wishlist" /></p>
          <h1 className="mt-2 font-display text-4xl"><T k="savePlacesLater" /></h1>
          <p className="mt-2 max-w-lg text-sm opacity-75"><T k="savedSigninCopy" /></p>
          <Link href="/signin" className="mt-5 inline-block rounded-xl bg-vermillion px-5 py-3 text-sm font-semibold">
            <T k="signIn" />
          </Link>
        </div>
      </main>
    );
  }

  const { data } = await supabase.from('saved_places').select('place_slug').eq('user_id', userData.user.id);
  const savedPlaces = placesFromRows(data ?? []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <p className="text-xs uppercase tracking-widest opacity-50"><T k="wishlist" /></p>
      <h1 className="font-display text-4xl"><T k="savedPlaces" /></h1>
      <p className="mb-6 mt-2 text-sm opacity-70">{savedPlaces.length} <T k="placesSaved" /></p>

      {savedPlaces.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {savedPlaces.map((place) => (
            <PlaceCard key={place.slug} place={place} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-black/10 bg-paper-light p-5 text-sm opacity-75">
          <T k="noSavedPlaces" />
        </p>
      )}
    </main>
  );
}
