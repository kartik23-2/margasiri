import { notFound } from 'next/navigation';
import AddToTripButton from '@/components/AddToTripButton';
import BackButton from '@/components/BackButton';
import GoogleDirectionsLink from '@/components/GoogleDirectionsLink';
import { T } from '@/components/LanguageProvider';
import { BestTimeText, CategoryBadge, CategoryName, IdealForChips, PlaceDescription, ReachText, ThingsToDoGrid, TravelTipsList } from '@/components/PlaceLocalizedBits';
import PlaceCard from '@/components/PlaceCard';
import TravelUtilitySections, { TripReadinessCard } from '@/components/TravelUtilitySections';
import WeatherPlanner from '@/components/WeatherPlanner';
import { getPlaceCategories } from '@/lib/categories';
import { getSimilarPlaces } from '@/lib/collections';
import { PLACES, getPlaceBySlug } from '@/lib/data/places';

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
  const categories = getPlaceCategories(place);
  const similarPlaces = getSimilarPlaces(place);

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
                <CategoryBadge category={category} />
              </span>
            ))}
            <span className="text-[10px] uppercase tracking-wide bg-pine text-white px-2 py-1 rounded-full">
              {place.verified ? <T k="verified" /> : <T k="communitySubmitted" />}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-2">{place.name}</h1>
          <p className="opacity-60 text-sm mb-6">{place.district} <T k="district" />, {place.state}</p>
          <p className="text-[15px] leading-relaxed opacity-85 mb-6"><PlaceDescription place={place} /></p>
          <div className="flex flex-wrap gap-2 mb-6">
            <IdealForChips place={place} />
          </div>
          <div className="flex flex-wrap gap-3">
            <GoogleDirectionsLink destination={{ lat: place.lat, lng: place.lng }} />
            <AddToTripButton place={place} />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-2"><T k="whenToVisit" /></p>
          <p className="text-sm leading-relaxed opacity-85"><BestTimeText place={place} /></p>
        </article>
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-2"><T k="howToReach" /></p>
          <p className="text-sm leading-relaxed opacity-85"><ReachText place={place} /></p>
        </article>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <WeatherPlanner place={place} fallback="" />
        <TripReadinessCard place={place} />
      </section>

      <TravelUtilitySections place={place} />

      <section className="mb-8">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest opacity-50"><T k="personalizedDiscovery" /></p>
          <h2 className="font-display text-3xl"><T k="placesLikeThis" /></h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {similarPlaces.map((similar) => <PlaceCard key={similar.slug} place={similar} compact />)}
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_0.85fr] gap-4 mb-8">
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-4"><T k="whatToDoThere" /></p>
          <div className="grid sm:grid-cols-3 gap-3">
            <ThingsToDoGrid place={place} />
          </div>
        </article>
        <article className="bg-paper-light border border-black/10 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide opacity-50 mb-4"><T k="travelNotes" /></p>
          <ul className="space-y-3">
            <TravelTipsList place={place} />
          </ul>
        </article>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1"><T k="coordinates" /></p>
          <p className="font-mono text-sm">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1"><T k="state" /></p>
          <p className="text-sm font-medium">{place.state}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1"><T k="district" /></p>
          <p className="text-sm font-medium">{place.district}</p>
        </div>
        <div className="bg-paper-light border border-black/10 rounded-xl p-4">
          <p className="text-xs opacity-60 mb-1"><T k="category" /></p>
          <p className="text-sm font-medium"><CategoryName category={place.category} /></p>
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
