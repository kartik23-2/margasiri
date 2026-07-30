'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function DirectionsLink({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const { tr } = useLanguage();

  return (
    <Link
      href={`/directions/${slug}`}
      className={compact
        ? 'flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-indigo text-paper-light'
        : 'rounded-xl bg-vermillion px-5 py-3 text-sm font-semibold text-paper-light'}
    >
      {compact ? tr('directions') : tr('getDirections')}
    </Link>
  );
}
