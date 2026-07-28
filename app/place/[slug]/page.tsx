import { notFound } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import InAppDirections from '@/components/InAppDirections';
import { getPlaceCategories } from '@/lib/categories';
import { PLACES, getPlaceBySlug } from '@/lib/data/places';
import { getPlaceDetails } from '@/lib/placeDetails';

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return {};
  return {
    title: `${place.name} - ${place.district}, ${place.state} | Margasiri`,
    description: place.description
  };
}

export default function PlacePage({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) return notFound();

  const img = `https://picsum.photos/seed/${place.slug}/1200/700`;
  const details = getPlaceDetails(place);
  const categories = getPlaceCategories(place);

  return (
    <main className="mx-auto max-w-5xl px-6 py-6 pb-36">
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start mb-10">
        <div className="relative">
          <BackButton />
          <img src={img} alt={place.name} className="w-full h-80 lg:h-[430px] object-cover rounded-2xl bg-paper-dark" />
        </div>
        <div className="lg:pt-3">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categories.map((category) => (
              <span key={category} className="text-[10px] uppercase tracking-wide bg-indigo text-paper px-2 py-1 rounded-full">
                {category}
              </span>
            ))}
            <span className="text-[10px] uppercase tracking-wide bg-pine text-white px-2 py-1 rounded-full">
              {place.verified ? 'Verified' : 'Community-submitted, unverified'}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-2">{place.name}</h1>
          <p className="opacity-60 text-sm mb-6">{place.district} District, {place.state}</p>
          <p className="text-[15px] leading-relaxed opacity-85 mb-6">{details.howItIs}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {details.idealFor.map((item) => (
              <span key={item} className="text-xs bg-paper-light border border-black/10 px-3 py-1.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#directions" className="inline-block border border-black/15 px-6 py-3 rounded-lg font-semibold text-sm">
              Preview route
            </a>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-2">When to visit</p>
          <p className="text-sm leading-relaxed opacity-85">{details.bestTimeToVisit}</p>
        </article>
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-2">How to reach</p>
          <p className="text-sm leading-relaxed opacity-85">{details.howToReach}</p>
        </article>
      </section>

      <section className="grid lg:grid-cols-[1fr_0.85fr] gap-4 mb-8">
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-4">What to do there</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {details.thingsToDo.map((item) => (
              <div key={item} className="border border-black/10 rounded-lg p-3 bg-paper/50">
                <p className="text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-4">Travel notes</p>
          <ul className="space-y-3">
            {details.travelTips.map((tip) => (
              <li key={tip} className="text-sm leading-relaxed opacity-85">
                {tip}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <InAppDirections place={place} />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">Coordinates</p>
          <p className="font-mono text-sm">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">State</p>
          <p className="text-sm font-medium">{place.state}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">District</p>
          <p className="text-sm font-medium">{place.district}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1">Category</p>
          <p className="text-sm font-medium">{place.category}</p>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[76px] z-40 border-t border-black/10 bg-paper/95 px-4 py-3 shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{place.name}</p>
            <p className="text-xs opacity-60">{place.district}, {place.state}</p>
          </div>
          <Link href={`/journey/${place.slug}`} className="rounded-xl bg-vermillion px-5 py-3 text-sm font-semibold text-paper-light">
            Start Journey
          </Link>
        </div>
      </div>
    </main>
  );
}
