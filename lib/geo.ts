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

export function directionsUrl(dest: Coords, origin?: Coords | null): string {
  const base = 'https://www.google.com/maps/dir/?api=1';
  const destination = `destination=${dest.lat},${dest.lng}`;
  const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';
  return `${base}&${destination}${originParam}`;
}
