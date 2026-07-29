'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

export default function BackButton() {
  const router = useRouter();
  const { tr } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute left-4 top-4 z-10 rounded-full bg-paper-light/95 p-3 text-indigo shadow-lg backdrop-blur"
      aria-label={tr('goBack')}
    >
      <ArrowLeft size={20} />
    </button>
  );
}
