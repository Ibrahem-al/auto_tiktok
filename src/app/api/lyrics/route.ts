import { NextRequest, NextResponse } from 'next/server';
import { getLyrics, searchLyrics } from '@/lib/lrclib';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackName = searchParams.get('trackName');
  const artistName = searchParams.get('artistName');
  const q = searchParams.get('q');

  try {
    if (trackName && artistName) {
      const track = await getLyrics(trackName, artistName);
      return NextResponse.json(track);
    }

    if (q) {
      const results = await searchLyrics(q);
      return NextResponse.json(results);
    }

    return NextResponse.json(
      { error: 'Provide trackName+artistName or q parameter' },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
