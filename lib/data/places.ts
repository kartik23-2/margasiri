export type PlaceCategory =
  | 'Village' | 'Heritage' | 'Hills' | 'Beach'
  | 'Wildlife' | 'Valley' | 'Wilderness' | 'Spiritual';

export interface Place {
  slug: string;
  name: string;
  state: string;
  stateSlug: string;
  district: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  description: string;
  verified: boolean; // true = curated/researched, false = community-submitted, unverified
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const rawKarnataka: Omit<Place, 'slug' | 'stateSlug' | 'verified'>[] = [
  { name: 'Agumbe', state: 'Karnataka', district: 'Shivamogga', lat: 13.5045, lng: 75.0908, category: 'Hills', description: 'Known as the Cherrapunji of the South, a rain-soaked Western Ghats village wrapped in rainforest, waterfalls, and famous sunset views.' },
  { name: 'Kudremukh', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.2104, lng: 75.2698, category: 'Wilderness', description: 'A UNESCO-linked biodiversity hotspot and horse-face-shaped peak, home to the Malabar civet and lion-tailed macaque.' },
  { name: 'Honnemaradu', state: 'Karnataka', district: 'Shivamogga', lat: 14.0667, lng: 74.8333, category: 'Village', description: 'A backwater village on the Sharavathi reservoir, reachable mainly by guided kayaking and coracle rides.' },
  { name: 'Jog Falls', state: 'Karnataka', district: 'Shivamogga', lat: 14.2287, lng: 74.8123, category: 'Wilderness', description: "India's tallest untiered waterfall, plunging over 250 metres through Western Ghats forest." },
  { name: 'Kemmangundi', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.5167, lng: 75.7333, category: 'Hills', description: 'A former British hill retreat with rose gardens, viewpoints, and the Z-Point cliff over the Baba Budangiri range.' },
  { name: 'Mullayanagiri', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.3931, lng: 75.7239, category: 'Hills', description: "Karnataka's highest peak, ringed by coffee estates and grasslands with a hilltop Shiva shrine." },
  { name: 'Bandaje Falls', state: 'Karnataka', district: 'Dakshina Kannada', lat: 13.0333, lng: 75.3667, category: 'Wilderness', description: 'A milky cascading waterfall deep in Charmadi Ghat, reached through a trek favoured by serious hikers.' },
  { name: 'Hanuman Gundi Falls', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.15, lng: 75.2667, category: 'Wilderness', description: 'A rock-step waterfall inside Kudremukh National Park, a short forest walk from the road.' },
  { name: 'Sakleshpur', state: 'Karnataka', district: 'Hassan', lat: 12.9497, lng: 75.7847, category: 'Hills', description: "A misty coffee-town gateway to the Western Ghats, known for its abandoned railway trestle bridge trek." },
  { name: 'Bisle Ghat', state: 'Karnataka', district: 'Hassan', lat: 12.75, lng: 75.75, category: 'Wilderness', description: 'A dense forest viewpoint where three districts meet, best visited during monsoon cloud cover.' },
  { name: 'Somwarpet', state: 'Karnataka', district: 'Kodagu', lat: 12.5833, lng: 75.85, category: 'Hills', description: 'A quiet north-east Coorg town bordering the Malnad rainforest, largely off the main Coorg tourist circuit.' },
  { name: 'Mallalli Falls', state: 'Karnataka', district: 'Kodagu', lat: 12.5667, lng: 75.7167, category: 'Wilderness', description: "A twin-drop waterfall near Kote Betta, one of Coorg's least crowded natural spots." },
  { name: 'Talakaveri', state: 'Karnataka', district: 'Kodagu', lat: 12.3833, lng: 75.4833, category: 'Spiritual', description: 'The misty hilltop source of the Kaveri river, held sacred and reached via a steep flight of steps.' },
  { name: 'Nalknad Palace', state: 'Karnataka', district: 'Kodagu', lat: 12.35, lng: 75.7833, category: 'Heritage', description: "A little-visited 17th-century Kodava royal palace tucked into coffee country near Kakkabe." },
  { name: 'Shivanasamudra', state: 'Karnataka', district: 'Mandya', lat: 12.2833, lng: 77.1667, category: 'Wilderness', description: "Twin waterfalls on the Kaveri river beside one of Asia's earliest hydroelectric power stations." },
  { name: 'Shettihalli', state: 'Karnataka', district: 'Hassan', lat: 13.3167, lng: 75.9333, category: 'Heritage', description: 'A submerged 19th-century church that resurfaces from the Hemavati reservoir every dry season.' },
  { name: 'Sringeri', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.4167, lng: 75.25, category: 'Spiritual', description: 'A Tunga riverside temple town and seat of one of Hinduism\'s oldest monastic institutions.' },
  { name: 'Horanadu', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.35, lng: 75.55, category: 'Spiritual', description: 'A remote forest temple town devoted to Annapoorneshwari, deep in Western Ghats coffee country.' },
  { name: 'Kalasa', state: 'Karnataka', district: 'Chikkamagaluru', lat: 13.4667, lng: 75.4667, category: 'Village', description: 'A small riverside town at the edge of Kudremukh National Park, a quiet base for forest treks.' },
  { name: 'Kodi Bengre', state: 'Karnataka', district: 'Udupi', lat: 13.5167, lng: 74.70, category: 'Beach', description: "A slender sand spit where the Suvarna river meets the sea, one of coastal Karnataka's calmest beaches." },
  { name: 'Maravanthe Beach', state: 'Karnataka', district: 'Udupi', lat: 13.9333, lng: 74.6667, category: 'Beach', description: 'A rare stretch where the Arabian Sea and the Souparnika river run parallel on either side of the road.' },
  { name: 'Mattu Beach', state: 'Karnataka', district: 'Udupi', lat: 13.1667, lng: 74.7667, category: 'Beach', description: "A commerce-free coconut-lined beach known locally for rare bioluminescent 'sea sparkle' nights." },
  { name: 'Kaup Beach', state: 'Karnataka', district: 'Udupi', lat: 13.2167, lng: 74.75, category: 'Beach', description: 'A wide, uncrowded shore anchored by a 1901 lighthouse with sweeping coastal views.' },
  { name: 'Apsarakonda', state: 'Karnataka', district: 'Uttara Kannada', lat: 14.2833, lng: 74.4333, category: 'Beach', description: 'A mythologically named waterfall-and-beach spot near Honnavar, blending forest, cliff, and sea.' },
  { name: 'Karwar Coast', state: 'Karnataka', district: 'Uttara Kannada', lat: 14.8, lng: 74.1333, category: 'Beach', description: 'Quiet naval-town beaches and coves along the far northern edge of Karnataka\'s coastline.' },
  { name: 'Sasihithlu Beach', state: 'Karnataka', district: 'Dakshina Kannada', lat: 13.0333, lng: 74.75, category: 'Beach', description: 'A river-meets-sea beach at Pavanje, home to the Indian Open of Surfing yet calm on non-event days.' },
  { name: "St Mary's Islands", state: 'Karnataka', district: 'Udupi', lat: 13.3667, lng: 74.6667, category: 'Wilderness', description: 'A cluster of geologically rare hexagonal basalt-rock islets, reachable by boat from Malpe.' },
  { name: 'Yana Rocks', state: 'Karnataka', district: 'Uttara Kannada', lat: 14.5667, lng: 74.85, category: 'Wilderness', description: 'Twin dramatic black limestone spires rising from dense forest, tied to local Shiva legends.' },
  { name: 'Dandeli', state: 'Karnataka', district: 'Uttara Kannada', lat: 15.2667, lng: 74.6167, category: 'Wildlife', description: 'A river-rafting and wildlife-sanctuary town along the Kali river, edged by dense deciduous forest.' },
  { name: 'Anegundi', state: 'Karnataka', district: 'Koppal', lat: 15.335, lng: 76.474, category: 'Heritage', description: 'A village older than neighbouring Hampi, said to be the mythical monkey kingdom of Kishkindha.' },
  { name: 'Aihole', state: 'Karnataka', district: 'Bagalkot', lat: 16.0189, lng: 75.8825, category: 'Heritage', description: 'The cradle of Chalukyan temple architecture, with over a hundred stone temples scattered through the village.' },
  { name: 'Pattadakal', state: 'Karnataka', district: 'Bagalkot', lat: 15.9481, lng: 75.8167, category: 'Heritage', description: 'A UNESCO World Heritage temple complex marking the meeting point of North and South Indian temple styles.' },
  { name: 'Badami', state: 'Karnataka', district: 'Bagalkot', lat: 15.9186, lng: 75.6767, category: 'Heritage', description: 'Sandstone cliffs honeycombed with 6th-century Chalukyan cave temples above a still lake.' },
  { name: 'Bidar', state: 'Karnataka', district: 'Bidar', lat: 17.9133, lng: 77.5301, category: 'Heritage', description: 'A Deccan plateau fort town of Bahmani tombs, a 15th-century madrasa, and a historic Sikh gurudwara.' },
  { name: 'Vijayapura (Bijapur)', state: 'Karnataka', district: 'Vijayapura', lat: 16.8302, lng: 75.71, category: 'Heritage', description: "Home to the Gol Gumbaz, one of the world's largest free-standing domes, from the Adil Shahi era." },
  { name: 'Gadag Temples', state: 'Karnataka', district: 'Gadag', lat: 15.4318, lng: 75.63, category: 'Heritage', description: 'A cluster of finely carved Chalukya-era temples in a modest North Karnataka town most tourists skip.' },
  { name: 'Banavasi', state: 'Karnataka', district: 'Uttara Kannada', lat: 14.5333, lng: 75.0333, category: 'Heritage', description: "One of Karnataka's oldest towns, once a Kadamba dynasty capital, centred on the ancient Madhukeshwara temple." },
  { name: 'Chitradurga Fort', state: 'Karnataka', district: 'Chitradurga', lat: 14.2333, lng: 76.4, category: 'Heritage', description: 'A sprawling hill fortress of stone walls, secret passages, and defensive bastions from the Nayaka era.' },
  { name: 'Melkote', state: 'Karnataka', district: 'Mandya', lat: 12.6833, lng: 76.6667, category: 'Spiritual', description: 'A hilltop temple town with panoramic Deccan views and a centuries-old Sanskrit learning tradition.' },
  { name: 'Talakadu', state: 'Karnataka', district: 'Mysuru', lat: 12.2, lng: 77.0333, category: 'Heritage', description: 'A sand-buried temple town on the Kaveri, slowly excavated after being lost under dunes for centuries.' },
  { name: 'Shivagange', state: 'Karnataka', district: 'Bengaluru Rural', lat: 13.15, lng: 77.35, category: 'Hills', description: 'A conical sacred hill near Bengaluru with rock-cut shrines and a demanding pilgrim trek to the summit.' },
  { name: 'Skandagiri', state: 'Karnataka', district: 'Chikkaballapur', lat: 13.35, lng: 77.6667, category: 'Hills', description: 'A ruined fort hill famous for pre-dawn treks above a sea of clouds, near Nandi Hills.' },
  { name: 'Devarayanadurga', state: 'Karnataka', district: 'Tumakuru', lat: 13.3667, lng: 77.05, category: 'Hills', description: 'A forested twin-temple hill retreat with a natural spring, once a summer resort for Mysore royals.' },
  { name: 'Antaragange', state: 'Karnataka', district: 'Kolar', lat: 13.15, lng: 78.1167, category: 'Hills', description: 'A volcanic rock hill with cave shrines and a perennial spring, a favoured local night-trek spot.' },
  { name: 'Avani', state: 'Karnataka', district: 'Kolar', lat: 13.2667, lng: 78.2833, category: 'Heritage', description: 'A legend-rich hill village associated with the Ramayana, with rock-cut temples and ancient caves.' },
  { name: 'Daroji Bear Sanctuary', state: 'Karnataka', district: 'Ballari', lat: 15.15, lng: 76.65, category: 'Wildlife', description: 'A scrub-forest sloth bear sanctuary near Hampi, best visited at dusk when the bears emerge to feed.' },
  { name: 'Sandur', state: 'Karnataka', district: 'Ballari', lat: 15.0833, lng: 76.5167, category: 'Hills', description: 'An iron-ore hill town in a valley of its own, with waterfalls and temples largely bypassed by tourists.' },
  { name: 'BR Hills (Biligiriranga)', state: 'Karnataka', district: 'Chamarajanagar', lat: 12.05, lng: 77.1, category: 'Wildlife', description: 'A forested hill range where the Eastern and Western Ghats meet, home to the Soliga tribal community.' },
  { name: 'Bandipur Fringe Villages', state: 'Karnataka', district: 'Chamarajanagar', lat: 11.6667, lng: 76.6333, category: 'Wildlife', description: 'Quiet forest-edge hamlets bordering Bandipur Tiger Reserve, away from the main safari gates.' },
  { name: 'Kabini Backwaters Villages', state: 'Karnataka', district: 'Mysuru', lat: 12.05, lng: 76.35, category: 'Wildlife', description: 'Fishing hamlets along the Kabini reservoir edge, offering a slower, quieter wildlife-watching base.' },
  { name: 'Gudavi Bird Sanctuary', state: 'Karnataka', district: 'Shivamogga', lat: 14.3667, lng: 75.0833, category: 'Wildlife', description: 'A modest wetland sanctuary drawing migratory birds, rarely crowded even in peak season.' },
  { name: 'Nagarahole Border Villages', state: 'Karnataka', district: 'Kodagu', lat: 12.05, lng: 76.1, category: 'Wildlife', description: 'Forest-edge Kodagu villages bordering Nagarahole National Park, quieter than the Mysuru-side gates.' }
];

const rawOtherStates: Omit<Place, 'slug' | 'stateSlug' | 'verified'>[] = [
  { name: 'Mawlynnong', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.2019, lng: 91.9127, category: 'Village', description: 'Widely called the cleanest village in Asia, with living root bridges nearby and a bamboo skywalk over the plains.' },
  { name: 'Nongriat', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.2489, lng: 91.6461, category: 'Wilderness', description: 'Home to the famous double-decker living root bridge, reached only by a steep 3,500-step descent.' },
  { name: 'Khonoma', state: 'Nagaland', district: 'Kohima', lat: 25.6497, lng: 94.0244, category: 'Village', description: 'A terraced Angami warrior village turned green pioneer, wrapped in alder forests and paddy fields.' },
  { name: 'Dzukou Valley', state: 'Nagaland', district: 'Kohima', lat: 25.5667, lng: 94.05, category: 'Wilderness', description: 'A remote valley on the Manipur border, carpeted with seasonal wildflowers and rolling grassy hills.' },
  { name: 'Ziro Valley', state: 'Arunachal Pradesh', district: 'Lower Subansiri', lat: 27.5486, lng: 93.8261, category: 'Valley', description: "Home to the Apatani tribe's wet-rice terraces and pine-covered hills, a UNESCO tentative site." },
  { name: 'Tawang', state: 'Arunachal Pradesh', district: 'Tawang', lat: 27.5859, lng: 91.8594, category: 'Heritage', description: 'A Himalayan monastery town near the Bhutan-Tibet border, one of the largest Buddhist monasteries in India.' },
  { name: 'Majuli', state: 'Assam', district: 'Majuli', lat: 26.9526, lng: 94.1697, category: 'Village', description: "The world's largest river island on the Brahmaputra, dotted with Vaishnavite monasteries." },
  { name: 'Loktak Lake', state: 'Manipur', district: 'Bishnupur', lat: 24.5375, lng: 93.7783, category: 'Wilderness', description: 'The largest freshwater lake in Northeast India, famous for its floating phumdi islands.' },
  { name: 'Pelling', state: 'Sikkim', district: 'West Sikkim', lat: 27.2167, lng: 88.2167, category: 'Hills', description: 'A quiet ridge town facing Kanchenjunga, close to the ruined Rabdentse palace.' },
  { name: 'Yumthang Valley', state: 'Sikkim', district: 'North Sikkim', lat: 27.8167, lng: 88.7, category: 'Valley', description: 'Known as the Valley of Flowers of Sikkim, a high-altitude meadow ringed by hot springs.' },
  { name: 'Malana', state: 'Himachal Pradesh', district: 'Kullu', lat: 32.1517, lng: 77.2578, category: 'Village', description: "An isolated Parvati-valley village with its own ancient governance system and dialect." },
  { name: 'Kaza', state: 'Himachal Pradesh', district: 'Lahaul and Spiti', lat: 32.2261, lng: 78.0722, category: 'Valley', description: 'The trans-Himalayan hub of Spiti, a cold desert dotted with centuries-old monasteries.' },
  { name: 'Nako', state: 'Himachal Pradesh', district: 'Kinnaur', lat: 31.8756, lng: 78.6231, category: 'Village', description: 'A high-altitude lake village near the Tibet border, one of the last stops before the Spiti circuit.' },
  { name: 'Bir Billing', state: 'Himachal Pradesh', district: 'Kangra', lat: 32.0444, lng: 76.7267, category: 'Hills', description: 'A Tibetan settlement and paragliding launch site tucked into the Dhauladhar foothills.' },
  { name: 'Kasol', state: 'Himachal Pradesh', district: 'Kullu', lat: 32.01, lng: 77.3145, category: 'Valley', description: 'A riverside hamlet on the Parvati river, the gateway to Malana, Tosh and Kheerganga treks.' },
  { name: 'Chopta', state: 'Uttarakhand', district: 'Rudraprayag', lat: 30.4833, lng: 79.1833, category: 'Hills', description: 'A meadow base camp for the Tungnath and Chandrashila treks, often called mini Switzerland.' },
  { name: 'Munsyari', state: 'Uttarakhand', district: 'Pithoragarh', lat: 30.0667, lng: 80.2333, category: 'Hills', description: 'A remote Kumaon town facing the Panchachuli peaks, gateway to the Milam glacier.' },
  { name: 'Kumbhalgarh', state: 'Rajasthan', district: 'Rajsamand', lat: 25.1487, lng: 73.5847, category: 'Heritage', description: 'A hilltop fort with the second-longest continuous wall in the world after the Great Wall of China.' },
  { name: 'Bundi', state: 'Rajasthan', district: 'Bundi', lat: 25.4305, lng: 75.6499, category: 'Heritage', description: 'A blue-hued step-well town below a hilltop palace, far quieter than nearby Jaipur or Udaipur.' },
  { name: 'Patan', state: 'Gujarat', district: 'Patan', lat: 23.85, lng: 72.1167, category: 'Heritage', description: 'Home to Rani ki Vav, an intricately carved 11th-century stepwell and UNESCO World Heritage Site.' },
  { name: 'Bhirandiyara', state: 'Gujarat', district: 'Kutch', lat: 23.4667, lng: 69.75, category: 'Village', description: 'A white desert village near the Rann of Kutch known for handicrafts and the annual Rann Utsav.' },
  { name: 'Champaner-Pavagadh', state: 'Gujarat', district: 'Panchmahal', lat: 22.4864, lng: 73.5342, category: 'Heritage', description: 'A largely unexcavated 15th-century capital city at the base of a volcanic hill temple.' },
  { name: 'Gandikota', state: 'Andhra Pradesh', district: 'YSR Kadapa', lat: 14.8167, lng: 78.2833, category: 'Wilderness', description: 'Called the Grand Canyon of India, a sandstone gorge carved by the Pennar river beside a ruined fort.' },
  { name: 'Araku Valley', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju', lat: 18.3273, lng: 82.8846, category: 'Valley', description: 'A tribal coffee-growing valley in the Eastern Ghats, reached by a scenic hill railway.' },
  { name: 'Vagamon', state: 'Kerala', district: 'Idukki', lat: 9.6906, lng: 76.9081, category: 'Hills', description: 'A rolling grassland-and-pine hill station between three ranges, far less crowded than Munnar.' },
  { name: 'Poovar', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.3167, lng: 77.0833, category: 'Beach', description: 'A backwater village where a river, lake and the Arabian Sea meet, known for golden sand beaches.' },
  { name: 'Kumbakonam villages', state: 'Tamil Nadu', district: 'Thanjavur', lat: 10.9601, lng: 79.3788, category: 'Heritage', description: 'A cluster of Chola-era temple villages around Kumbakonam, rich in bronze-casting workshops.' },
  { name: 'Chettinad', state: 'Tamil Nadu', district: 'Sivaganga', lat: 10.0725, lng: 78.7739, category: 'Heritage', description: 'A cluster of mansion-villages built by 19th-century merchant families, famed for their cuisine and tiles.' },
  { name: 'Orchha', state: 'Madhya Pradesh', district: 'Niwari', lat: 25.3516, lng: 78.6417, category: 'Heritage', description: 'A riverside town of cenotaphs and palaces built by Bundela kings, still lightly visited.' },
  { name: 'Mandu', state: 'Madhya Pradesh', district: 'Dhar', lat: 22.3363, lng: 75.3897, category: 'Heritage', description: 'A ruined Afghan-era hill capital of palaces and pavilions overlooking the Malwa plateau.' },
  { name: 'Chitrakoot', state: 'Madhya Pradesh', district: 'Satna', lat: 25.2001, lng: 80.8339, category: 'Village', description: "A forested pilgrim town on the Uttar Pradesh border, associated with Rama's years in exile." },
  { name: 'Chidiya Tapu', state: 'Andaman & Nicobar Islands', district: 'South Andaman', lat: 11.4941, lng: 92.6081, category: 'Beach', description: "A quiet southern-tip village known for sunset points and birdwatching, far from Port Blair's crowds." },
  { name: 'Diu Town', state: 'Daman and Diu', district: 'Diu', lat: 20.7144, lng: 70.9874, category: 'Beach', description: 'A former Portuguese colony with whitewashed churches, a sea fort, and near-empty beaches.' }
];

function build(raw: Omit<Place, 'slug' | 'stateSlug' | 'verified'>[], verified: boolean): Place[] {
  return raw.map((p) => ({
    ...p,
    slug: slugify(p.name),
    stateSlug: slugify(p.state),
    verified
  }));
}

export const PLACES: Place[] = [
  ...build(rawKarnataka, true),
  ...build(rawOtherStates, true)
];

export function getStates() {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of PLACES) {
    const existing = map.get(p.stateSlug);
    if (existing) existing.count++;
    else map.set(p.stateSlug, { name: p.state, slug: p.stateSlug, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPlaceBySlug(slug: string) {
  return PLACES.find((p) => p.slug === slug) ?? null;
}

export function getPlacesByState(stateSlug: string) {
  return PLACES.filter((p) => p.stateSlug === stateSlug);
}
