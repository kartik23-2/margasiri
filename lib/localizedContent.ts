import type { Lang } from '@/lib/i18n';
import type { Place, PlaceCategory } from '@/lib/data/places';

type LocalizedTriple = Record<Lang, string>;

const categoryNames: Record<PlaceCategory | string, LocalizedTriple> = {
  Village: { en: 'Village', hi: 'गांव', kn: 'ಗ್ರಾಮ' },
  Heritage: { en: 'Heritage', hi: 'विरासत', kn: 'ಪರಂಪರೆ' },
  Hills: { en: 'Hills', hi: 'पहाड़', kn: 'ಬೆಟ್ಟಗಳು' },
  Beach: { en: 'Beach', hi: 'समुद्र तट', kn: 'ಕಡಲತೀರ' },
  Wildlife: { en: 'Wildlife', hi: 'वन्यजीव', kn: 'ವನ್ಯಜೀವಿ' },
  Valley: { en: 'Valley', hi: 'घाटी', kn: 'ಕಣಿವೆ' },
  Wilderness: { en: 'Wilderness', hi: 'प्रकृति क्षेत्र', kn: 'ಅರಣ್ಯ ಪ್ರದೇಶ' },
  Spiritual: { en: 'Spiritual', hi: 'आध्यात्मिक', kn: 'ಆಧ್ಯಾತ್ಮಿಕ' },
  'Art & Culture': { en: 'Art & Culture', hi: 'कला और संस्कृति', kn: 'ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿ' },
  Architecture: { en: 'Architecture', hi: 'वास्तुकला', kn: 'ವಾಸ್ತುಶಿಲ್ಪ' },
  History: { en: 'History', hi: 'इतिहास', kn: 'ಇತಿಹಾಸ' },
  Nature: { en: 'Nature', hi: 'प्रकृति', kn: 'ಪ್ರಕೃತಿ' },
  Adventure: { en: 'Adventure', hi: 'रोमांच', kn: 'ಸಾಹಸ' }
};

const categorySummary: Record<PlaceCategory, LocalizedTriple> = {
  Village: {
    en: 'slow, local, and best enjoyed without rushing between checkpoints',
    hi: 'धीमी, स्थानीय और बिना जल्दबाजी के अनुभव करने लायक',
    kn: 'ನಿಧಾನವಾಗಿ, ಸ್ಥಳೀಯ ಜೀವನದೊಂದಿಗೆ, ಅವಸರವಿಲ್ಲದೆ ಅನುಭವಿಸಲು ಸೂಕ್ತ'
  },
  Heritage: {
    en: 'layered with history, architecture, stories, and old settlement patterns',
    hi: 'इतिहास, वास्तुकला, कहानियों और पुराने बसावट रूपों से भरी हुई',
    kn: 'ಇತಿಹಾಸ, ವಾಸ್ತುಶಿಲ್ಪ, ಕಥೆಗಳು ಮತ್ತು ಹಳೆಯ ವಾಸಸ್ಥಳಗಳ ಪದರಗಳಿಂದ ತುಂಬಿರುವ'
  },
  Hills: {
    en: 'cooler, scenic, and shaped by viewpoints, winding roads, and changing mist',
    hi: 'ठंडी, सुंदर और व्यूपॉइंट, घुमावदार रास्तों और बदलती धुंध से भरी हुई',
    kn: 'ತಂಪಾದ, ದೃಶ್ಯಮಯ, ನೋಟದ ಸ್ಥಳಗಳು, ತಿರುವು ರಸ್ತೆಗಳು ಮತ್ತು ಮಂಜಿನಿಂದ ರೂಪುಗೊಂಡ'
  },
  Beach: {
    en: 'open, breezy, and strongest around sunrise, sunset, and quiet weekday hours',
    hi: 'खुली, हवा भरी और सूर्योदय, सूर्यास्त या शांत दिनों में सबसे सुंदर',
    kn: 'ತೆರೆದ, ಗಾಳಿಯುತ, ಸೂರ್ಯೋದಯ, ಸೂರ್ಯಾಸ್ತ ಮತ್ತು ಶಾಂತ ಸಮಯಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ'
  },
  Wildlife: {
    en: 'nature-led, seasonal, and best experienced with patience and early starts',
    hi: 'प्रकृति-प्रधान, मौसमी और धैर्य व सुबह जल्दी शुरुआत के साथ बेहतर',
    kn: 'ಪ್ರಕೃತಿ ಆಧಾರಿತ, ಋತುಮಾನಕ್ಕೆ ಅನುಗುಣ, ತಾಳ್ಮೆ ಮತ್ತು ಬೇಗ ಆರಂಭಿಸಿದರೆ ಉತ್ತಮ'
  },
  Valley: {
    en: 'calm, green, and made for unhurried stays, walks, and landscape watching',
    hi: 'शांत, हरी-भरी और आराम से ठहरने, चलने और नज़ारे देखने के लिए उपयुक्त',
    kn: 'ಶಾಂತ, ಹಸಿರು, ನಿಧಾನವಾದ ತಂಗುವಿಕೆ, ನಡೆ ಮತ್ತು ದೃಶ್ಯ ವೀಕ್ಷಣೆಗೆ ಸೂಕ್ತ'
  },
  Wilderness: {
    en: 'raw, outdoorsy, and better suited to travelers comfortable with rough edges',
    hi: 'कच्ची, बाहरी अनुभव वाली और थोड़ी कठिन यात्रा पसंद करने वालों के लिए बेहतर',
    kn: 'ಸ್ವಾಭಾವಿಕ, ಹೊರಾಂಗಣ ಅನುಭವದ, ಸ್ವಲ್ಪ ಕಠಿಣತೆಯನ್ನು ಒಪ್ಪುವ ಪ್ರಯಾಣಿಕರಿಗೆ ಸೂಕ್ತ'
  },
  Spiritual: {
    en: 'devotional, cultural, and paced around temple timings, rituals, and local rhythms',
    hi: 'भक्ति, संस्कृति, मंदिर समय, रीति-रिवाज और स्थानीय लय से जुड़ी हुई',
    kn: 'ಭಕ್ತಿ, ಸಂಸ್ಕೃತಿ, ದೇವಾಲಯ ಸಮಯ, ಆಚರಣೆಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಲಯದೊಂದಿಗೆ ಸಾಗುವ'
  }
};

const bestTime: Record<PlaceCategory, LocalizedTriple> = {
  Village: {
    en: 'October to February is usually the most comfortable season. Monsoon can be beautiful, but rural roads may be slower.',
    hi: 'अक्टूबर से फरवरी आम तौर पर सबसे आरामदायक समय है। मानसून सुंदर होता है, लेकिन गांव की सड़कें धीमी हो सकती हैं।',
    kn: 'ಅಕ್ಟೋಬರ್ ರಿಂದ ಫೆಬ್ರವರಿ ಸಾಮಾನ್ಯವಾಗಿ ಸುಲಭವಾದ ಕಾಲ. ಮಳೆಗಾಲ ಸುಂದರವಾಗಿರುತ್ತದೆ, ಆದರೆ ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳು ನಿಧಾನವಾಗಬಹುದು.'
  },
  Heritage: {
    en: 'October to March works best for monuments and old streets. Go early morning or late afternoon to avoid harsh heat.',
    hi: 'अक्टूबर से मार्च स्मारकों और पुरानी गलियों के लिए अच्छा है। तेज गर्मी से बचने के लिए सुबह जल्दी या शाम जाएं।',
    kn: 'ಅಕ್ಟೋಬರ್ ರಿಂದ ಮಾರ್ಚ್ ಸ್ಮಾರಕಗಳು ಮತ್ತು ಹಳೆಯ ಬೀದಿಗಳಿಗೆ ಉತ್ತಮ. ಹೆಚ್ಚು ಬಿಸಿಲನ್ನು ತಪ್ಪಿಸಲು ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಹೋಗಿ.'
  },
  Hills: {
    en: 'September to February gives clearer views and pleasant weather. Monsoon is lush, but roads and trails can be slippery.',
    hi: 'सितंबर से फरवरी साफ नज़ारे और अच्छा मौसम देता है। मानसून हरा-भरा होता है, लेकिन रास्ते फिसलन भरे हो सकते हैं।',
    kn: 'ಸೆಪ್ಟೆಂಬರ್ ರಿಂದ ಫೆಬ್ರವರಿ ಸ್ಪಷ್ಟ ನೋಟ ಮತ್ತು ಒಳ್ಳೆಯ ಹವಾಮಾನ. ಮಳೆಗಾಲ ಹಸಿರಾಗಿರುತ್ತದೆ, ಆದರೆ ದಾರಿಗಳು ಜಾರಿ ಇರಬಹುದು.'
  },
  Beach: {
    en: 'November to February is the easiest beach season. Avoid rough-sea days during peak monsoon.',
    hi: 'नवंबर से फरवरी समुद्र तटों के लिए सबसे आसान मौसम है। तेज मानसून में उग्र समुद्र से बचें।',
    kn: 'ನವೆಂಬರ್ ರಿಂದ ಫೆಬ್ರವರಿ ಕಡಲತೀರಕ್ಕೆ ಉತ್ತಮ ಕಾಲ. ಹೆಚ್ಚು ಮಳೆಗಾಲದಲ್ಲಿ ಅಲೆಗಳು ಜಾಸ್ತಿ ಇದ್ದರೆ ತಪ್ಪಿಸಿ.'
  },
  Wildlife: {
    en: 'October to May is generally better for forests and safaris. Check rules because access changes by season.',
    hi: 'अक्टूबर से मई जंगल और सफारी के लिए बेहतर है। प्रवेश नियम मौसम के अनुसार बदलते हैं, इसलिए पहले जांचें।',
    kn: 'ಅಕ್ಟೋಬರ್ ರಿಂದ ಮೇ ಕಾಡು ಮತ್ತು ಸಫಾರಿಗೆ ಸಾಮಾನ್ಯವಾಗಿ ಉತ್ತಮ. ಪ್ರವೇಶ ನಿಯಮಗಳು ಋತುವಿನಂತೆ ಬದಲಾಗುತ್ತವೆ.'
  },
  Valley: {
    en: 'Post-monsoon through winter, from September to February, is ideal for green landscapes and comfortable walks.',
    hi: 'सितंबर से फरवरी, यानी मानसून के बाद से सर्दी तक, हरे नज़ारों और आरामदायक पैदल यात्रा के लिए अच्छा है।',
    kn: 'ಸೆಪ್ಟೆಂಬರ್ ರಿಂದ ಫೆಬ್ರವರಿ, ಮಳೆಗಾಲದ ನಂತರದಿಂದ ಚಳಿಗಾಲದವರೆಗೆ, ಹಸಿರು ದೃಶ್ಯ ಮತ್ತು ನಡೆಗೆ ಉತ್ತಮ.'
  },
  Wilderness: {
    en: 'Post-monsoon and winter are safest. During heavy rain, check road access, permissions, and local advice.',
    hi: 'मानसून के बाद और सर्दी सबसे सुरक्षित हैं। तेज बारिश में सड़क, अनुमति और स्थानीय सलाह जरूर जांचें।',
    kn: 'ಮಳೆಗಾಲದ ನಂತರ ಮತ್ತು ಚಳಿಗಾಲ ಹೆಚ್ಚು ಸುರಕ್ಷಿತ. ಭಾರಿ ಮಳೆಯಾಗಿದ್ದರೆ ರಸ್ತೆ, ಅನುಮತಿ ಮತ್ತು ಸ್ಥಳೀಯ ಸಲಹೆ ಪರಿಶೀಲಿಸಿ.'
  },
  Spiritual: {
    en: 'October to March is comfortable for temple visits and town walks. Festival days are special but crowded.',
    hi: 'अक्टूबर से मार्च मंदिर और शहर में घूमने के लिए आरामदायक है। त्योहारों में माहौल अच्छा पर भीड़ ज्यादा होती है।',
    kn: 'ಅಕ್ಟೋಬರ್ ರಿಂದ ಮಾರ್ಚ್ ದೇವಾಲಯ ಮತ್ತು ಪಟ್ಟಣ ನಡೆಗೆ ಸುಲಭ. ಹಬ್ಬದ ದಿನಗಳು ವಿಶೇಷ ಆದರೆ ಜನಸಂದಣಿ ಹೆಚ್ಚು.'
  }
};

export function localizedCategory(lang: Lang, category: string) {
  return categoryNames[category]?.[lang] ?? category;
}

export function localizedDescription(lang: Lang, place: Place) {
  if (lang === 'en') return place.description;
  const category = localizedCategory(lang, place.category);
  if (lang === 'hi') {
    return `${place.name}, ${place.district}, ${place.state} में स्थित ${category} श्रेणी की जगह है। यह स्थानीय अनुभव, यात्रा योजना और आसपास की उपयोगी जानकारी के साथ देखने लायक स्थान है।`;
  }
  return `${place.name}, ${place.district}, ${place.state} ನಲ್ಲಿ ಇರುವ ${category} ಸ್ಥಳ. ಸ್ಥಳೀಯ ಅನುಭವ, ಪ್ರಯಾಣ ಯೋಜನೆ ಮತ್ತು ಹತ್ತಿರದ ಉಪಯುಕ್ತ ಮಾಹಿತಿಯೊಂದಿಗೆ ಭೇಟಿ ನೀಡಲು ಸೂಕ್ತ.`;
}

export function localizedPlaceDetails(lang: Lang, place: Place) {
  const mood = categorySummary[place.category][lang];
  const description = localizedDescription(lang, place);
  const howItIs =
    lang === 'en'
      ? `${place.description} Overall, ${place.name} feels ${mood}. Give it enough time for the surrounding roads, local food, small detours, and the mood of ${place.district} district to show up.`
      : lang === 'hi'
        ? `${description} कुल मिलाकर ${place.name} ${mood} महसूस होता है। आसपास की सड़कें, स्थानीय भोजन, छोटे मोड़ और ${place.district} जिले का माहौल समझने के लिए पर्याप्त समय रखें।`
        : `${description} ಒಟ್ಟಾರೆ ${place.name} ${mood}. ಸುತ್ತಮುತ್ತಲಿನ ರಸ್ತೆಗಳು, ಸ್ಥಳೀಯ ಆಹಾರ, ಸಣ್ಣ ತಿರುವುಗಳು ಮತ್ತು ${place.district} ಜಿಲ್ಲೆಯ ವಾತಾವರಣವನ್ನು ಅನುಭವಿಸಲು ಸಾಕಷ್ಟು ಸಮಯ ಇಡಿ.`;

  return {
    howItIs,
    bestTimeToVisit: bestTime[place.category][lang],
    howToReach:
      lang === 'en'
        ? `${place.name} is in ${place.district} district, ${place.state}. Reach the nearest district town by train or bus, then continue by taxi, local bus, or self-drive. Save offline maps for the final stretch.`
        : lang === 'hi'
          ? `${place.name}, ${place.district}, ${place.state} में है। पहले नजदीकी जिला शहर तक ट्रेन या बस से पहुंचें, फिर टैक्सी, लोकल बस या स्वयं ड्राइव से आगे जाएं। अंतिम हिस्से के लिए ऑफलाइन मैप सेव रखें।`
          : `${place.name}, ${place.district}, ${place.state} ನಲ್ಲಿ ಇದೆ. ಮೊದಲು ಹತ್ತಿರದ ಜಿಲ್ಲಾ ಪಟ್ಟಣಕ್ಕೆ ರೈಲು ಅಥವಾ ಬಸ್ ಮೂಲಕ ಬನ್ನಿ, ನಂತರ ಟ್ಯಾಕ್ಸಿ, ಸ್ಥಳೀಯ ಬಸ್ ಅಥವಾ ಸ್ವಯಂ ಚಾಲನೆ ಮೂಲಕ ಮುಂದುವರಿಯಿರಿ. ಕೊನೆಯ ಭಾಗಕ್ಕೆ ಆಫ್‌ಲೈನ್ ನಕ್ಷೆ ಉಳಿಸಿ.`,
    thingsToDo:
      lang === 'en'
        ? ['Explore the main area slowly', 'Check nearby viewpoints, temples, markets, trails, or water bodies', 'Keep time for local food and unplanned stops']
        : lang === 'hi'
          ? ['मुख्य जगह को आराम से देखें', 'पास के व्यूपॉइंट, मंदिर, बाजार, ट्रेल या जल स्रोत देखें', 'स्थानीय भोजन और छोटे अनियोजित ठहराव के लिए समय रखें']
          : ['ಮುಖ್ಯ ಸ್ಥಳವನ್ನು ನಿಧಾನವಾಗಿ ನೋಡಿ', 'ಹತ್ತಿರದ ನೋಟದ ಸ್ಥಳ, ದೇವಾಲಯ, ಮಾರುಕಟ್ಟೆ, ದಾರಿ ಅಥವಾ ನೀರಿನ ಸ್ಥಳಗಳನ್ನು ನೋಡಿ', 'ಸ್ಥಳೀಯ ಆಹಾರ ಮತ್ತು ಸಣ್ಣ ವಿರಾಮಗಳಿಗೆ ಸಮಯ ಇಡಿ'],
    travelTips:
      lang === 'en'
        ? ['Carry cash, water, offline maps, and a power bank', 'Confirm road, weather, entry, and local safety conditions before leaving', 'Start early if the place is remote or involves forest, hill, or rural roads']
        : lang === 'hi'
          ? ['नकद, पानी, ऑफलाइन मैप और पावर बैंक रखें', 'निकलने से पहले सड़क, मौसम, प्रवेश और स्थानीय सुरक्षा की जानकारी जांचें', 'जगह दूर, जंगल, पहाड़ या ग्रामीण रास्ते वाली हो तो जल्दी शुरुआत करें']
          : ['ನಗದು, ನೀರು, ಆಫ್‌ಲೈನ್ ನಕ್ಷೆ ಮತ್ತು ಪವರ್ ಬ್ಯಾಂಕ್ ಇಡಿ', 'ಹೊರಡುವ ಮೊದಲು ರಸ್ತೆ, ಹವಾಮಾನ, ಪ್ರವೇಶ ಮತ್ತು ಸ್ಥಳೀಯ ಸುರಕ್ಷತೆ ಪರಿಶೀಲಿಸಿ', 'ಸ್ಥಳ ದೂರದ, ಕಾಡು, ಬೆಟ್ಟ ಅಥವಾ ಗ್ರಾಮೀಣ ರಸ್ತೆ ಇದ್ದರೆ ಬೇಗ ಆರಂಭಿಸಿ'],
    idealFor:
      lang === 'en'
        ? ['slow travel', 'local culture', 'offbeat stops']
        : lang === 'hi'
          ? ['धीमी यात्रा', 'स्थानीय संस्कृति', 'ऑफबीट जगहें']
          : ['ನಿಧಾನ ಪ್ರಯಾಣ', 'ಸ್ಥಳೀಯ ಸಂಸ್ಕೃತಿ', 'ಆಫ್‌ಬೀಟ್ ಸ್ಥಳಗಳು']
  };
}

const collectionText: Record<string, { title: LocalizedTriple; season: LocalizedTriple; description: LocalizedTriple }> = {
  'monsoon-waterfalls': {
    title: { en: 'Monsoon waterfalls', hi: 'मानसून झरने', kn: 'ಮಳೆಗಾಲದ ಜಲಪಾತಗಳು' },
    season: { en: 'June to September', hi: 'जून से सितंबर', kn: 'ಜೂನ್ ರಿಂದ ಸೆಪ್ಟೆಂಬರ್' },
    description: {
      en: 'Rain-fed falls, ghats, valleys, and forest edges where access checks matter as much as beauty.',
      hi: 'बारिश से भरे झरने, घाट, घाटियां और जंगल किनारे, जहां रास्ते की जांच सुंदरता जितनी ही जरूरी है।',
      kn: 'ಮಳೆಯಿಂದ ತುಂಬುವ ಜಲಪಾತಗಳು, ಘಾಟ್‌ಗಳು, ಕಣಿವೆಗಳು ಮತ್ತು ಕಾಡಿನ ಅಂಚುಗಳು; ದಾರಿ ಪರಿಶೀಲನೆ ಸೌಂದರ್ಯದಷ್ಟೇ ಮುಖ್ಯ.'
    }
  },
  'green-ghats': {
    title: { en: 'Green ghat drives', hi: 'हरे घाट ड्राइव', kn: 'ಹಸಿರು ಘಾಟ್ ಡ್ರೈವ್‌ಗಳು' },
    season: { en: 'Post-rain weekends', hi: 'बारिश के बाद के वीकेंड', kn: 'ಮಳೆಯ ನಂತರದ ವಾರಾಂತ್ಯಗಳು' },
    description: {
      en: 'Mist, estate roads, hill towns, and viewpoints for slow drives with daylight buffer.',
      hi: 'धुंध, एस्टेट सड़कें, पहाड़ी कस्बे और व्यूपॉइंट, दिन की रोशनी में आरामदायक ड्राइव के लिए।',
      kn: 'ಮಂಜು, ಎಸ್ಟೇಟ್ ರಸ್ತೆಗಳು, ಬೆಟ್ಟ ಪಟ್ಟಣಗಳು ಮತ್ತು ನೋಟದ ಸ್ಥಳಗಳು; ಹಗಲಿನ ಸಮಯದಲ್ಲಿ ನಿಧಾನ ಡ್ರೈವ್‌ಗೆ.'
    }
  },
  'winter-treks': {
    title: { en: 'Winter treks', hi: 'सर्दियों के ट्रेक', kn: 'ಚಳಿಗಾಲದ ಟ್ರೆಕ್‌ಗಳು' },
    season: { en: 'November to February', hi: 'नवंबर से फरवरी', kn: 'ನವೆಂಬರ್ ರಿಂದ ಫೆಬ್ರವರಿ' },
    description: {
      en: 'Cooler mornings, clearer trails, and hill or wilderness stops that reward early starts.',
      hi: 'ठंडी सुबहें, साफ रास्ते और पहाड़ी या प्राकृतिक जगहें, जहां जल्दी शुरुआत का फायदा मिलता है।',
      kn: 'ತಂಪಾದ ಬೆಳಿಗ್ಗೆ, ಸ್ಪಷ್ಟ ದಾರಿಗಳು ಮತ್ತು ಬೇಗ ಆರಂಭಿಸಿದರೆ ಉತ್ತಮ ಅನುಭವ ನೀಡುವ ಬೆಟ್ಟ/ಅರಣ್ಯ ಸ್ಥಳಗಳು.'
    }
  },
  'heritage-weekends': {
    title: { en: 'Heritage weekends', hi: 'विरासत वीकेंड', kn: 'ಪರಂಪರೆ ವಾರಾಂತ್ಯಗಳು' },
    season: { en: 'Cool-season walks', hi: 'ठंडे मौसम की सैर', kn: 'ತಂಪು ಋತುವಿನ ನಡೆಗಳು' },
    description: {
      en: 'Forts, temples, old towns, and architecture-first places that are easier to walk in winter.',
      hi: 'किले, मंदिर, पुराने कस्बे और वास्तुकला वाली जगहें, जिन्हें सर्दियों में पैदल देखना आसान है।',
      kn: 'ಕೋಟೆಗಳು, ದೇವಾಲಯಗಳು, ಹಳೆಯ ಪಟ್ಟಣಗಳು ಮತ್ತು ವಾಸ್ತುಶಿಲ್ಪ ಸ್ಥಳಗಳು; ಚಳಿಗಾಲದಲ್ಲಿ ನಡೆಯಲು ಸುಲಭ.'
    }
  },
  'cool-hill-breaks': {
    title: { en: 'Cool hill breaks', hi: 'ठंडी पहाड़ी छुट्टियां', kn: 'ತಂಪಾದ ಬೆಟ್ಟ ವಿರಾಮಗಳು' },
    season: { en: 'March to May', hi: 'मार्च से मई', kn: 'ಮಾರ್ಚ್ ರಿಂದ ಮೇ' },
    description: {
      en: 'Higher, breezier places for escaping heat without overbuilding the itinerary.',
      hi: 'गर्मी से बचने के लिए ऊंची और हवा भरी जगहें, बिना ज्यादा भारी itinerary के।',
      kn: 'ಬಿಸಿಯಿಂದ ತಪ್ಪಿಸಿಕೊಳ್ಳಲು ಎತ್ತರದ, ಗಾಳಿಯುತ ಸ್ಥಳಗಳು; ಪ್ರಯಾಣ ಯೋಜನೆ ಹೆಚ್ಚು ತುಂಬದೆ.'
    }
  },
  'wildlife-season': {
    title: { en: 'Wildlife season', hi: 'वन्यजीव मौसम', kn: 'ವನ್ಯಜೀವಿ ಋತು' },
    season: { en: 'Dry months', hi: 'सूखे महीने', kn: 'ಒಣ ತಿಂಗಳುಗಳು' },
    description: {
      en: 'Forest and sanctuary trips where sightings improve near water, but rules matter.',
      hi: 'जंगल और अभयारण्य यात्राएं, जहां पानी के पास sightings बेहतर होती हैं, लेकिन नियम जरूरी हैं।',
      kn: 'ಕಾಡು ಮತ್ತು ಅಭಯಾರಣ್ಯ ಪ್ರಯಾಣಗಳು; ನೀರಿನ ಬಳಿ ವೀಕ್ಷಣೆ ಉತ್ತಮ, ಆದರೆ ನಿಯಮಗಳು ಮುಖ್ಯ.'
    }
  },
  'coastal-easy-days': {
    title: { en: 'Coastal easy days', hi: 'आरामदायक तटीय दिन', kn: 'ಸುಲಭ ಕರಾವಳಿ ದಿನಗಳು' },
    season: { en: 'Best in clear weather', hi: 'साफ मौसम में बेहतर', kn: 'ಸ್ಪಷ್ಟ ಹವಾಮಾನದಲ್ಲಿ ಉತ್ತಮ' },
    description: {
      en: 'Beaches, estuaries, and sea-edge towns for lighter days between bigger stops.',
      hi: 'बड़ी यात्राओं के बीच हल्के दिनों के लिए समुद्र तट, मुहाने और तटीय कस्बे।',
      kn: 'ದೊಡ್ಡ ಪ್ರಯಾಣಗಳ ಮಧ್ಯೆ ಹಗುರ ದಿನಗಳಿಗೆ ಕಡಲತೀರ, ನದಿ ಮುಖಗಳು ಮತ್ತು ಕರಾವಳಿ ಪಟ್ಟಣಗಳು.'
    }
  },
  'culture-and-temple-circuits': {
    title: { en: 'Culture and temple circuits', hi: 'संस्कृति और मंदिर मार्ग', kn: 'ಸಂಸ್ಕೃತಿ ಮತ್ತು ದೇವಾಲಯ ಮಾರ್ಗಗಳು' },
    season: { en: 'Year-round, best mornings', hi: 'साल भर, सुबह बेहतर', kn: 'ವರ್ಷಪೂರ್ತಿ, ಬೆಳಿಗ್ಗೆ ಉತ್ತಮ' },
    description: {
      en: 'Spiritual towns, local markets, old streets, and architecture that pair well with slow travel.',
      hi: 'आध्यात्मिक कस्बे, स्थानीय बाजार, पुरानी गलियां और वास्तुकला, जो धीमी यात्रा के साथ अच्छे लगते हैं।',
      kn: 'ಆಧ್ಯಾತ್ಮಿಕ ಪಟ್ಟಣಗಳು, ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಗಳು, ಹಳೆಯ ಬೀದಿಗಳು ಮತ್ತು ನಿಧಾನ ಪ್ರಯಾಣಕ್ಕೆ ಹೊಂದುವ ವಾಸ್ತುಶಿಲ್ಪ.'
    }
  }
};

export function localizedCollection<T extends { slug: string; title: string; season: string; description: string }>(lang: Lang, collection: T): T {
  const text = collectionText[collection.slug];
  if (!text) return collection;
  return {
    ...collection,
    title: text.title[lang],
    season: text.season[lang],
    description: text.description[lang]
  } as T;
}

export function localizedWeatherFallback(lang: Lang, place: Place) {
  if (lang === 'en') {
    if (place.category === 'Beach') return 'Expect humid weather; winter mornings/evenings are most comfortable, and monsoon sea conditions can be rough.';
    if (place.category === 'Hills' || place.category === 'Valley') return 'Expect cooler evenings, mist, and sudden rain after monsoon; pack a light layer and rain cover.';
    if (place.category === 'Wildlife' || place.category === 'Wilderness') return 'Expect early mornings to be cooler and trails to change quickly after rain; avoid late starts.';
    if (place.category === 'Heritage') return 'Open stone and street walks get hot by midday; early morning or late afternoon is more comfortable.';
    return 'Check local rain and heat before leaving; rural roads can slow down after heavy showers.';
  }
  if (lang === 'hi') {
    if (place.category === 'Beach') return 'मौसम नम हो सकता है; सर्दियों की सुबह/शाम सबसे आरामदायक रहती है और मानसून में समुद्र उग्र हो सकता है।';
    if (place.category === 'Hills' || place.category === 'Valley') return 'शाम ठंडी, धुंध और मानसून के बाद अचानक बारिश हो सकती है; हल्की जैकेट और rain cover रखें।';
    if (place.category === 'Wildlife' || place.category === 'Wilderness') return 'सुबह ठंडी हो सकती है और बारिश के बाद रास्ते जल्दी बदल सकते हैं; देर से शुरुआत न करें।';
    if (place.category === 'Heritage') return 'खुले पत्थर और गलियां दोपहर तक गर्म हो जाती हैं; सुबह या शाम बेहतर है।';
    return 'निकलने से पहले स्थानीय बारिश और गर्मी जांचें; तेज बारिश के बाद ग्रामीण सड़कें धीमी हो सकती हैं।';
  }
  if (place.category === 'Beach') return 'ಹವಾಮಾನ ತೇವವಾಗಿರಬಹುದು; ಚಳಿಗಾಲದ ಬೆಳಿಗ್ಗೆ/ಸಂಜೆ ಸುಲಭ, ಮಳೆಗಾಲದಲ್ಲಿ ಸಮುದ್ರ ಅಲೆಗಳು ಜಾಸ್ತಿ ಇರಬಹುದು.';
  if (place.category === 'Hills' || place.category === 'Valley') return 'ಸಂಜೆ ತಂಪು, ಮಂಜು ಮತ್ತು ಮಳೆಗಾಲದ ನಂತರ ಅಕಸ್ಮಾತ್ ಮಳೆ ಸಾಧ್ಯ; ಹಗುರ jacket ಮತ್ತು rain cover ಇಡಿ.';
  if (place.category === 'Wildlife' || place.category === 'Wilderness') return 'ಬೆಳಿಗ್ಗೆ ತಂಪಿರಬಹುದು ಮತ್ತು ಮಳೆಯ ನಂತರ ದಾರಿಗಳು ಬೇಗ ಬದಲಾಗಬಹುದು; ತಡವಾಗಿ ಆರಂಭಿಸಬೇಡಿ.';
  if (place.category === 'Heritage') return 'ತೆರೆದ ಕಲ್ಲಿನ ಜಾಗಗಳು ಮತ್ತು ಬೀದಿಗಳು ಮಧ್ಯಾಹ್ನ ಬಿಸಿಯಾಗುತ್ತವೆ; ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಉತ್ತಮ.';
  return 'ಹೊರಡುವ ಮೊದಲು ಸ್ಥಳೀಯ ಮಳೆ ಮತ್ತು ಬಿಸಿಲು ಪರಿಶೀಲಿಸಿ; ಭಾರಿ ಮಳೆಯ ನಂತರ ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳು ನಿಧಾನವಾಗಬಹುದು.';
}

export function localizedTravel(lang: Lang, place: Place) {
  const remote = ['Wilderness', 'Wildlife', 'Hills', 'Valley'].includes(place.category);
  const moderate = ['Heritage', 'Spiritual', 'Beach'].includes(place.category);
  const remoteness = lang === 'en'
    ? remote ? 'Remote' : moderate ? 'Moderate' : 'Easy'
    : lang === 'hi'
      ? remote ? 'दूरस्थ' : moderate ? 'मध्यम' : 'आसान'
      : remote ? 'ದೂರದ' : moderate ? 'ಮಧ್ಯಮ' : 'ಸುಲಭ';
  const districtHub = lang === 'en' ? `${place.district} town` : lang === 'hi' ? `${place.district} शहर` : `${place.district} ಪಟ್ಟಣ`;

  return {
    remoteness,
    safety: lang === 'en'
      ? [
          remote ? 'Tell someone your route and expected return time before the final stretch.' : 'Share the Google Maps link with your group before leaving.',
          place.category === 'Wildlife' ? 'Avoid dawn/dusk walking outside marked areas; follow forest rules strictly.' : 'Avoid starting unfamiliar rural roads or trails after dark.'
        ]
      : lang === 'hi'
        ? [
            remote ? 'अंतिम हिस्से से पहले अपना route और वापसी समय किसी को बताएं।' : 'निकलने से पहले Google Maps link अपने group के साथ share करें।',
            place.category === 'Wildlife' ? 'सुबह/शाम marked area के बाहर न चलें; forest rules सख्ती से मानें।' : 'अंधेरा होने के बाद अनजान ग्रामीण रास्ते या trails शुरू न करें।'
          ]
        : [
            remote ? 'ಕೊನೆಯ ಭಾಗಕ್ಕೆ ಮುನ್ನ ನಿಮ್ಮ route ಮತ್ತು ಮರಳುವ ಸಮಯವನ್ನು ಯಾರಿಗಾದರೂ ತಿಳಿಸಿ.' : 'ಹೊರಡುವ ಮೊದಲು Google Maps link ಅನ್ನು ನಿಮ್ಮ group ಜೊತೆ share ಮಾಡಿ.',
            place.category === 'Wildlife' ? 'ಬೆಳಗ್ಗೆ/ಸಂಜೆ marked area ಹೊರಗೆ ನಡೆಯಬೇಡಿ; forest rules ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪಾಲಿಸಿ.' : 'ಕತ್ತಲಾದ ನಂತರ ಅನಪರಿಚಿತ ಗ್ರಾಮೀಣ ರಸ್ತೆ ಅಥವಾ trails ಆರಂಭಿಸಬೇಡಿ.'
          ],
    amenities: [
      {
        label: lang === 'en' ? 'Petrol pumps' : lang === 'hi' ? 'पेट्रोल पंप' : 'ಪೆಟ್ರೋಲ್ ಪಂಪ್‌ಗಳು',
        value: lang === 'en' ? 'Top up before the final approach' : lang === 'hi' ? 'अंतिम रास्ते से पहले fuel भरें' : 'ಕೊನೆಯ ದಾರಿಗೂ ಮುನ್ನ fuel ತುಂಬಿಸಿ',
        note: lang === 'en' ? 'Remote stretches may have fewer open pumps.' : lang === 'hi' ? 'दूरस्थ हिस्सों में खुले pumps कम मिल सकते हैं।' : 'ದೂರದ ಭಾಗಗಳಲ್ಲಿ ತೆರೆದ pumps ಕಡಿಮೆ ಇರಬಹುದು.',
        query: 'petrol pump'
      },
      {
        label: lang === 'en' ? 'ATMs' : lang === 'hi' ? 'ATM' : 'ATMಗಳು',
        value: districtHub,
        note: lang === 'en' ? 'Carry cash for parking, guides, tea stalls, buses, and small entry fees.' : lang === 'hi' ? 'Parking, guides, tea stalls, buses और छोटी entry fees के लिए cash रखें।' : 'Parking, guides, tea stalls, buses ಮತ್ತು ಸಣ್ಣ entry fees ಗೆ cash ಇಡಿ.',
        query: 'ATM'
      },
      {
        label: lang === 'en' ? 'Hospitals' : lang === 'hi' ? 'अस्पताल' : 'ಆಸ್ಪತ್ರೆಗಳು',
        value: lang === 'en' ? `Reliable care is usually in ${districtHub}` : lang === 'hi' ? `भरोसेमंद इलाज आम तौर पर ${districtHub} में मिलेगा` : `ವಿಶ್ವಾಸಾರ್ಹ ಚಿಕಿತ್ಸೆ ಸಾಮಾನ್ಯವಾಗಿ ${districtHub} ನಲ್ಲಿ ಸಿಗುತ್ತದೆ`,
        note: lang === 'en' ? 'Search for the closest open clinic before travel.' : lang === 'hi' ? 'यात्रा से पहले closest open clinic जरूर खोजें।' : 'ಪ್ರಯಾಣಕ್ಕೂ ಮೊದಲು closest open clinic ಹುಡುಕಿ.',
        query: 'hospital'
      },
      {
        label: lang === 'en' ? 'Mobile network' : lang === 'hi' ? 'मोबाइल नेटवर्क' : 'ಮೊಬೈಲ್ ನೆಟ್ವರ್ಕ್',
        value: remote ? (lang === 'en' ? 'Patchy near the final approach' : lang === 'hi' ? 'अंतिम रास्ते में weak हो सकता है' : 'ಕೊನೆಯ ದಾರಿಯಲ್ಲಿ ದುರ್ಬಲ ಇರಬಹುದು') : (lang === 'en' ? 'Usually usable near town roads' : lang === 'hi' ? 'शहर की सड़कों के पास आम तौर पर usable' : 'ಪಟ್ಟಣ ರಸ್ತೆಗಳ ಬಳಿ ಸಾಮಾನ್ಯವಾಗಿ usable'),
        note: lang === 'en' ? 'Save offline maps, stay numbers, and emergency contacts before leaving.' : lang === 'hi' ? 'निकलने से पहले offline maps, stay numbers और emergency contacts save करें।' : 'ಹೊರಡುವ ಮೊದಲು offline maps, stay numbers ಮತ್ತು emergency contacts save ಮಾಡಿ.'
      }
    ],
    publicTransport: [
      { label: lang === 'en' ? 'Bus access' : lang === 'hi' ? 'बस सुविधा' : 'ಬಸ್ ಸೌಲಭ್ಯ', value: districtHub, note: lang === 'en' ? 'Reach the district hub first, then confirm local bus, jeep, taxi, or auto for the last leg.' : lang === 'hi' ? 'पहले district hub पहुंचें, फिर last leg के लिए local bus, jeep, taxi या auto confirm करें।' : 'ಮೊದಲು district hub ತಲುಪಿ, ನಂತರ last leg ಗೆ local bus, jeep, taxi ಅಥವಾ auto ಖಚಿತಪಡಿಸಿ.', query: 'bus stand' },
      { label: lang === 'en' ? 'Rail access' : lang === 'hi' ? 'रेल सुविधा' : 'ರೈಲು ಸೌಲಭ್ಯ', value: lang === 'en' ? 'Nearest station depends on route' : lang === 'hi' ? 'नजदीकी station route पर निर्भर है' : 'ಹತ್ತಿರದ station route ಮೇಲೆ ಅವಲಂಬಿತ', note: lang === 'en' ? `Search trains to ${place.district} or a larger nearby city, then continue by road.` : lang === 'hi' ? `${place.district} या नजदीकी बड़े शहर तक train खोजें, फिर road से जाएं।` : `${place.district} ಅಥವಾ ಹತ್ತಿರದ ದೊಡ್ಡ ನಗರಕ್ಕೆ train ಹುಡುಕಿ, ನಂತರ road ಮೂಲಕ ಹೋಗಿ.`, query: 'railway station' },
      { label: lang === 'en' ? 'Last-mile reality' : lang === 'hi' ? 'अंतिम दूरी की स्थिति' : 'ಕೊನೆಯ ಹಂತದ ಸ್ಥಿತಿ', value: remote ? (lang === 'en' ? 'Private vehicle or local guide often needed' : lang === 'hi' ? 'Private vehicle या local guide की जरूरत पड़ सकती है' : 'Private vehicle ಅಥವಾ local guide ಬೇಕಾಗಬಹುದು') : (lang === 'en' ? 'Taxi/auto usually workable' : lang === 'hi' ? 'Taxi/auto आम तौर पर काम आ सकता है' : 'Taxi/auto ಸಾಮಾನ್ಯವಾಗಿ ಸಾಧ್ಯ'), note: lang === 'en' ? 'Call the stay, guide, or local shop before relying on a late return.' : lang === 'hi' ? 'देर से return पर भरोसा करने से पहले stay, guide या local shop को call करें।' : 'ತಡವಾಗಿ return ಅವಲಂಬಿಸುವ ಮೊದಲು stay, guide ಅಥವಾ local shop ಗೆ call ಮಾಡಿ.' }
    ],
    emergency: [
      { label: lang === 'en' ? 'National emergency' : lang === 'hi' ? 'राष्ट्रीय आपातकाल' : 'ರಾಷ್ಟ್ರೀಯ ತುರ್ತು', value: '112', note: lang === 'en' ? 'For police, fire, and medical emergency escalation in India.' : lang === 'hi' ? 'भारत में police, fire और medical emergency escalation के लिए।' : 'ಭಾರತದಲ್ಲಿ police, fire ಮತ್ತು medical emergency escalation ಗಾಗಿ.' },
      { label: lang === 'en' ? 'Ambulance' : lang === 'hi' ? 'एम्बुलेंस' : 'ಆಂಬುಲೆನ್ಸ್', value: '108', note: lang === 'en' ? 'Share coordinates if possible.' : lang === 'hi' ? 'संभव हो तो coordinates share करें।' : 'ಸಾಧ್ಯವಾದರೆ coordinates share ಮಾಡಿ.' },
      { label: lang === 'en' ? 'Police' : lang === 'hi' ? 'पुलिस' : 'ಪೊಲೀಸ್', value: '100 / 112', note: lang === 'en' ? `Ask for ${place.district} district jurisdiction if outside town limits.` : lang === 'hi' ? `शहर सीमा से बाहर हों तो ${place.district} district jurisdiction पूछें।` : `ಪಟ್ಟಣದ ಹೊರಗಿದ್ದರೆ ${place.district} district jurisdiction ಕೇಳಿ.`, query: 'police station' },
      { label: place.category === 'Wildlife' || place.category === 'Wilderness' ? (lang === 'en' ? 'Forest department' : lang === 'hi' ? 'वन विभाग' : 'ಅರಣ್ಯ ಇಲಾಖೆ') : (lang === 'en' ? 'Local authority' : lang === 'hi' ? 'स्थानीय प्राधिकरण' : 'ಸ್ಥಳೀಯ ಪ್ರಾಧಿಕಾರ'), value: `${place.district}`, note: lang === 'en' ? 'Confirm entry timings, permits, closures, crowd control, and local access advice.' : lang === 'hi' ? 'Entry timings, permits, closures, crowd control और local access advice confirm करें।' : 'Entry timings, permits, closures, crowd control ಮತ್ತು local access advice ಖಚಿತಪಡಿಸಿ.', query: 'tourist information center' }
    ],
    costs: [
      { label: lang === 'en' ? 'Fuel planning' : lang === 'hi' ? 'ईंधन योजना' : 'ಇಂಧನ ಯೋಜನೆ', value: lang === 'en' ? 'Estimate from Google Maps distance' : lang === 'hi' ? 'Google Maps distance से अनुमान लगाएं' : 'Google Maps distance ಮೂಲಕ ಅಂದಾಜಿಸಿ', note: lang === 'en' ? 'For return trips, rough car cost is distance x 2 x fuel price / mileage.' : lang === 'hi' ? 'Return trip के लिए rough car cost: distance x 2 x fuel price / mileage.' : 'Return trip ಗೆ rough car cost: distance x 2 x fuel price / mileage.' },
      { label: lang === 'en' ? 'Tolls/parking' : lang === 'hi' ? 'टोल/पार्किंग' : 'ಟೋಲ್/ಪಾರ್ಕಿಂಗ್', value: 'Rs 0-600', note: lang === 'en' ? 'Highways and popular viewpoints may add tolls or parking fees.' : lang === 'hi' ? 'Highways और popular viewpoints पर tolls या parking fees लग सकती हैं।' : 'Highways ಮತ್ತು popular viewpoints ನಲ್ಲಿ tolls ಅಥವಾ parking fees ಇರಬಹುದು.' },
      { label: lang === 'en' ? 'Entry/permits' : lang === 'hi' ? 'प्रवेश/अनुमति' : 'ಪ್ರವೇಶ/ಅನುಮತಿ', value: lang === 'en' ? 'Usually free to Rs 1,500' : lang === 'hi' ? 'आम तौर पर free से Rs 1,500' : 'ಸಾಮಾನ್ಯವಾಗಿ free ರಿಂದ Rs 1,500', note: lang === 'en' ? 'Carry ID for forest, monument, and protected-area checks.' : lang === 'hi' ? 'Forest, monument और protected-area checks के लिए ID रखें।' : 'Forest, monument ಮತ್ತು protected-area checks ಗೆ ID ಇಡಿ.' },
      { label: lang === 'en' ? 'Stay range' : lang === 'hi' ? 'रुकने का खर्च' : 'ವಾಸದ ವೆಚ್ಚ', value: remote ? 'Rs 1,800-8,000' : 'Rs 800-3,500', note: lang === 'en' ? 'Typical per-night budget range for simple stays or homestays nearby.' : lang === 'hi' ? 'पास के simple stays या homestays के लिए typical per-night budget range.' : 'ಹತ್ತಿರದ simple stays ಅಥವಾ homestays ಗೆ typical per-night budget range.' }
    ]
  };
}
