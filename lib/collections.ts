import { getPlaceCategories } from '@/lib/categories';
import { PLACES, type Place } from '@/lib/data/places';

export interface PlaceCollection {
  slug: string;
  title: string;
  season: string;
  description: string;
  places: Place[];
}

function byCategory(categories: string[], limit = 12) {
  return PLACES.filter((place) => categories.some((category) => getPlaceCategories(place).includes(category as any))).slice(0, limit);
}

function byText(words: string[], limit = 12) {
  return PLACES.filter((place) => {
    const hay = `${place.name} ${place.description} ${place.category}`.toLowerCase();
    return words.some((word) => hay.includes(word));
  }).slice(0, limit);
}

export function getSeasonalCollections(date = new Date()): PlaceCollection[] {
  const month = date.getMonth() + 1;
  const isMonsoon = month >= 6 && month <= 9;
  const isWinter = month >= 11 || month <= 2;
  const isSummer = month >= 3 && month <= 5;

  const seasonalLead = isMonsoon
    ? [
        {
          slug: 'monsoon-waterfalls',
          title: 'Monsoon waterfalls',
          season: 'June to September',
          description: 'Rain-fed falls, ghats, valleys, and forest edges where access checks matter as much as beauty.',
          places: byText(['falls', 'waterfall', 'ghat', 'rain', 'forest'], 14)
        },
        {
          slug: 'green-ghats',
          title: 'Green ghat drives',
          season: 'Post-rain weekends',
          description: 'Mist, estate roads, hill towns, and viewpoints for slow drives with daylight buffer.',
          places: byCategory(['Hills', 'Valley', 'Nature'], 14)
        }
      ]
    : isWinter
      ? [
          {
            slug: 'winter-treks',
            title: 'Winter treks',
            season: 'November to February',
            description: 'Cooler mornings, clearer trails, and hill or wilderness stops that reward early starts.',
            places: byCategory(['Adventure', 'Hills', 'Wilderness'], 14)
          },
          {
            slug: 'heritage-weekends',
            title: 'Heritage weekends',
            season: 'Cool-season walks',
            description: 'Forts, temples, old towns, and architecture-first places that are easier to walk in winter.',
            places: byCategory(['Heritage', 'History', 'Architecture'], 14)
          }
        ]
      : isSummer
        ? [
            {
              slug: 'cool-hill-breaks',
              title: 'Cool hill breaks',
              season: 'March to May',
              description: 'Higher, breezier places for escaping heat without overbuilding the itinerary.',
              places: byCategory(['Hills', 'Valley'], 14)
            },
            {
              slug: 'wildlife-season',
              title: 'Wildlife season',
              season: 'Dry months',
              description: 'Forest and sanctuary trips where sightings improve near water, but rules matter.',
              places: byCategory(['Wildlife', 'Wilderness'], 14)
            }
          ]
        : [];

  return [
    ...seasonalLead,
    {
      slug: 'coastal-easy-days',
      title: 'Coastal easy days',
      season: 'Best in clear weather',
      description: 'Beaches, estuaries, and sea-edge towns for lighter days between bigger stops.',
      places: byCategory(['Beach'], 14)
    },
    {
      slug: 'culture-and-temple-circuits',
      title: 'Culture and temple circuits',
      season: 'Year-round, best mornings',
      description: 'Spiritual towns, local markets, old streets, and architecture that pair well with slow travel.',
      places: byCategory(['Spiritual', 'Art & Culture', 'Village'], 14)
    }
  ];
}

export function getSimilarPlaces(place: Place, limit = 6) {
  const categories = getPlaceCategories(place);
  return PLACES.filter((candidate) => candidate.slug !== place.slug)
    .map((candidate) => {
      const candidateCategories = getPlaceCategories(candidate);
      const categoryScore = categories.filter((category) => candidateCategories.includes(category)).length * 4;
      const stateScore = candidate.state === place.state ? 3 : 0;
      const districtScore = candidate.district === place.district ? 5 : 0;
      return { place: candidate, score: categoryScore + stateScore + districtScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
    .slice(0, limit)
    .map((item) => item.place);
}
