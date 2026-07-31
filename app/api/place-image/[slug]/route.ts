import { NextResponse } from 'next/server';
import { getPlaceBySlug } from '@/lib/data/places';
import { generatedPlaceImageSvg } from '@/lib/placeImages';

export function GET(_request: Request, { params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);

  if (!place) {
    return new NextResponse('Place image not found', { status: 404 });
  }

  return new NextResponse(generatedPlaceImageSvg(place), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
