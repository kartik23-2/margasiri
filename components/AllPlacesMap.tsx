'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { googleMapsApiKey, loadGoogleMaps, missingGoogleMapsMessage } from '@/lib/googleMaps';

export default function AllPlacesMap({ places }: { places: Place[] }) {
  const { tr } = useLanguage();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [status, setStatus] = useState('');
  const apiKey = googleMapsApiKey();

  useEffect(() => {
    if (!apiKey) {
      setStatus(missingGoogleMapsMessage('this map'));
      return undefined;
    }

    let disposed = false;

    loadGoogleMaps()
      .then((maps) => {
        if (disposed || !nodeRef.current) return;

        const map = new maps.Map(nodeRef.current, {
          center: { lat: 22.5937, lng: 78.9629 },
          zoom: 4.2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false
        });
        mapRef.current = map;

        const info = new maps.InfoWindow();
        markersRef.current = places.map((place) => {
          const marker = new maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: place.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#b23a2f',
              fillOpacity: 1,
              strokeColor: '#fdfaf1',
              strokeWeight: 2
            }
          });

          marker.addListener('click', () => {
            info.setContent(`<strong>${place.name}</strong><br/><span>${place.state}</span><br/><a href="/place/${place.slug}">${tr('openDetails')}</a>`);
            info.open({ map, anchor: marker });
          });

          return marker;
        });

        setStatus(`${places.length} ${tr('placesOnMap')}`);
      })
      .catch(() => setStatus('Could not load Google Maps.'));

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [apiKey, places, tr]);

  return (
    <div className="relative h-[calc(100vh-145px)] min-h-[560px] overflow-hidden bg-indigo">
      <div ref={nodeRef} className="absolute inset-0" />
      <div className="absolute left-4 right-4 top-4 z-10 rounded-2xl bg-paper-light/95 p-4 text-ink shadow-lg sm:right-auto sm:w-80">
        <p className="text-xs uppercase tracking-widest opacity-50">{tr('map')}</p>
        <h1 className="font-display text-3xl">{tr('browseIndia')}</h1>
        <p className="mt-1 text-xs opacity-70">{status || tr('loadingMap')}</p>
      </div>
    </div>
  );
}
