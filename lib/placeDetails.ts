import type { Place, PlaceCategory } from '@/lib/data/places';

interface PlaceDetails {
  howItIs: string;
  bestTimeToVisit: string;
  howToReach: string;
  thingsToDo: string[];
  travelTips: string[];
  idealFor: string[];
}

const categoryMood: Record<PlaceCategory, string> = {
  Village: 'slow, local, and best enjoyed without rushing between checkpoints',
  Heritage: 'layered with history, architecture, stories, and old settlement patterns',
  Hills: 'cooler, scenic, and shaped by viewpoints, winding roads, and changing mist',
  Beach: 'open, breezy, and strongest around sunrise, sunset, and quiet weekday hours',
  Wildlife: 'nature-led, seasonal, and best experienced with patience and early starts',
  Valley: 'calm, green, and made for unhurried stays, walks, and landscape watching',
  Wilderness: 'raw, outdoorsy, and better suited to travelers comfortable with rough edges',
  Spiritual: 'devotional, cultural, and paced around temple timings, rituals, and local rhythms'
};

const categorySeason: Record<PlaceCategory, string> = {
  Village: 'October to February is usually the most comfortable season. Monsoon months can be beautiful, but rural roads may be slower and some trails can turn slippery.',
  Heritage: 'October to March works best for walking around monuments and old streets. Visit early morning or late afternoon to avoid harsh light and heat.',
  Hills: 'September to February gives clear views and pleasant weather. June to August is lush and dramatic, but expect rain, leeches in forest sections, and occasional road delays.',
  Beach: 'November to February is the easiest beach season, with clearer skies and gentler humidity. Avoid rough-sea days during the peak monsoon.',
  Wildlife: 'October to May is generally better for safaris and forest drives. Summer improves wildlife visibility near water, while monsoon brings dense greenery but fewer open sightings.',
  Valley: 'Post-monsoon through winter, from September to February, is ideal for green landscapes, cleaner skies, and comfortable walks.',
  Wilderness: 'Post-monsoon and winter are safest for most outdoor visits. During heavy rain, check access roads, permissions, and local conditions before starting.',
  Spiritual: 'October to March is comfortable for temple visits and town walks. Festival days are more atmospheric but also crowded, so plan stays and transport ahead.'
};

const categoryActivities: Record<PlaceCategory, string[]> = {
  Village: ['Walk through the main settlement and nearby farms', 'Try local food or homestay-style meals', 'Visit the closest temple, lake, market, or viewpoint'],
  Heritage: ['Explore the main monument area slowly', 'Look for carvings, inscriptions, gateways, tanks, and old street layouts', 'Pair the visit with nearby heritage villages or museums'],
  Hills: ['Start early for sunrise or misty viewpoints', 'Take short nature walks on marked routes', 'Stop at local cafes, estates, temples, or waterfall viewpoints nearby'],
  Beach: ['Plan a sunrise or sunset walk', 'Check nearby estuaries, lighthouses, islands, or fishing harbors', 'Keep time for seafood, local snacks, and a slower coastal evening'],
  Wildlife: ['Book official safari or nature activities where available', 'Carry binoculars for birds and distant sightings', 'Stay quiet near water bodies and forest edges'],
  Valley: ['Do a slow landscape drive with viewpoint stops', 'Walk around villages, streams, fields, or plantation edges', 'Stay overnight if you want the place beyond day-trip hours'],
  Wilderness: ['Check trail or road conditions before leaving', 'Use a local guide where routes are unclear', 'Carry water, rain protection, and enough daylight buffer'],
  Spiritual: ['Visit the main shrine during quieter hours', 'Respect dress codes, queues, and photography rules', 'Walk around temple tanks, old streets, and nearby sacred viewpoints']
};

const categoryTips: Record<PlaceCategory, string[]> = {
  Village: ['Carry some cash because small shops may not take digital payments consistently', 'Ask locals before entering farms, private lanes, or sacred spaces'],
  Heritage: ['Hire a local guide when available; it changes the visit from sightseeing to storytelling', 'Footwear, shade, and water matter because many sites involve open stone courtyards'],
  Hills: ['Start before traffic builds up on narrow ghat roads', 'Carry a light layer even when the plains feel warm'],
  Beach: ['Check tide and safety flags before entering the water', 'Keep beaches clean and avoid isolated stretches late at night'],
  Wildlife: ['Do not feed animals or stop too close for photos', 'Forest entry rules change by season, so confirm timings before you travel'],
  Valley: ['Network can be patchy, so save maps offline', 'Give yourself extra travel time after rain'],
  Wilderness: ['Avoid starting treks late in the day', 'Permits, guides, and weather checks are worth sorting before arrival'],
  Spiritual: ['Festival days can change traffic and queue times dramatically', 'Many shrines restrict photography inside the sanctum']
};

const categoryIdealFor: Record<PlaceCategory, string[]> = {
  Village: ['slow travel', 'local culture', 'offbeat stays'],
  Heritage: ['history lovers', 'architecture walks', 'photography'],
  Hills: ['viewpoints', 'weekend breaks', 'cool weather'],
  Beach: ['sunsets', 'coastal food', 'easy downtime'],
  Wildlife: ['safaris', 'birding', 'forest stays'],
  Valley: ['long drives', 'quiet stays', 'landscape photography'],
  Wilderness: ['treks', 'waterfalls', 'adventure travel'],
  Spiritual: ['pilgrimage', 'temple architecture', 'cultural travel']
};

function isCoastal(place: Place) {
  return ['Udupi', 'Uttara Kannada', 'Dakshina Kannada'].includes(place.district) || place.category === 'Beach';
}

function reachText(place: Place) {
  const districtLine = `${place.name} is in ${place.district} district, ${place.state}.`;

  if (isCoastal(place)) {
    return `${districtLine} Mangaluru, Udupi, Karwar, Honnavar, Kumta, or Kundapura are common coastal gateways depending on the exact location. Use the final Google Maps route for the last stretch because beaches, estuaries, and village roads can have similar names.`;
  }

  if (place.district === 'Kodagu') {
    return `${districtLine} Most travelers approach through Mysuru, Hassan, Mangaluru, or Bengaluru by road. The last section is usually a hill-road drive, so leave daylight buffer if rain is expected.`;
  }

  if (['Chikkamagaluru', 'Hassan', 'Shivamogga'].includes(place.district)) {
    return `${districtLine} It is best reached by road from Bengaluru, Mysuru, Mangaluru, Hassan, Shivamogga, or Chikkamagaluru depending on your route. Expect ghat sections, estate roads, and slower driving after dark.`;
  }

  if (['Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara', 'Chikkaballapur', 'Kolar', 'Tumakuru', 'Mandya'].includes(place.district)) {
    return `${districtLine} It works well as a road trip from Bengaluru or nearby district towns. Start early on weekends because approach roads and parking points can fill quickly.`;
  }

  return `${districtLine} The most reliable plan is to reach the nearest district town by train or bus, then continue by taxi, local bus, or self-drive. Save offline maps for the final few kilometres.`;
}

export function getPlaceDetails(place: Place): PlaceDetails {
  const setting = categoryMood[place.category];
  const howItIs = `${place.description} Overall, ${place.name} feels ${setting}. It is a good pick when you want more than a checklist stop: give it enough time for the surrounding roads, local food, small detours, and the mood of ${place.district} district to show up.`;

  return {
    howItIs,
    bestTimeToVisit: categorySeason[place.category],
    howToReach: reachText(place),
    thingsToDo: categoryActivities[place.category],
    travelTips: categoryTips[place.category],
    idealFor: categoryIdealFor[place.category]
  };
}
