import { notFound } from 'next/navigation';
import JourneyMap from '@/components/JourneyMap';
import { PLACES, getPlaceBySlug } from '@/lib/data/places';

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return {};

  return {
    title: `Journey to ${place.name} | Margasiri`,
    description: `Live in-app navigation to ${place.name}, ${place.district}, ${place.state}.`
  };
}

export default function JourneyPage({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return notFound();

  return <JourneyMap place={place} />;
}
