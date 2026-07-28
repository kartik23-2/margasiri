'use client';

import { useEffect, useRef, useState } from 'react';
import type { Place } from '@/lib/data/places';

declare global {
  interface Window {
    mapboxgl?: any;
  }
}

const MAPBOX_CSS = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css';
const MAPBOX_JS = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js';

function loadMapbox() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);

  return new Promise<any>((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPBOX_CSS;
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function brandStyle(): any {
  return {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
      composite: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' }
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e9e0c9' } },
      { id: 'landuse', type: 'fill', source: 'composite', 'source-layer': 'landuse', paint: { 'fill-color': '#d9dcc5', 'fill-opacity': 0.55 } },
      { id: 'water', type: 'fill', source: 'composite', 'source-layer': 'water', paint: { 'fill-color': '#8db8bd' } },
      { id: 'roads', type: 'line', source: 'composite', 'source-layer': 'road', paint: { 'line-color': '#fdfaf1', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.2, 12, 3] } },
      { id: 'labels', type: 'symbol', source: 'composite', 'source-layer': 'place_label', layout: { 'text-field': ['get', 'name'], 'text-size': 12 }, paint: { 'text-color': '#1b2a4a', 'text-halo-color': '#e9e0c9', 'text-halo-width': 1 } }
    ]
  };
}

export default function AllPlacesMap({ places }: { places: Place[] }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState('Loading map...');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token) {
      setStatus('Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to browse by map.');
      return undefined;
    }

    let disposed = false;
    loadMapbox()
      .then((mapboxgl) => {
        if (disposed || !nodeRef.current) return;
        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
          container: nodeRef.current,
          style: brandStyle(),
          center: [78.9629, 22.5937],
          zoom: 4.2,
          attributionControl: false
        });
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
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
            new mapboxgl.Popup()
              .setLngLat(feature.geometry.coordinates)
              .setHTML(`<strong>${props.name}</strong><br/><span>${props.state}</span><br/><a href="/place/${props.slug}">Open details</a>`)
              .addTo(map);
          });

          setStatus(`${places.length} places on the map.`);
        });
      })
      .catch(() => setStatus('Could not load Mapbox.'));

    return () => {
      disposed = true;
      mapRef.current?.remove();
    };
  }, [places, token]);

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
