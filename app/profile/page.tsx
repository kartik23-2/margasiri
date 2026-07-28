import Link from 'next/link';
import { Settings } from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { PLACES } from '@/lib/data/places';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type SavedRow = { place_slug: string; created_at?: string };
type VisitedRow = { place_slug: string; visited_on?: string | null; created_at?: string };
type ContributionRow = { id: string; place_slug: string; type: string; description: string; status: string; created_at: string };

function placesFromRows(rows: { place_slug: string }[]) {
  const slugs = new Set(rows.map((row) => row.place_slug));
  return PLACES.filter((place) => slugs.has(place.slug));
}

export const metadata = {
  title: 'Profile | Margasiri'
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-4xl">Profile</h1>
        <p className="mt-3 rounded-xl border border-black/10 bg-paper-light p-5 text-sm opacity-75">
          Supabase is not configured yet. Add Supabase URL and publishable key to enable Google sign-in and profiles.
        </p>
      </main>
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl bg-indigo p-8 text-paper-light">
          <p className="text-xs uppercase tracking-widest opacity-60">Profile</p>
          <h1 className="mt-2 font-display text-4xl">Sign in to see your map</h1>
          <Link href="/signin" className="mt-6 inline-block rounded-lg bg-vermillion px-5 py-3 text-sm font-semibold">
            Continue with Google
          </Link>
        </div>
      </main>
    );
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    name: user.user_metadata?.name ?? user.email,
    email: user.email,
    image: user.user_metadata?.avatar_url
  });

  const [{ data: saved }, { data: visited }, { data: contributions }] = await Promise.all([
    supabase.from('saved_places').select('place_slug, created_at').eq('user_id', user.id),
    supabase.from('visited_places').select('place_slug, visited_on, created_at').eq('user_id', user.id),
    supabase.from('contributions').select('id, place_slug, type, description, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
  ]);

  const savedPlaces = placesFromRows((saved ?? []) as SavedRow[]);
  const visitedPlaces = placesFromRows((visited ?? []) as VisitedRow[]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="mb-8 rounded-2xl bg-indigo p-6 text-paper-light">
        <div className="flex flex-wrap items-center gap-5">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="h-20 w-20 rounded-full border-4 border-paper object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-paper text-2xl font-semibold text-indigo">
              {(user.email ?? 'M').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60">Your Margasiri profile</p>
            <h1 className="font-display text-4xl">{user.user_metadata?.name ?? user.email}</h1>
            <p className="mt-1 text-sm opacity-75">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/profile/map" className="rounded-lg bg-paper-light px-4 py-3 text-sm font-semibold text-indigo">
              My Map
            </Link>
            <Link href="/settings" className="rounded-full bg-paper-light p-3 text-indigo" aria-label="Settings">
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl">Saved</h2>
        {savedPlaces.length ? (
          <div className="grid gap-4 md:grid-cols-3">{savedPlaces.map((place) => <PlaceCard key={place.slug} place={place} compact />)}</div>
        ) : (
          <p className="rounded-xl border border-black/10 bg-paper-light p-5 text-sm opacity-70">No saved places yet.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl">Visited</h2>
        {visitedPlaces.length ? (
          <div className="grid gap-4 md:grid-cols-3">{visitedPlaces.map((place) => <PlaceCard key={place.slug} place={place} compact />)}</div>
        ) : (
          <p className="rounded-xl border border-black/10 bg-paper-light p-5 text-sm opacity-70">No visited places marked yet.</p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <h2 className="font-display text-2xl">My places</h2>
          <p className="mt-2 text-sm opacity-70">Places you add through crowdsourcing will appear here with moderation status.</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <h2 className="font-display text-2xl">My improvements</h2>
          <div className="mt-4 divide-y divide-black/10">
            {((contributions ?? []) as ContributionRow[]).length ? (
              ((contributions ?? []) as ContributionRow[]).map((item) => (
                <div key={item.id} className="py-3">
                  <p className="text-sm font-semibold">{item.type} for {item.place_slug}</p>
                  <p className="mt-1 text-xs opacity-70">{item.description}</p>
                  <span className="mt-2 inline-block rounded-full bg-paper px-2 py-1 text-[10px] uppercase tracking-wide">{item.status}</span>
                </div>
              ))
            ) : (
              <p className="text-sm opacity-70">No improvements submitted yet.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
