import { notFound } from 'next/navigation';
import DirectionsMap from '@/components/DirectionsMap';
import { PLACES, getPlaceBySlug } from '@/lib/data/places';

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return {};
  return {
    title: `Directions to ${place.name} | Margasiri`,
    description: `Google Maps-powered in-app directions to ${place.name}, ${place.district}, ${place.state}.`
  };
}

export default function DirectionsPage({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return notFound();

  return <DirectionsMap place={place} />;
}
