import Link from 'next/link';
import type { Place } from '@/lib/data/places';
import { getPlaceCategories } from '@/lib/categories';
import { externalDirectionsUrl } from '@/lib/geo';

interface Props {
  place: Place & { distanceKm?: number | null };
  origin?: { lat: number; lng: number } | null;
  compact?: boolean;
}

export default function PlaceCard({ place, origin, compact = false }: Props) {
  const img = `https://picsum.photos/seed/${place.slug}/640/480`;
  const categories = getPlaceCategories(place).slice(0, compact ? 2 : 3);

  return (
    <div className="bg-paper-light border border-black/10 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-lg transition">
      {!compact && <img src={img} alt={place.name} className="w-full h-40 object-cover bg-paper-dark" loading="lazy" />}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span key={category} className="text-[10px] uppercase tracking-wide bg-indigo text-paper px-2 py-1 rounded-full">
                {category}
              </span>
            ))}
          </div>
          {place.distanceKm != null ? (
            <span className="font-mono text-xs font-semibold text-vermillion">↗ {place.distanceKm} km</span>
          ) : (
            <span className="font-mono text-xs text-black/40">↗ turn on location</span>
          )}
        </div>
        <Link href={`/place/${place.slug}`} className="font-display text-lg leading-tight">
          {place.name}
          {place.state === 'Karnataka' && (
            <span className="ml-2 align-middle text-[9px] bg-pine text-white px-2 py-0.5 rounded-full">★ KA</span>
          )}
        </Link>
        <p className="text-xs text-black/60 -mt-1">{place.district} District, {place.state}</p>
        <p className="text-[13px] leading-relaxed opacity-85 flex-1">{place.description}</p>
        <div className="flex gap-2 mt-2">
          <a
            href={externalDirectionsUrl({ lat: place.lat, lng: place.lng })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-indigo text-paper-light"
          >
            Directions
          </a>
          <Link
            href={`/place/${place.slug}`}
            className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-indigo text-indigo"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
