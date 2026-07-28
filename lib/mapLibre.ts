export const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
export const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';

export function osmStyleUrl() {
  return process.env.NEXT_PUBLIC_TILE_PROVIDER_URL ?? '';
}

export function missingTileProviderMessage(surface: string) {
  return `OpenStreetMap tile style is missing. Add NEXT_PUBLIC_TILE_PROVIDER_URL to render ${surface}. Do not use tile.openstreetmap.org for production apps.`;
}
