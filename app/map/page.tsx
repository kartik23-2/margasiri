import AllPlacesMap from '@/components/AllPlacesMap';
import { PLACES } from '@/lib/data/places';

export const metadata = {
  title: 'Map | Margasiri'
};

export default function MapPage() {
  return <AllPlacesMap places={PLACES} />;
}
