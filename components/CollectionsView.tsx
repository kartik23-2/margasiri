'use client';

import Link from 'next/link';
import PlaceCard from '@/components/PlaceCard';
import { useLanguage } from '@/components/LanguageProvider';
import type { PlaceCollection } from '@/lib/collections';
import { localizedCollection } from '@/lib/localizedContent';

export default function CollectionsView({ collections }: { collections: PlaceCollection[] }) {
  const { lang, tr } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <section className="mb-8 rounded-3xl bg-indigo p-5 text-paper-light">
        <p className="text-xs uppercase tracking-widest text-paper/60">{tr('seasonalDiscovery')}</p>
        <h1 className="mt-2 font-display text-4xl">{tr('curatedPlacesSeason')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper/75">{tr('collectionsCopy')}</p>
      </section>

      <div className="space-y-10">
        {collections.map((rawCollection) => {
          const collection = localizedCollection(lang, rawCollection);
          return (
            <section key={collection.slug}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-50">{collection.season}</p>
                  <h2 className="font-display text-3xl">{collection.title}</h2>
                  <p className="mt-1 max-w-2xl text-sm opacity-70">{collection.description}</p>
                </div>
                <Link href={`/explore?collection=${collection.slug}`} className="rounded-lg border border-indigo px-4 py-2 text-xs font-semibold text-indigo">
                  {tr('explore')}
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {collection.places.slice(0, 6).map((place) => <PlaceCard key={place.slug} place={place} />)}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
