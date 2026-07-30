export const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
export const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';

export function osmStyleUrl() {
  if (process.env.NEXT_PUBLIC_TILE_PROVIDER_URL) {
    return process.env.NEXT_PUBLIC_TILE_PROVIDER_URL;
  }

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (mapTilerKey) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
  }

  return '';
}

export function missingTileProviderMessage(surface: string) {
  return `OpenStreetMap tile style is missing. Add NEXT_PUBLIC_MAPTILER_API_KEY or NEXT_PUBLIC_TILE_PROVIDER_URL to render ${surface}. Do not use tile.openstreetmap.org for production apps.`;
}
