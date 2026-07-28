import { notFound } from 'next/navigation';
import AddToTripButton from '@/components/AddToTripButton';
import BackButton from '@/components/BackButton';
import GoogleDirectionsLink from '@/components/GoogleDirectionsLink';
import WeatherPlanner from '@/components/WeatherPlanner';
import { getPlaceCategories } from '@/lib/categories';
import { PLACES, getPlaceBySlug } from '@/lib/data/places';
import { getPlaceDetails } from '@/lib/placeDetails';
import { getTravelIntelligence } from '@/lib/tripPlanning';

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
  const travel = getTravelIntelligence(place);

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
            <GoogleDirectionsLink destination={{ lat: place.lat, lng: place.lng }} />
            <AddToTripButton place={place} />
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

      <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <WeatherPlanner place={place} fallback={travel.weatherFallback} />
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <p className="mb-2 text-xs uppercase tracking-wide opacity-50">Trip readiness</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-indigo px-3 py-1 text-xs font-semibold text-paper-light">{travel.remoteness}</span>
            {travel.safety.slice(0, 2).map((item) => (
              <span key={item} className="rounded-full bg-paper px-3 py-1 text-xs">{item}</span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed opacity-80">
            These notes are generated from place type, district, and remoteness. Reconfirm locally before remote treks, forests, and late returns.
          </p>
        </article>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50">Nearby utilities</p>
            <h2 className="font-display text-3xl">Plan the practical bits</h2>
          </div>
          <AddToTripButton place={place} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {travel.amenities.map((item) => (
            <article key={item.label} className="rounded-xl border border-black/10 bg-paper-light p-4">
              <p className="text-xs uppercase tracking-wide opacity-50">{item.label}</p>
              <p className="mt-1 font-semibold">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <p className="mb-4 text-xs uppercase tracking-wide opacity-50">Public transport</p>
          <div className="space-y-4">
            {travel.publicTransport.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold">{item.label}: {item.value}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-70">{item.note}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-vermillion/25 bg-paper-light p-5">
          <p className="mb-4 text-xs uppercase tracking-wide text-vermillion">SOS and emergency</p>
          <div className="space-y-4">
            {travel.emergency.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold">{item.label}: {item.value}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-70">{item.note}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <p className="mb-4 text-xs uppercase tracking-wide opacity-50">Rough cost estimator</p>
          <div className="space-y-4">
            {travel.costs.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold">{item.label}: {item.value}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-70">{item.note}</p>
              </div>
            ))}
          </div>
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
          <GoogleDirectionsLink destination={{ lat: place.lat, lng: place.lng }} />
        </div>
      </div>
    </main>
  );
}
