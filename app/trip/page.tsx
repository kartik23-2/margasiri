'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Plus, Share2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { PLACES } from '@/lib/data/places';
import { haversineKm } from '@/lib/geo';

const TRIP_KEY = 'margasiri:trip-plan';

type TripStop = { slug: string; day: number };

function readTrip(): TripStop[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TRIP_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTrip(stops: TripStop[]) {
  window.localStorage.setItem(TRIP_KEY, JSON.stringify(stops));
}

function costEstimate(totalKm: number, days: number, people: number) {
  const fuel = Math.round((totalKm * 2 * 105) / 14);
  const tolls = Math.round(totalKm > 250 ? 600 + totalKm * 0.7 : 250);
  const stay = Math.max(0, days - 1) * Math.ceil(people / 2) * 2200;
  const food = days * people * 700;
  return { fuel, tolls, stay, food, total: fuel + tolls + stay + food };
}

function currentPosition(): Promise<GeolocationPosition | null> {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    });
  });
}

export default function TripPage() {
  const { tr } = useLanguage();
  const [stops, setStops] = useState<TripStop[]>([]);
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [people, setPeople] = useState(2);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setStops(readTrip());
  }, []);

  function persist(next: TripStop[]) {
    setStops(next);
    writeTrip(next);
  }

  const selectedPlaces = stops
    .map((stop) => ({ stop, place: PLACES.find((place) => place.slug === stop.slug) }))
    .filter((item): item is { stop: TripStop; place: (typeof PLACES)[number] } => Boolean(item.place));

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return PLACES.slice(0, 8);
    return PLACES.filter((place) => `${place.name} ${place.district} ${place.state}`.toLowerCase().includes(term)).slice(0, 8);
  }, [q]);

  const totalKm = selectedPlaces.reduce((sum, item, index) => {
    const prev = selectedPlaces[index - 1]?.place;
    if (!prev) return sum;
    return sum + haversineKm({ lat: prev.lat, lng: prev.lng }, { lat: item.place.lat, lng: item.place.lng }) * 1.28;
  }, 0);
  const days = Math.max(1, ...stops.map((stop) => stop.day));
  const cost = costEstimate(totalKm || 120, days, people);

  function addStop(slug: string) {
    if (stops.some((stop) => stop.slug === slug)) return;
    persist([...stops, { slug, day: days }]);
    setQ('');
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...stops];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  async function shareTrip() {
    const lines = selectedPlaces.map((item, index) => `${index + 1}. Day ${item.stop.day}: ${item.place.name}, ${item.place.district}`);
    setStatus('Preparing check-in...');
    const position = await currentPosition();
    const locationLine = position
      ? `Current check-in: https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
      : 'Current check-in: location unavailable. Sharing planned route only.';
    const text = `Margasiri trip from ${startDate}\n${lines.join('\n')}\n${locationLine}\nEstimated shared cost: Rs ${cost.total.toLocaleString('en-IN')}`;
    if (navigator.share) {
      await navigator.share({ title: 'Margasiri trip plan', text });
      return;
    }
    await navigator.clipboard.writeText(text);
    setStatus('Trip copied. Send it to your check-in contact before leaving.');
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <section className="mb-6 rounded-3xl bg-indigo p-5 text-paper-light">
        <p className="text-xs uppercase tracking-widest text-paper/60">{tr('trip')}</p>
        <h1 className="mt-2 font-display text-4xl">{tr('planTrip')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper/75">
          String together hidden places, group them by day, estimate rough cost, and share the plan with someone before you travel.
        </p>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-black/10 bg-paper-light p-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_140px_130px]">
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={tr('searchPlaceholder')}
              className="rounded-lg border border-black/15 bg-white px-3 py-3 text-sm"
            />
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-lg border border-black/15 bg-white px-3 py-3 text-sm"
            />
            <input
              type="number"
              min={1}
              max={12}
              value={people}
              onChange={(event) => setPeople(Math.max(1, Number(event.target.value)))}
              className="rounded-lg border border-black/15 bg-white px-3 py-3 text-sm"
              aria-label="Travelers"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((place) => (
              <button
                key={place.slug}
                type="button"
                onClick={() => addStop(place.slug)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-paper px-3 py-2 text-xs font-semibold"
              >
                <Plus size={14} />
                {place.name}
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-black/10 bg-paper-light p-4">
          <p className="text-xs uppercase tracking-widest opacity-50">Rough cost</p>
          <p className="mt-2 font-display text-3xl">Rs {cost.total.toLocaleString('en-IN')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <span>Fuel Rs {cost.fuel.toLocaleString('en-IN')}</span>
            <span>Tolls Rs {cost.tolls.toLocaleString('en-IN')}</span>
            <span>Stay Rs {cost.stay.toLocaleString('en-IN')}</span>
            <span>Food Rs {cost.food.toLocaleString('en-IN')}</span>
          </div>
          <button type="button" onClick={shareTrip} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-vermillion px-4 py-3 text-sm font-semibold text-white">
            <Share2 size={16} />
            Share trip/check-in
          </button>
          {status && <p className="mt-2 text-xs opacity-70">{status}</p>}
        </aside>
      </section>

      <section className="space-y-4">
        {selectedPlaces.length ? selectedPlaces.map((item, index) => (
          <article key={`${item.place.slug}-${index}`} className="rounded-xl border border-black/10 bg-paper-light p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo text-sm font-semibold text-paper-light">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={item.stop.day}
                    onChange={(event) => {
                      const next = [...stops];
                      next[index] = { ...next[index], day: Number(event.target.value) };
                      persist(next);
                    }}
                    className="rounded-lg border border-black/15 bg-paper px-2 py-1 text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>Day {day}</option>)}
                  </select>
                  <span className="text-xs uppercase tracking-wide opacity-50">{item.place.category}</span>
                </div>
                <Link href={`/place/${item.place.slug}`} className="mt-1 block font-display text-2xl leading-tight">{item.place.name}</Link>
                <p className="text-xs opacity-60">{item.place.district}, {item.place.state}</p>
                <p className="mt-2 text-sm leading-relaxed opacity-80">{item.place.description}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} className="rounded-lg border border-black/10 p-2" aria-label="Move up"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => move(index, 1)} className="rounded-lg border border-black/10 p-2" aria-label="Move down"><ArrowDown size={16} /></button>
                <button type="button" onClick={() => persist(stops.filter((_, i) => i !== index))} className="rounded-lg border border-black/10 p-2 text-vermillion" aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            </div>
          </article>
        )) : (
          <div className="rounded-xl border border-dashed border-black/20 bg-paper-light p-8 text-center">
            <p className="font-display text-2xl">No places added yet</p>
            <p className="mt-2 text-sm opacity-70">Search above or open a place and tap Add to trip.</p>
          </div>
        )}
      </section>
    </main>
  );
}
