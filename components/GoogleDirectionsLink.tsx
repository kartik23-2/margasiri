'use client';

import { useEffect, useState } from 'react';
import { externalDirectionsUrl, type Coords } from '@/lib/geo';
import { readLastLocation } from '@/lib/lastLocation';

export default function GoogleDirectionsLink({ destination }: { destination: Coords }) {
  const [origin, setOrigin] = useState<Coords | null>(null);

  useEffect(() => {
    setOrigin(readLastLocation());
  }, []);

  return (
    <a
      href={externalDirectionsUrl(destination, origin)}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl bg-vermillion px-5 py-3 text-sm font-semibold text-paper-light"
    >
      Get directions
    </a>
  );
}
