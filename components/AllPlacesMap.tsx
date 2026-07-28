'use client';

import { useEffect, useRef, useState } from 'react';
import type { Place } from '@/lib/data/places';
import { MAPLIBRE_CSS, MAPLIBRE_JS, missingTileProviderMessage, osmStyleUrl } from '@/lib/mapLibre';

declare global {
  interface Window {
    maplibregl?: any;
  }
}

function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);

  return new Promise<any>((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPLIBRE_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.maplibregl));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => resolve(window.maplibregl);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function AllPlacesMap({ places }: { places: Place[] }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState('Loading map...');
  const tileStyleUrl = osmStyleUrl();

  useEffect(() => {
    if (!tileStyleUrl) {
      setStatus(missingTileProviderMessage('the India map tab'));
      return undefined;
    }

    let disposed = false;
    loadMapLibre()
      .then((maplibregl) => {
        if (disposed || !nodeRef.current) return;
        const map = new maplibregl.Map({
          container: nodeRef.current,
          style: tileStyleUrl,
          center: [78.9629, 22.5937],
          zoom: 4.2,
          attributionControl: true
        });
        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        mapRef.current = map;

        map.on('load', () => {
          const data = {
            type: 'FeatureCollection',
            features: places.map((place) => ({
              type: 'Feature',
              properties: {
                name: place.name,
                state: place.state,
                slug: place.slug,
                category: place.category
              },
              geometry: { type: 'Point', coordinates: [place.lng, place.lat] }
            }))
          };

          map.addSource('places', {
            type: 'geojson',
            data,
            cluster: true,
            clusterMaxZoom: 8,
            clusterRadius: 42
          });

          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'places',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#1b2a4a',
              'circle-radius': ['step', ['get', 'point_count'], 18, 50, 24, 150, 32],
              'circle-stroke-color': '#d9a441',
              'circle-stroke-width': 2
            }
          });
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'places',
            filter: ['has', 'point_count'],
            layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
            paint: { 'text-color': '#fdfaf1' }
          });
          map.addLayer({
            id: 'place-points',
            type: 'circle',
            source: 'places',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#b23a2f',
              'circle-radius': 6,
              'circle-stroke-color': '#fdfaf1',
              'circle-stroke-width': 2
            }
          });

          map.on('click', 'clusters', (event: any) => {
            const features = map.queryRenderedFeatures(event.point, { layers: ['clusters'] });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('places').getClusterExpansionZoom(clusterId, (err: Error, zoom: number) => {
              if (err) return;
              map.easeTo({ center: features[0].geometry.coordinates, zoom });
            });
          });

          map.on('click', 'place-points', (event: any) => {
            const feature = event.features?.[0];
            if (!feature) return;
            const props = feature.properties;
            new maplibregl.Popup()
              .setLngLat(feature.geometry.coordinates)
              .setHTML(`<strong>${props.name}</strong><br/><span>${props.state}</span><br/><a href="/place/${props.slug}">Open details</a>`)
              .addTo(map);
          });

          setStatus(`${places.length} places on the map.`);
        });
      })
      .catch(() => setStatus('Could not load the OSM map style.'));

    return () => {
      disposed = true;
      mapRef.current?.remove();
    };
  }, [places, tileStyleUrl]);

  return (
    <div className="relative h-[calc(100vh-145px)] min-h-[560px] overflow-hidden bg-indigo">
      <div ref={nodeRef} className="absolute inset-0" />
      <div className="absolute left-4 right-4 top-4 z-10 rounded-2xl bg-paper-light/95 p-4 text-ink shadow-lg sm:right-auto sm:w-80">
        <p className="text-xs uppercase tracking-widest opacity-50">Map</p>
        <h1 className="font-display text-3xl">Browse India</h1>
        <p className="mt-1 text-xs opacity-70">{status}</p>
      </div>
    </div>
  );
}
