export interface Coords {
  lat: number;
  lng: number;
}

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function mapEmbedUrl(dest: Coords, label: string): string {
  const q = encodeURIComponent(`${label} ${dest.lat},${dest.lng}`);
  return `https://maps.google.com/maps?q=${q}&z=11&output=embed`;
}

export function directionsEmbedUrl(dest: Coords, origin: Coords | null, mode: 'driving' | 'bicycling' | 'transit' | 'walking'): string {
  if (!origin) return mapEmbedUrl(dest, `${dest.lat},${dest.lng}`);

  const flags = {
    driving: 'd',
    bicycling: 'b',
    transit: 'r',
    walking: 'w'
  };

  const saddr = encodeURIComponent(`${origin.lat},${origin.lng}`);
  const daddr = encodeURIComponent(`${dest.lat},${dest.lng}`);
  return `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&dirflg=${flags[mode]}&output=embed`;
}
