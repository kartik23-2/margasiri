export type Lang = 'en' | 'hi' | 'kn';

export const DICT: Record<Lang, Record<string, string>> = {
  en: {
    tagline: "Find what's past the milestone.",
    turnOnLocation: 'Turn on live location',
    liveTracking: 'Live tracking on',
    searchPlaceholder: 'Search by place, district or state…',
    allStates: 'All states',
    allKinds: 'All kinds',
    getDirections: 'Get directions',
    nearestFirst: 'Nearest first',
    district: 'District',
    verified: 'Verified',
    communitySubmitted: 'Community-submitted, unverified'
  },
  hi: {
    tagline: 'वह जगह खोजें जो मील के पत्थर से आगे है।',
    turnOnLocation: 'लाइव लोकेशन चालू करें',
    liveTracking: 'लाइव ट्रैकिंग चालू',
    searchPlaceholder: 'नाम, ज़िला या राज्य से खोजें…',
    allStates: 'सभी राज्य',
    allKinds: 'सभी प्रकार',
    getDirections: 'रास्ता दिखाएँ',
    nearestFirst: 'सबसे नज़दीक पहले',
    district: 'ज़िला',
    verified: 'सत्यापित',
    communitySubmitted: 'सामुदायिक-सबमिशन, असत्यापित'
  },
  kn: {
    tagline: 'ಮೈಲಿಗಲ್ಲಿನ ಆಚೆಗಿನ ಜಾಗ ಹುಡುಕಿ.',
    turnOnLocation: 'ಲೈವ್ ಲೊಕೇಶನ್ ಆನ್ ಮಾಡಿ',
    liveTracking: 'ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಆನ್ ಆಗಿದೆ',
    searchPlaceholder: 'ಹೆಸರು, ಜಿಲ್ಲೆ ಅಥವಾ ರಾಜ್ಯದಿಂದ ಹುಡುಕಿ…',
    allStates: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು',
    allKinds: 'ಎಲ್ಲಾ ವಿಧಗಳು',
    getDirections: 'ದಾರಿ ತೋರಿಸಿ',
    nearestFirst: 'ಹತ್ತಿರದ್ದು ಮೊದಲು',
    district: 'ಜಿಲ್ಲೆ',
    verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    communitySubmitted: 'ಸಮುದಾಯ-ಸಲ್ಲಿಕೆ, ಪರಿಶೀಲಿಸದ'
  }
};

export function t(lang: Lang, key: string): string {
  return DICT[lang][key] ?? DICT.en[key] ?? key;
}
