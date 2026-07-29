'use client';

import AddToTripButton from '@/components/AddToTripButton';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { localizedTravel } from '@/lib/localizedContent';

function nearbySearchUrl(place: { lat: number; lng: number }, query: string) {
  const q = encodeURIComponent(`${query} near ${place.lat},${place.lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function TripReadinessCard({ place }: { place: Place }) {
  const { lang, tr } = useLanguage();
  const travel = localizedTravel(lang, place);

  return (
    <article className="rounded-xl border border-black/10 bg-paper-light p-5">
      <p className="mb-2 text-xs uppercase tracking-wide opacity-50">{tr('tripReadiness')}</p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo px-3 py-1 text-xs font-semibold text-paper-light">{travel.remoteness}</span>
        {travel.safety.map((item) => (
          <span key={item} className="rounded-full bg-paper px-3 py-1 text-xs">{item}</span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed opacity-80">{tr('generatedNotes')}</p>
    </article>
  );
}

export default function TravelUtilitySections({ place }: { place: Place }) {
  const { lang, tr } = useLanguage();
  const travel = localizedTravel(lang, place);

  return (
    <>
      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50">{tr('nearbyUtilities')}</p>
            <h2 className="font-display text-3xl">{tr('planPracticalBits')}</h2>
          </div>
          <AddToTripButton place={place} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {travel.amenities.map((item) => (
            <article key={item.label} className="rounded-xl border border-black/10 bg-paper-light p-4">
              <p className="text-xs uppercase tracking-wide opacity-50">{item.label}</p>
              <p className="mt-1 font-semibold">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{item.note}</p>
              {item.query && (
                <a href={nearbySearchUrl(place, item.query)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-indigo">
                  {tr('searchNearby')}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <p className="mb-4 text-xs uppercase tracking-wide opacity-50">{tr('publicTransport')}</p>
          <div className="space-y-4">
            {travel.publicTransport.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold">{item.label}: {item.value}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-70">{item.note}</p>
                {item.query && (
                  <a href={nearbySearchUrl(place, item.query)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-indigo">
                    {tr('findOnMap')}
                  </a>
                )}
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-vermillion/25 bg-paper-light p-5">
          <p className="mb-4 text-xs uppercase tracking-wide text-vermillion">{tr('sosEmergency')}</p>
          <div className="space-y-4">
            {travel.emergency.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold">{item.label}: {item.value}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-70">{item.note}</p>
                {item.query && (
                  <a href={nearbySearchUrl(place, item.query)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-indigo">
                    {tr('findNearest')}
                  </a>
                )}
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-black/10 bg-paper-light p-5">
          <p className="mb-4 text-xs uppercase tracking-wide opacity-50">{tr('roughCostEstimator')}</p>
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
    </>
  );
}
