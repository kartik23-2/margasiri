'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute left-4 top-4 z-10 rounded-full bg-paper-light/95 p-3 text-indigo shadow-lg backdrop-blur"
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
    </button>
  );
}
