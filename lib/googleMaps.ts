export function googleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
}

const GOOGLE_MAPS_SETUP_MESSAGE =
  'Google Maps is blocked by Google Cloud setup. Enable billing, enable the Maps JavaScript API and Directions API, and make sure this browser key allows https://margasiri.vercel.app/* as an HTTP referrer.';

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
    __margasiriGoogleMapsPromise?: Promise<any>;
    __margasiriGoogleMapsLoaded?: () => void;
    __margasiriGoogleMapsAuthError?: string | null;
    __margasiriGoogleMapsAuthListeners?: Set<(message: string) => void>;
  }
}

export function googleMapsSetupMessage() {
  return GOOGLE_MAPS_SETUP_MESSAGE;
}

function notifyGoogleMapsAuthFailure() {
  window.__margasiriGoogleMapsAuthError = GOOGLE_MAPS_SETUP_MESSAGE;
  window.__margasiriGoogleMapsAuthListeners?.forEach((listener) => listener(GOOGLE_MAPS_SETUP_MESSAGE));
}

export function subscribeGoogleMapsAuthFailure(listener: (message: string) => void) {
  if (!window.__margasiriGoogleMapsAuthListeners) {
    window.__margasiriGoogleMapsAuthListeners = new Set();
  }

  window.__margasiriGoogleMapsAuthListeners.add(listener);

  if (window.__margasiriGoogleMapsAuthError) {
    listener(window.__margasiriGoogleMapsAuthError);
  }

  return () => {
    window.__margasiriGoogleMapsAuthListeners?.delete(listener);
  };
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
    window.gm_authFailure = notifyGoogleMapsAuthFailure;

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&v=weekly&auth_referrer_policy=origin&callback=__margasiriGoogleMapsLoaded`;
    script.onerror = () => reject(new Error('Google Maps could not load.'));
    document.head.appendChild(script);
  });

  return window.__margasiriGoogleMapsPromise;
}

export function missingGoogleMapsMessage(surface: string) {
  return `Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render ${surface}.`;
}
