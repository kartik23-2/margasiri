import { NextResponse } from 'next/server';
import { getPlaceBySlug } from '@/lib/data/places';
import { generatedPlaceImageSvg } from '@/lib/placeImages';
import type { Place } from '@/lib/data/places';

export const revalidate = 604800;

const PHOTO_CACHE = 'public, max-age=604800, stale-while-revalidate=2592000';
const FALLBACK_CACHE = 'public, max-age=86400, stale-while-revalidate=604800';

type ImageCandidate = {
  url: string;
  width?: number;
  height?: number;
};

function isUsableImage(candidate: ImageCandidate | null): candidate is ImageCandidate {
  if (!candidate?.url) return false;
  const url = candidate.url.toLowerCase();
  return !url.endsWith('.svg') && !url.includes('wikimedia-button') && !url.includes('commons-logo');
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Margasiri travel place image lookup (https://margasiri.vercel.app)'
    },
    next: { revalidate }
  });

  if (!response.ok) return null;
  return response.json();
}

function pageValues(data: any) {
  return Object.values(data?.query?.pages ?? {}) as any[];
}

function pageImageFromPage(page: any): ImageCandidate | null {
  return {
    url: page?.thumbnail?.source ?? page?.original?.source,
    width: page?.thumbnail?.width ?? page?.original?.width,
    height: page?.thumbnail?.height ?? page?.original?.height
  };
}

async function wikipediaExactPageImage(place: Place): Promise<ImageCandidate | null> {
  const titles = [
    place.name,
    `${place.name}, ${place.state}`,
    `${place.name}, India`
  ];

  for (const title of titles) {
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('titles', title);
    url.searchParams.set('redirects', '1');
    url.searchParams.set('prop', 'pageimages');
    url.searchParams.set('piprop', 'thumbnail|original');
    url.searchParams.set('pithumbsize', '1200');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const data = await fetchJson(url.toString());
    const candidate = pageValues(data).map(pageImageFromPage).find(isUsableImage);
    if (candidate) return candidate;
  }

  return null;
}

async function wikipediaSearchPageImage(place: Place): Promise<ImageCandidate | null> {
  const terms = [
    `${place.name} ${place.state}`,
    `${place.name} ${place.district}`,
    place.name
  ];

  for (const term of terms) {
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('generator', 'search');
    url.searchParams.set('gsrsearch', term);
    url.searchParams.set('gsrlimit', '5');
    url.searchParams.set('prop', 'pageimages');
    url.searchParams.set('piprop', 'thumbnail|original');
    url.searchParams.set('pithumbsize', '1200');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const data = await fetchJson(url.toString());
    const candidates = pageValues(data)
      .map(pageImageFromPage)
      .filter(isUsableImage);

    if (candidates[0]) return candidates[0];
  }

  return null;
}

function commonsImageFromPage(page: any): ImageCandidate | null {
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const mime = String(info.mime ?? '').toLowerCase();
  if (mime && !['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return null;

  return {
    url: info.thumburl ?? info.url,
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height
  };
}

async function commonsGeoImage(place: Place): Promise<ImageCandidate | null> {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'geosearch');
  url.searchParams.set('ggsprimary', 'all');
  url.searchParams.set('ggsnamespace', '6');
  url.searchParams.set('ggsradius', '10000');
  url.searchParams.set('ggslimit', '20');
  url.searchParams.set('ggscoord', `${place.lat}|${place.lng}`);
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|mime|size');
  url.searchParams.set('iiurlwidth', '1200');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const data = await fetchJson(url.toString());
  return pageValues(data).map(commonsImageFromPage).find(isUsableImage) ?? null;
}

async function commonsSearchImage(place: Place): Promise<ImageCandidate | null> {
  const terms = [
    `${place.name} ${place.state}`,
    `${place.name} ${place.district} India`,
    `${place.name} India`
  ];

  for (const term of terms) {
    const searchUrl = new URL('https://commons.wikimedia.org/w/api.php');
    searchUrl.searchParams.set('action', 'query');
    searchUrl.searchParams.set('generator', 'search');
    searchUrl.searchParams.set('gsrnamespace', '6');
    searchUrl.searchParams.set('gsrsearch', term);
    searchUrl.searchParams.set('gsrlimit', '10');
    searchUrl.searchParams.set('prop', 'imageinfo');
    searchUrl.searchParams.set('iiprop', 'url|mime|size');
    searchUrl.searchParams.set('iiurlwidth', '1200');
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('origin', '*');

    const data = await fetchJson(searchUrl.toString());
    const candidate = pageValues(data).map(commonsImageFromPage).find(isUsableImage);
    if (candidate) return candidate;
  }

  return null;
}

async function realPlaceImage(place: Place) {
  return (
    (await wikipediaExactPageImage(place)) ??
    (await commonsGeoImage(place)) ??
    (await commonsSearchImage(place)) ??
    (await wikipediaSearchPageImage(place))
  );
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);

  if (!place) {
    return new NextResponse('Place image not found', { status: 404 });
  }

  try {
    const image = await realPlaceImage(place);
    if (image?.url) {
      return NextResponse.redirect(image.url, {
        headers: {
          'Cache-Control': PHOTO_CACHE
        }
      });
    }
  } catch {
    // Fall through to the generated fallback so image rendering never breaks the app.
  }

  return new NextResponse(generatedPlaceImageSvg(place), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': FALLBACK_CACHE
    }
  });
}
