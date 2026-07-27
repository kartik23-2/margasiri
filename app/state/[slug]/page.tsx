import { notFound } from 'next/navigation';
import PlaceCard from '@/components/PlaceCard';
import { getPlacesByState, getStates } from '@/lib/data/places';

export function generateStaticParams() {
  return getStates().map((s) => ({ slug: s.slug }));
}

export default function StatePage({ params }: { params: { slug: string } }) {
  const places = getPlacesByState(params.slug);
  if (places.length === 0) return notFound();
  const stateName = places[0].state;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-2">{stateName}</h1>
      <p className="opacity-60 text-sm mb-8">{places.length} places mapped</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {places.map((p) => (
          <PlaceCard key={p.slug} place={p} />
        ))}
      </div>
    </main>
  );
}
