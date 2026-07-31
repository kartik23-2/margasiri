export function googleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
}

declare global {
  interface Window {
    google?: any;
    __margasiriGoogleMapsPromise?: Promise<any>;
    __margasiriGoogleMapsLoaded?: () => void;
  }
}

export function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  if (window.__margasiriGoogleMapsPromise) {
    return window.__margasiriGoogleMapsPromise;
  }

  const key = googleMapsApiKey();
  if (!key) return Promise.reject(new Error('Google Maps API key is missing.'));

  window.__margasiriGoogleMapsPromise = new Promise((resolve, reject) => {
    window.__margasiriGoogleMapsLoaded = () => resolve(window.google?.maps);

    const existing = document.querySelector<HTMLScriptElement>('script[data-margasiri-google-maps="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google?.maps));
      existing.addEventListener('error', () => reject(new Error('Google Maps could not load.')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.margasiriGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&v=weekly&callback=__margasiriGoogleMapsLoaded`;
    script.onerror = () => reject(new Error('Google Maps could not load.'));
    document.head.appendChild(script);
  });

  return window.__margasiriGoogleMapsPromise;
}

export function missingGoogleMapsMessage(surface: string) {
  return `Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render ${surface}.`;
}
