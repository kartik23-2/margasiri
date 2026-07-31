import type { Place, PlaceCategory } from '@/lib/data/places';

type Palette = {
  sky: string;
  horizon: string;
  ground: string;
  accent: string;
  ink: string;
  mist: string;
};

const PALETTES: Record<PlaceCategory, Palette> = {
  Village: { sky: '#f2d6a4', horizon: '#7f9d73', ground: '#4f6f52', accent: '#d9a441', ink: '#1b2a4a', mist: '#fdfaf1' },
  Heritage: { sky: '#e8d8b3', horizon: '#b7774a', ground: '#743d2b', accent: '#d9a441', ink: '#1b2a4a', mist: '#fdfaf1' },
  Hills: { sky: '#c8dfdc', horizon: '#6f9a8d', ground: '#254f46', accent: '#d9a441', ink: '#1b2a4a', mist: '#fdfaf1' },
  Beach: { sky: '#b8dfdf', horizon: '#5a9fb0', ground: '#e0bd77', accent: '#b23a2f', ink: '#1b2a4a', mist: '#fdfaf1' },
  Wildlife: { sky: '#c8d9ad', horizon: '#63815a', ground: '#263f2d', accent: '#d9a441', ink: '#1b2a4a', mist: '#fdfaf1' },
  Valley: { sky: '#d6e2c8', horizon: '#8fb174', ground: '#486b4f', accent: '#5a9fb0', ink: '#1b2a4a', mist: '#fdfaf1' },
  Wilderness: { sky: '#c5d7cd', horizon: '#577e68', ground: '#243c34', accent: '#b23a2f', ink: '#1b2a4a', mist: '#fdfaf1' },
  Spiritual: { sky: '#ead7b4', horizon: '#b98c58', ground: '#6d4032', accent: '#c23b2e', ink: '#1b2a4a', mist: '#fdfaf1' }
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapWords(value: string, max = 21) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function mountainLayer(y: number, color: string, offset: number) {
  return `<path d="M0 ${y + 110} L0 ${y + 54} L110 ${y - 12 + offset} L210 ${y + 56} L330 ${y - 32 - offset} L470 ${y + 72} L640 ${y - 2 + offset} L800 ${y + 94} L960 ${y + 2 - offset} L1120 ${y + 112} L1120 700 Z" fill="${color}"/>`;
}

function templeMotif(palette: Palette, hash: number) {
  const x = 710 + (hash % 46);
  return `
    <rect x="${x}" y="330" width="230" height="188" rx="8" fill="${palette.ground}" opacity="0.96"/>
    <path d="M${x - 24} 330 L${x + 115} 238 L${x + 254} 330 Z" fill="${palette.accent}"/>
    <rect x="${x + 70}" y="390" width="90" height="128" rx="45" fill="${palette.sky}" opacity="0.58"/>
    <path d="M${x + 42} 330 L${x + 188} 330 L${x + 160} 288 L${x + 70} 288 Z" fill="${palette.mist}" opacity="0.32"/>
    <circle cx="${x + 115}" cy="269" r="14" fill="${palette.mist}" opacity="0.8"/>
  `;
}

function coastMotif(palette: Palette) {
  return `
    <path d="M0 470 C160 420 280 530 430 474 C590 414 720 500 880 454 C990 422 1060 428 1120 454 L1120 700 L0 700 Z" fill="${palette.ground}"/>
    <path d="M0 432 C160 390 300 468 460 432 C650 388 760 468 930 420 C1020 396 1084 408 1120 416" fill="none" stroke="${palette.mist}" stroke-width="18" opacity="0.78"/>
    <path d="M806 380 C828 326 865 294 912 280 C870 330 860 388 870 482" fill="none" stroke="${palette.ink}" stroke-width="13" stroke-linecap="round" opacity="0.72"/>
    <path d="M912 280 C846 274 804 292 766 338 C824 328 872 338 912 280 Z" fill="${palette.horizon}"/>
    <circle cx="914" cy="166" r="54" fill="${palette.accent}" opacity="0.86"/>
  `;
}

function forestMotif(palette: Palette, hash: number) {
  const trees = Array.from({ length: 9 }, (_, i) => {
    const x = 682 + i * 47 + ((hash >> (i % 8)) % 20);
    const h = 76 + ((hash >> (i + 2)) % 78);
    return `<path d="M${x} ${520 - h} L${x - 34} 520 L${x + 34} 520 Z" fill="${i % 2 ? palette.horizon : palette.ground}" opacity="${i % 2 ? 0.86 : 0.96}"/><rect x="${x - 4}" y="500" width="8" height="42" fill="${palette.ink}" opacity="0.38"/>`;
  }).join('');
  return `<path d="M0 498 C210 448 310 514 494 480 C680 444 860 422 1120 468 L1120 700 L0 700 Z" fill="${palette.ground}"/>${trees}`;
}

function villageMotif(palette: Palette) {
  return `
    <path d="M0 500 C210 460 370 508 560 470 C750 432 940 456 1120 420 L1120 700 L0 700 Z" fill="${palette.ground}"/>
    <rect x="742" y="382" width="138" height="106" rx="6" fill="${palette.mist}" opacity="0.78"/>
    <path d="M718 382 L812 316 L904 382 Z" fill="${palette.accent}"/>
    <rect x="912" y="360" width="116" height="128" rx="6" fill="${palette.horizon}"/>
    <path d="M890 360 L970 304 L1050 360 Z" fill="${palette.ink}" opacity="0.78"/>
    <path d="M650 524 C746 498 850 530 946 500 C1010 480 1066 482 1120 490" fill="none" stroke="${palette.mist}" stroke-width="8" opacity="0.55"/>
  `;
}

function categoryMotif(category: PlaceCategory, palette: Palette, hash: number) {
  if (category === 'Beach') return coastMotif(palette);
  if (category === 'Heritage' || category === 'Spiritual') return templeMotif(palette, hash);
  if (category === 'Village') return villageMotif(palette);
  if (category === 'Wildlife' || category === 'Wilderness') return forestMotif(palette, hash);
  return `${mountainLayer(360, palette.horizon, hash % 24)}${mountainLayer(418, palette.ground, (hash >> 4) % 28)}`;
}

export function generatedPlaceImageSvg(place: Place) {
  const palette = PALETTES[place.category];
  const hash = hashString(`${place.slug}:${place.state}:${place.category}`);
  const titleLines = wrapWords(place.name);
  const subtitle = `${place.district}, ${place.state}`;
  const textureId = `grain-${hash}`;
  const gradId = `sky-${hash}`;
  const titleSvg = titleLines.map((line, index) => (
    `<text x="74" y="${162 + index * 58}" font-size="${titleLines.length > 2 ? 46 : 54}" font-weight="800" fill="${palette.mist}" font-family="Inter, Arial, sans-serif">${escapeXml(line)}</text>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="700" viewBox="0 0 1120 700" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(place.name)} generated travel artwork</title>
  <desc id="desc">AI-styled generated artwork for ${escapeXml(place.name)}, using ${escapeXml(place.category.toLowerCase())} visual cues from ${escapeXml(place.district)}, ${escapeXml(place.state)}.</desc>
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.sky}"/>
      <stop offset="55%" stop-color="${palette.horizon}"/>
      <stop offset="100%" stop-color="${palette.ground}"/>
    </linearGradient>
    <pattern id="${textureId}" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="5" r="1.2" fill="${palette.mist}" opacity="0.18"/>
      <circle cx="18" cy="19" r="1" fill="${palette.ink}" opacity="0.1"/>
    </pattern>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="1120" height="700" fill="url(#${gradId})"/>
  <circle cx="${820 + (hash % 120)}" cy="${116 + ((hash >> 5) % 70)}" r="${76 + (hash % 44)}" fill="${palette.mist}" opacity="0.18"/>
  <circle cx="${236 + ((hash >> 6) % 160)}" cy="${478 + ((hash >> 9) % 74)}" r="210" fill="${palette.mist}" opacity="0.08"/>
  ${mountainLayer(410, palette.horizon, hash % 18)}
  ${categoryMotif(place.category, palette, hash)}
  <rect width="1120" height="700" fill="url(#${textureId})"/>
  <rect x="44" y="68" width="548" height="306" rx="28" fill="${palette.ink}" opacity="0.58" filter="url(#soft-shadow)"/>
  <text x="74" y="116" font-size="24" font-weight="700" letter-spacing="5" fill="${palette.accent}" font-family="Inter, Arial, sans-serif">${escapeXml(place.category.toUpperCase())}</text>
  ${titleSvg}
  <text x="76" y="330" font-size="27" font-weight="600" fill="${palette.mist}" opacity="0.82" font-family="Inter, Arial, sans-serif">${escapeXml(subtitle)}</text>
  <path d="M74 354 L256 354" stroke="${palette.accent}" stroke-width="8" stroke-linecap="round"/>
</svg>`;
}
