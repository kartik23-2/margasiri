'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Place } from '@/lib/data/places';
import { directionsEmbedUrl, haversineKm, type Coords } from '@/lib/geo';

type TravelMode = 'driving' | 'bicycling' | 'transit' | 'walking';

interface Props {
  place: Place;
}

const modes: { id: TravelMode; label: string; short: string; speedKmph: number }[] = [
  { id: 'driving', label: 'Drive', short: 'Car', speedKmph: 52 },
  { id: 'bicycling', label: 'Bike', short: 'Bike', speedKmph: 24 },
  { id: 'transit', label: 'Transit', short: 'Bus/train', speedKmph: 38 },
  { id: 'walking', label: 'Walk', short: 'Walk', speedKmph: 4.8 }
];

const routeVariants = [
  { name: 'Fastest route', factor: 1, note: 'Best balance of time and distance' },
  { name: 'Shorter distance', factor: 0.9, note: 'Uses a tighter route where possible' },
  { name: 'Scenic route', factor: 1.12, note: 'Leaves more room for calmer roads and viewpoints' }
];

function formatDuration(hours: number) {
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (!h) return `${m} min`;
  if (!m) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function formatClock(date: Date | null) {
  if (!date) return 'Not started';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatElapsed(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function InAppDirections({ place }: Props) {
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [originLabel, setOriginLabel] = useState('Your location');
  const [mode, setMode] = useState<TravelMode>('driving');
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [locationStatus, setLocationStatus] = useState('Use your current location for route estimates.');
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [liveSpeedKmph, setLiveSpeedKmph] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const watchIdRef = useRef<number | null>(null);

  const destination = useMemo(() => ({ lat: place.lat, lng: place.lng }), [place.lat, place.lng]);
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const straightDistance = origin ? haversineKm(origin, destination) : null;
  const routeDistance = straightDistance ? Math.max(1, straightDistance * 1.28) : null;
  const mapUrl = directionsEmbedUrl(destination, origin, mode);
  const remainingKm = routeDistance ? routeDistance * routeVariants[selectedRoute].factor : null;
  const effectiveSpeed = liveSpeedKmph && liveSpeedKmph > 2 ? liveSpeedKmph : activeMode.speedKmph;
  const liveEta = remainingKm ? formatDuration(remainingKm / effectiveSpeed) : 'Set location';
  const distanceToDestination = straightDistance ? `${straightDistance.toFixed(straightDistance > 10 ? 0 : 1)} km` : 'Set location';
  const signalStrength = accuracyMeters == null ? 8 : accuracyMeters <= 25 ? 100 : accuracyMeters <= 75 ? 72 : accuracyMeters <= 150 ? 46 : 24;

  const routes = routeVariants.map((route) => {
    const km = routeDistance ? routeDistance * route.factor : null;
    const hours = km ? km / activeMode.speedKmph : null;
    const modeDelay = mode === 'transit' ? 0.35 : mode === 'driving' ? 0.12 : 0;

    return {
      ...route,
      km,
      duration: hours ? formatDuration(hours + modeDelay) : 'Set location',
      distanceLabel: km ? `${Math.round(km)} km` : 'Needs origin'
    };
  });

  useEffect(() => {
    if (!isTracking || !startedAt) return undefined;

    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTracking, startedAt]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Location is not available in this browser.');
      return;
    }

    setLocationStatus('Finding your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setAccuracyMeters(position.coords.accuracy ?? null);
        setLastUpdated(new Date());
        setLiveSpeedKmph(position.coords.speed ? position.coords.speed * 3.6 : null);
        setOriginLabel('Your current location');
        setLocationStatus('Route estimates updated from your current location.');
      },
      () => setLocationStatus('Location permission was not allowed. You can still inspect the destination map here.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function startLiveTracking() {
    if (!navigator.geolocation) {
      setLocationStatus('Live tracking is not available in this browser.');
      return;
    }

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const started = new Date();
    setStartedAt(started);
    setElapsedSeconds(0);
    setIsTracking(true);
    setLocationStatus('Live tracking is on. Keep this page open while you travel.');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setOriginLabel('Live current location');
        setAccuracyMeters(position.coords.accuracy ?? null);
        setLastUpdated(new Date());
        setLiveSpeedKmph(position.coords.speed ? position.coords.speed * 3.6 : null);
      },
      () => {
        setIsTracking(false);
        setLocationStatus('Live tracking stopped because location permission or signal was unavailable.');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000
      }
    );
  }

  function stopLiveTracking() {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
    setLocationStatus('Live tracking stopped. Your last route estimate is still shown.');
  }

  return (
    <section id="directions" className="mb-8 scroll-mt-24">
      <div className="bg-paper-light border border-black/10 rounded-xl overflow-hidden">
        <div className="grid lg:grid-cols-[380px_1fr]">
          <aside className="border-b lg:border-b-0 lg:border-r border-black/10">
            <div className="p-5 border-b border-black/10">
              <p className="text-xs uppercase tracking-wide opacity-50 mb-3">Directions</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {modes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      mode === item.id
                        ? 'bg-indigo text-paper-light border-indigo'
                        : 'bg-paper/60 border-black/10 text-ink hover:border-indigo'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs opacity-60 block mb-1">From</span>
                  <input
                    value={originLabel}
                    onChange={(event) => {
                      setOriginLabel(event.target.value);
                      setOrigin(null);
                      setLocationStatus('Use current location to calculate live distance and time.');
                    }}
                    className="w-full rounded-lg border border-black/20 bg-paper px-3 py-3 text-sm outline-none focus:border-indigo"
                  />
                </label>
                <label className="block">
                  <span className="text-xs opacity-60 block mb-1">To</span>
                  <input
                    value={`${place.name}, ${place.district}`}
                    readOnly
                    className="w-full rounded-lg border border-black/20 bg-paper px-3 py-3 text-sm outline-none"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                className="mt-4 w-full rounded-lg bg-vermillion text-white px-4 py-3 text-sm font-semibold"
              >
                Use my location
              </button>
              <button
                type="button"
                onClick={isTracking ? stopLiveTracking : startLiveTracking}
                className={`mt-3 w-full rounded-lg px-4 py-3 text-sm font-semibold ${
                  isTracking ? 'bg-ink text-paper-light' : 'bg-indigo text-paper-light'
                }`}
              >
                {isTracking ? 'Stop live tracking' : 'Start live tracking'}
              </button>
              <p className="mt-3 text-xs leading-relaxed opacity-65">{locationStatus}</p>
            </div>

            <div className="p-5 border-b border-black/10 bg-paper/60">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-50 mb-1">Live trip</p>
                  <p className="text-sm font-semibold">{isTracking ? 'Tracking now' : 'Ready to track'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isTracking ? 'bg-pine text-white' : 'bg-black/10 text-ink'}`}>
                  {isTracking ? 'Live' : 'Off'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-black/10 bg-paper-light p-3">
                  <p className="text-xs opacity-55 mb-1">Remaining</p>
                  <p className="font-semibold">{distanceToDestination}</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-paper-light p-3">
                  <p className="text-xs opacity-55 mb-1">ETA</p>
                  <p className="font-semibold">{liveEta}</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-paper-light p-3">
                  <p className="text-xs opacity-55 mb-1">Last update</p>
                  <p className="font-mono text-xs">{formatClock(lastUpdated)}</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-paper-light p-3">
                  <p className="text-xs opacity-55 mb-1">GPS accuracy</p>
                  <p className="font-semibold">{accuracyMeters ? `~${Math.round(accuracyMeters)} m` : 'Waiting'}</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-black/10 bg-paper-light p-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="opacity-60">Trip time</span>
                  <span className="font-mono">{formatElapsed(elapsedSeconds)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-pine transition-all"
                    style={{ width: `${signalStrength}%` }}
                  />
                </div>
                <p className="mt-2 text-xs opacity-60">Tracking signal</p>
              </div>
            </div>

            <div className="divide-y divide-black/10">
              {routes.map((route, index) => (
                <button
                  key={route.name}
                  type="button"
                  onClick={() => setSelectedRoute(index)}
                  className={`w-full text-left p-5 transition ${
                    selectedRoute === index ? 'bg-paper border-l-4 border-indigo' : 'hover:bg-paper/60 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold leading-tight">{route.name}</p>
                      <p className="text-xs opacity-60 mt-1">via local roads around {place.district}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${index === 1 ? 'text-pine' : index === 2 ? 'text-vermillion' : 'text-indigo'}`}>
                        {route.duration}
                      </p>
                      <p className="text-xs opacity-60 mt-1">{route.distanceLabel}</p>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 mt-3">{route.note}</p>
                  {mode === 'driving' && index === 0 && (
                    <p className="text-xs text-vermillion mt-3">Check tolls, closures, and ghat-road conditions before starting.</p>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <div className="relative min-h-[480px] bg-paper-dark">
            <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap gap-2">
              <div className="rounded-full bg-paper-light/95 border border-black/10 px-4 py-2 text-sm shadow">
                Search along the route
              </div>
              <div className="rounded-full bg-paper-light/95 border border-black/10 px-4 py-2 text-sm shadow">Hotels</div>
              <div className="rounded-full bg-paper-light/95 border border-black/10 px-4 py-2 text-sm shadow">Food</div>
              <div className="rounded-full bg-paper-light/95 border border-black/10 px-4 py-2 text-sm shadow">Fuel</div>
            </div>
            <iframe
              title={`${place.name} directions map`}
              src={mapUrl}
              loading="lazy"
              className="w-full h-[520px] lg:h-full min-h-[520px] border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto rounded-lg bg-paper-light/95 border border-black/10 px-4 py-3 shadow">
              <p className="text-xs uppercase tracking-wide opacity-50 mb-1">Selected</p>
              <p className="text-sm font-semibold">
                {activeMode.short} to {place.name}: {isTracking ? liveEta : routes[selectedRoute].duration} · {routes[selectedRoute].distanceLabel}
              </p>
              {isTracking && (
                <p className="text-xs opacity-65 mt-1">Live GPS updates whenever your browser sends a new location.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
