import type { Place, PlaceCategory } from '@/lib/data/places';

export interface AmenityInfo {
  label: string;
  value: string;
  note: string;
  query?: string;
}

export interface TravelIntelligence {
  remoteness: 'Easy' | 'Moderate' | 'Remote';
  amenities: AmenityInfo[];
  publicTransport: AmenityInfo[];
  emergency: AmenityInfo[];
  costs: AmenityInfo[];
  safety: string[];
  weatherFallback: string;
}

const remoteCategories: PlaceCategory[] = ['Wilderness', 'Wildlife', 'Hills', 'Valley'];
const easyCategories: PlaceCategory[] = ['Heritage', 'Spiritual', 'Beach'];

function remotenessFor(place: Place): TravelIntelligence['remoteness'] {
  if (remoteCategories.includes(place.category)) return 'Remote';
  if (easyCategories.includes(place.category)) return 'Moderate';
  return 'Easy';
}

function categoryFuelKm(place: Place) {
  if (place.category === 'Wilderness' || place.category === 'Wildlife') return '15-35 km';
  if (place.category === 'Hills' || place.category === 'Valley') return '10-25 km';
  if (place.category === 'Beach') return '5-15 km';
  return '2-10 km';
}

function stayRange(place: Place) {
  if (place.category === 'Wildlife') return 'Rs 2,500-8,000';
  if (place.category === 'Hills' || place.category === 'Valley') return 'Rs 1,800-5,500';
  if (place.category === 'Beach') return 'Rs 1,500-5,000';
  if (place.category === 'Heritage' || place.category === 'Spiritual') return 'Rs 900-3,000';
  return 'Rs 800-2,500';
}

function entryFee(place: Place) {
  if (place.category === 'Wildlife') return 'Rs 100-1,500 depending on safari/permit';
  if (place.category === 'Heritage') return 'Rs 0-600 depending on monument rules';
  if (place.category === 'Wilderness') return 'Rs 0-500 if forest/trek permissions apply';
  return 'Usually free or under Rs 100';
}

function seasonalWeather(place: Place) {
  if (place.category === 'Beach') return 'Expect humid weather; winter mornings/evenings are most comfortable, and monsoon sea conditions can be rough.';
  if (place.category === 'Hills' || place.category === 'Valley') return 'Expect cooler evenings, mist, and sudden rain after monsoon; pack a light layer and rain cover.';
  if (place.category === 'Wildlife' || place.category === 'Wilderness') return 'Expect early mornings to be cooler and trails to change quickly after rain; avoid late starts.';
  if (place.category === 'Heritage') return 'Open stone and street walks get hot by midday; early morning or late afternoon is more comfortable.';
  return 'Check local rain and heat before leaving; rural roads can slow down after heavy showers.';
}

export function getTravelIntelligence(place: Place): TravelIntelligence {
  const remoteness = remotenessFor(place);
  const districtHub = `${place.district} town`;

  return {
    remoteness,
    amenities: [
      {
        label: 'Petrol pumps',
        value: `Plan fuel before the last ${categoryFuelKm(place)}`,
        note: remoteness === 'Remote' ? 'Do not enter the final stretch near empty; pumps may close early.' : 'Top up at the last main road or town junction.',
        query: 'petrol pump'
      },
      {
        label: 'ATMs',
        value: `${districtHub} or main bus stand area`,
        note: 'Carry cash for parking, guides, tea stalls, local buses, and small entry fees.',
        query: 'ATM'
      },
      {
        label: 'Hospitals',
        value: `Nearest reliable care is usually in ${districtHub}`,
        note: remoteness === 'Remote' ? 'For treks and forests, note the return road before starting.' : 'Search Google Maps for the closest open clinic before travel.',
        query: 'hospital'
      },
      {
        label: 'Mobile network',
        value: remoteness === 'Remote' ? 'Patchy near the final approach' : 'Usually usable near town roads',
        note: 'Save offline maps, hotel numbers, and emergency contacts before leaving.'
      }
    ],
    publicTransport: [
      {
        label: 'Bus access',
        value: `${districtHub} is the safest first target`,
        note: 'Use state/private buses to the district hub, then confirm a local bus, jeep, taxi, or auto for the last leg.',
        query: 'bus stand'
      },
      {
        label: 'Rail access',
        value: 'Nearest railway station depends on route',
        note: `Search trains to ${place.district} or the nearest larger city, then continue by road.`,
        query: 'railway station'
      },
      {
        label: 'Last-mile reality',
        value: remoteness === 'Remote' ? 'Private vehicle or local guide often needed' : 'Taxi/auto usually workable',
        note: 'Call the stay, guide, or local shop before you rely on a late-evening return.'
      }
    ],
    emergency: [
      { label: 'National emergency', value: '112', note: 'Works for police, fire, and medical emergency escalation in India.' },
      { label: 'Ambulance', value: '108', note: 'Use for medical emergencies; share coordinates if possible.' },
      { label: 'Police', value: '100 / 112', note: `Ask for ${place.district} district jurisdiction if you are outside town limits.`, query: 'police station' },
      {
        label: place.category === 'Wildlife' || place.category === 'Wilderness' ? 'Forest department' : 'Local authority',
        value: `${place.district} district office`,
        note: place.category === 'Wildlife' || place.category === 'Wilderness'
          ? 'Check entry timings, permits, animal movement, and closures before entering forest areas.'
          : 'For crowd, parking, festival, or access issues, confirm with local police/tourism office.',
        query: place.category === 'Wildlife' || place.category === 'Wilderness' ? 'forest department office' : 'tourist information center'
      }
    ],
    costs: [
      { label: 'Fuel planning', value: 'Estimate from Google Maps distance', note: 'A rough car estimate is distance x 2 x fuel price / mileage for return trips.' },
      { label: 'Tolls/parking', value: 'Rs 0-600 buffer', note: 'Highways and popular viewpoints may add tolls or parking fees.' },
      { label: 'Entry/permits', value: entryFee(place), note: 'Carry ID for forest, monument, and protected-area checks.' },
      { label: 'Stay range', value: stayRange(place), note: 'Typical per-night budget range for simple stays or homestays near this type of place.' }
    ],
    safety: [
      remoteness === 'Remote' ? 'Tell someone your route and expected return time before the final stretch.' : 'Share the Google Maps link with your group before leaving.',
      place.category === 'Wildlife' ? 'Avoid dawn/dusk walking outside marked areas; follow forest rules strictly.' : 'Avoid starting unfamiliar rural roads or trails after dark.',
      'Keep a power bank, offline map, water, basic medicines, and cash.',
      'If weather, access, or local advice feels uncertain, turn back early rather than pushing deeper.'
    ],
    weatherFallback: seasonalWeather(place)
  };
}
