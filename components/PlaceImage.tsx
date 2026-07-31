import type { Place } from '@/lib/data/places';

export default function PlaceImage({
  place,
  className,
  loading = 'lazy'
}: {
  place: Place;
  className: string;
  loading?: 'eager' | 'lazy';
}) {
  return (
    <img
      src={`/api/place-image/${place.slug}`}
      alt={`${place.name}, ${place.district}, ${place.state}`}
      className={className}
      loading={loading}
    />
  );
}
