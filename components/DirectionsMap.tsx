'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, LocateFixed } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { haversineKm, type Coords } from '@/lib/geo';
import { googleMapsApiKey, loadGoogleMaps, missingGoogleMapsMessage } from '@/lib/googleMaps';
import { readLastLocation, saveLastLocation } from '@/lib/lastLocation';

interface RouteSummary {
  distanceKm: number;
  durationMin: number;
}

interface LivePositionMeta {
  accuracy: number | null;
  updatedAt: number | null;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

function formatTime(value: number | null) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(value);
}

function summarizeRoute(result: any): RouteSummary | null {
  const route = result?.routes?.[0];
  if (!route?.legs?.length) return null;

  const totals = route.legs.reduce((acc: RouteSummary, leg: any) => ({
    distanceKm: acc.distanceKm + (leg.distance?.value ?? 0) / 1000,
    durationMin: acc.durationMin + (leg.duration?.value ?? 0) / 60
  }), { distanceKm: 0, durationMin: 0 });

  return totals.distanceKm > 0 ? totals : null;
}

function fitJourneyBounds(map: any, maps: any, origin: Coords | null, destination: Coords) {
  if (!origin) {
    map.panTo(destination);
    map.setZoom(12);
    return;
  }

  const bounds = new maps.LatLngBounds();
  bounds.extend(origin);
  bounds.extend(destination);
  map.fitBounds(bounds, { top: 92, bottom: 300, left: 42, right: 42 });
}

export default function DirectionsMap({ place }: { place: Place }) {
  const { tr } = useLanguage();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapsRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [status, setStatus] = useState('Loading Google Maps...');
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [liveMeta, setLiveMeta] = useState<LivePositionMeta>({ accuracy: null, updatedAt: null });
  const apiKey = googleMapsApiKey();
  const destination = useMemo(() => ({ lat: place.lat, lng: place.lng }), [place.lat, place.lng]);

  useEffect(() => {
    setOrigin(readLastLocation());
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setStatus(missingGoogleMapsMessage('journey directions'));
      return undefined;
    }

    let disposed = false;
    setMapReady(false);

    loadGoogleMaps()
      .then((maps) => {
        if (disposed || !nodeRef.current) return;

        mapsRef.current = maps;
        const map = new maps.Map(nodeRef.current, {
          center: destination,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false
        });

        mapRef.current = map;
        directionsServiceRef.current = new maps.DirectionsService();
        directionsRendererRef.current = new maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: {
            strokeColor: '#1a73e8',
            strokeOpacity: 0.95,
            strokeWeight: 6
          }
        });

        destinationMarkerRef.current = new maps.Marker({
          position: destination,
          map,
          title: place.name,
          label: { text: 'B', color: '#ffffff', fontWeight: '700' },
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#b23a2f',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });

        setStatus(origin ? 'Finding Google route...' : 'Tap Start journey to show your live location and route.');
        setMapReady(true);
      })
      .catch(() => setStatus('Could not load Google Maps.'));

    return () => {
      disposed = true;
      directionsRendererRef.current?.setMap(null);
      destinationMarkerRef.current?.setMap(null);
      currentMarkerRef.current?.setMap(null);
      accuracyCircleRef.current?.setMap(null);
      mapRef.current = null;
      mapsRef.current = null;
      setMapReady(false);
    };
  }, [apiKey, destination, origin, place.name]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || !mapReady || !origin) return;

    if (!currentMarkerRef.current) {
      currentMarkerRef.current = new maps.Marker({
        position: origin,
        map,
        title: 'Your current location',
        label: { text: 'A', color: '#ffffff', fontWeight: '700' },
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: '#1a73e8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });
    } else {
      currentMarkerRef.current.setPosition(origin);
    }

    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new maps.Circle({
        map,
        center: origin,
        radius: liveMeta.accuracy ?? 25,
        strokeColor: '#1a73e8',
        strokeOpacity: 0.22,
        strokeWeight: 1,
        fillColor: '#1a73e8',
        fillOpacity: 0.12
      });
    } else {
      accuracyCircleRef.current.setCenter(origin);
      accuracyCircleRef.current.setRadius(liveMeta.accuracy ?? 25);
    }
  }, [liveMeta.accuracy, mapReady, origin]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    const directionsService = directionsServiceRef.current;
    const directionsRenderer = directionsRendererRef.current;
    if (!maps || !map || !directionsService || !directionsRenderer || !mapReady || !origin) return;

    let disposed = false;
    setStatus('Finding Google route...');

    directionsService.route(
      {
        origin,
        destination,
        travelMode: maps.TravelMode.DRIVING,
        provideRouteAlternatives: false
      },
      (result: any, routeStatus: string) => {
        if (disposed) return;

        if (routeStatus === maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          const nextSummary = summarizeRoute(result);
          setSummary(nextSummary);
          fitJourneyBounds(map, maps, origin, destination);
          setStatus(tracking ? 'Live journey tracking is on. Google route updated from your current location.' : 'Google route ready inside Margasiri.');
          return;
        }

        const straightKm = haversineKm(origin, destination);
        setSummary({ distanceKm: straightKm, durationMin: straightKm * 2 });
        fitJourneyBounds(map, maps, origin, destination);
        setStatus('Google route is unavailable right now, showing approximate distance.');
      }
    );

    return () => {
      disposed = true;
    };
  }, [destination, mapReady, origin, tracking]);

  function updateLivePosition(position: GeolocationPosition) {
    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
    saveLastLocation(coords);
    setOrigin(coords);
    setLiveMeta({
      accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
      updatedAt: Date.now()
    });
  }

  function startJourney() {
    if (!navigator.geolocation) {
      setStatus('Location is not available in this browser.');
      return;
    }

    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);

    setGeoBusy(true);
    setStatus('Starting live journey tracking...');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLivePosition(position);
        setGeoBusy(false);
        setTracking(true);
      },
      () => {
        setGeoBusy(false);
        setTracking(false);
        setStatus('Location permission was blocked. Turn it on to track your journey.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  function stopJourney() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setGeoBusy(false);
    setStatus(origin ? 'Live journey paused. Your last known location is still shown.' : 'Live journey paused.');
  }

  function recenterJourney() {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;
    fitJourneyBounds(map, maps, origin, destination);
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-indigo">
      <div ref={nodeRef} className="absolute inset-0" />

      <div className="absolute left-3 right-3 top-[max(env(safe-area-inset-top),0.75rem)] z-20 flex items-center gap-2 md:left-4 md:right-auto md:w-[430px]">
        <Link
          href={`/place/${place.slug}`}
          aria-label="Back to place"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-light text-ink shadow-xl"
        >
          <ChevronLeft size={24} />
        </Link>
        <div className="min-w-0 flex-1 rounded-full bg-paper-light px-4 py-2 text-ink shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink/45">{tracking ? 'Live journey' : tr('directions')}</p>
          <p className="truncate text-sm font-semibold">{place.name}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={recenterJourney}
        className="absolute bottom-[330px] right-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-paper-light text-ink shadow-xl md:bottom-8"
        aria-label="Recenter map"
      >
        <LocateFixed size={22} />
      </button>

      <section className="absolute inset-x-0 bottom-0 z-20 rounded-t-[28px] border border-black/10 bg-paper-light/95 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-ink shadow-2xl backdrop-blur md:inset-auto md:left-4 md:top-20 md:w-[430px] md:rounded-2xl md:p-4">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-black/15 md:hidden" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest opacity-50">To</p>
            <h1 className="truncate font-display text-2xl leading-tight md:text-3xl">{place.name}</h1>
            <p className="mt-0.5 truncate text-xs opacity-65">{place.district}, {place.state}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-paper-light ${tracking ? 'bg-pine' : 'bg-indigo'}`}>
            {tracking ? 'Live' : 'Google'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Distance</p>
            <p className="font-mono text-lg font-semibold">{summary ? `${summary.distanceKm.toFixed(1)} km` : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Time</p>
            <p className="font-mono text-lg font-semibold">{summary ? formatDuration(summary.durationMin) : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Accuracy</p>
            <p className="font-mono text-sm font-semibold">{liveMeta.accuracy ? `${Math.round(liveMeta.accuracy)} m` : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Updated</p>
            <p className="font-mono text-sm font-semibold">{formatTime(liveMeta.updatedAt)}</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed opacity-70">{status}</p>
        <button
          type="button"
          onClick={tracking ? stopJourney : startJourney}
          disabled={geoBusy}
          className={`mt-4 h-14 w-full rounded-2xl px-4 text-base font-bold text-paper-light shadow-lg disabled:opacity-60 ${tracking ? 'bg-indigo' : 'bg-vermillion'}`}
        >
          {geoBusy ? 'Getting location...' : tracking ? 'Stop journey' : 'Start journey'}
        </button>
      </section>
    </main>
  );
}
