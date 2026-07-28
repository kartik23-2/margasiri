import type { Place, PlaceCategory } from '@/lib/data/places';

export type ExpandedCategory =
  | PlaceCategory
  | 'Art & Culture'
  | 'Architecture'
  | 'History'
  | 'Nature'
  | 'Adventure';

export const CATEGORY_OPTIONS: ExpandedCategory[] = [
  'Adventure',
  'Art & Culture',
  'Architecture',
  'Beach',
  'Heritage',
  'Hills',
  'History',
  'Nature',
  'Spiritual',
  'Valley',
  'Village',
  'Wildlife',
  'Wilderness'
];

export function categorySlug(category: string) {
  return category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getPlaceCategories(place: Pick<Place, 'category' | 'name' | 'description'>): ExpandedCategory[] {
  const tags = new Set<ExpandedCategory>([place.category]);
  const text = `${place.name} ${place.description}`.toLowerCase();

  if (['Wilderness', 'Wildlife', 'Hills', 'Valley', 'Beach'].includes(place.category)) tags.add('Nature');
  if (['Heritage', 'Spiritual', 'Village'].includes(place.category)) tags.add('Art & Culture');
  if (place.category === 'Heritage') {
    tags.add('History');
    tags.add('Architecture');
  }
  if (place.category === 'Spiritual') tags.add('Architecture');
  if (text.includes('fort') || text.includes('palace') || text.includes('temple') || text.includes('monastery') || text.includes('stepwell')) {
    tags.add('Architecture');
  }
  if (text.includes('trek') || text.includes('raft') || text.includes('safari') || text.includes('climb') || text.includes('cave')) {
    tags.add('Adventure');
  }

  return [...tags].sort((a, b) => CATEGORY_OPTIONS.indexOf(a) - CATEGORY_OPTIONS.indexOf(b));
}
