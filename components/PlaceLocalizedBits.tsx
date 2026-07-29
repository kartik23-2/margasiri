'use client';

import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { localizedCategory, localizedPlaceDetails } from '@/lib/localizedContent';

export function CategoryBadge({ category }: { category: string }) {
  const { lang } = useLanguage();
  return <>{localizedCategory(lang, category)}</>;
}

export function CategoryName({ category }: { category: string }) {
  const { lang } = useLanguage();
  return <>{localizedCategory(lang, category)}</>;
}

export function PlaceDescription({ place }: { place: Place }) {
  const { lang } = useLanguage();
  return <>{localizedPlaceDetails(lang, place).howItIs}</>;
}

export function BestTimeText({ place }: { place: Place }) {
  const { lang } = useLanguage();
  return <>{localizedPlaceDetails(lang, place).bestTimeToVisit}</>;
}

export function ReachText({ place }: { place: Place }) {
  const { lang } = useLanguage();
  return <>{localizedPlaceDetails(lang, place).howToReach}</>;
}

export function IdealForChips({ place }: { place: Place }) {
  const { lang } = useLanguage();
  return (
    <>
      {localizedPlaceDetails(lang, place).idealFor.map((item) => (
        <span key={item} className="text-xs bg-paper-light border border-black/10 px-3 py-1.5 rounded-full">
          {item}
        </span>
      ))}
    </>
  );
}

export function ThingsToDoGrid({ place }: { place: Place }) {
  const { lang } = useLanguage();
  return (
    <>
      {localizedPlaceDetails(lang, place).thingsToDo.map((item) => (
        <div key={item} className="border border-black/10 rounded-lg p-3 bg-paper/50">
          <p className="text-sm leading-relaxed">{item}</p>
        </div>
      ))}
    </>
  );
}

export function TravelTipsList({ place }: { place: Place }) {
  const { lang } = useLanguage();
  return (
    <>
      {localizedPlaceDetails(lang, place).travelTips.map((tip) => (
        <li key={tip} className="text-sm leading-relaxed opacity-85">
          {tip}
        </li>
      ))}
    </>
  );
}
