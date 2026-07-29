import CollectionsView from '@/components/CollectionsView';
import { getSeasonalCollections } from '@/lib/collections';

export const metadata = {
  title: 'Collections | Margasiri'
};

export default function CollectionsPage() {
  return <CollectionsView collections={getSeasonalCollections()} />;
}
