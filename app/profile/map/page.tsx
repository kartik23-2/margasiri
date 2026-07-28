import Link from 'next/link';
import ProfileMap from '@/components/ProfileMap';
import { PLACES } from '@/lib/data/places';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'My Map | Margasiri'
};

export const dynamic = 'force-dynamic';

function placesFromSlugs(rows: { place_slug: string }[]) {
  const slugs = new Set(rows.map((row) => row.place_slug));
  return PLACES.filter((place) => slugs.has(place.slug));
}

export default async function ProfileMapPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-4xl">My Map</h1>
        <p className="mt-3 rounded-xl border border-black/10 bg-paper-light p-5 text-sm opacity-75">Supabase is not configured yet.</p>
      </main>
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-4xl">My Map</h1>
        <Link href="/signin" className="mt-5 inline-block rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-paper-light">
          Sign in to view your map
        </Link>
      </main>
    );
  }

  const [{ data: saved }, { data: visited }] = await Promise.all([
    supabase.from('saved_places').select('place_slug').eq('user_id', userData.user.id),
    supabase.from('visited_places').select('place_slug').eq('user_id', userData.user.id)
  ]);

  return <ProfileMap saved={placesFromSlugs(saved ?? [])} visited={placesFromSlugs(visited ?? [])} />;
}
