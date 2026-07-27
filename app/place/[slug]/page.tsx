import { notFound } from 'next/navigation';
import { PLACES, getPlaceBySlug } from '@/lib/data/places';
import { directionsUrl } from '@/lib/geo';

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return {};
  return {
    title: `${place.name} — ${place.district}, ${place.state} | Margasiri`,
    description: place.description
  };
}

export default function PlacePage({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return notFound();

  const img = `https://picsum.photos/seed/${place.slug}/1200/700`;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <img src={img} alt={place.name} className="w-full h-72 object-cover rounded-2xl bg-paper-dark mb-6" />
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-wide bg-indigo text-paper px-2 py-1 rounded-full">
          {place.category}
        </span>
        <span className="text-[10px] uppercase tracking-wide bg-pine text-white px-2 py-1 rounded-full">
          {place.verified ? 'Verified' : 'Community-submitted, unverified'}
        </span>
      </div>
      <h1 className="font-display text-4xl mb-1">{place.name}</h1>
      <p className="opacity-60 text-sm mb-6">{place.district} District, {place.state}</p>
      <p className="text-[15px] leading-relaxed opacity-85 mb-8">{place.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">Coordinates</p>
          <p className="font-mono text-sm">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">State</p>
          <p className="text-sm font-medium">{place.state}</p>
        </div>
      </div>

      <a
        href={directionsUrl({ lat: place.lat, lng: place.lng })}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-indigo text-paper-light px-6 py-3 rounded-lg font-semibold text-sm"
      >
        Get directions
      </a>
    </main>
  );
}
