import { NextRequest, NextResponse } from 'next/server';
import { TRACKS } from '@/lib/tracks';
import { getUploadedTracks } from '@/lib/trackStorage';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase().slice(0, 120);
  const artist = (searchParams.get('artist') ?? '').trim().toLowerCase().slice(0, 120);
  const sort = searchParams.get('sort') ?? 'title';
  const parsedLimit = Number.parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const parsedOffset = Number.parseInt(searchParams.get('offset') ?? '0', 10);
  const limit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(Number.isFinite(parsedOffset) ? parsedOffset : 0, 0);

  try {
    const uploaded = await getUploadedTracks();
    const uploadedIds = new Set(uploaded.map((track) => track.id));
    let tracks = [...TRACKS.filter((track) => !uploadedIds.has(track.id)), ...uploaded];

    if (query) {
      tracks = tracks.filter((track) =>
        track.title.toLowerCase().includes(query) ||
        (track.artist ?? '').toLowerCase().includes(query) ||
        (track.album ?? '').toLowerCase().includes(query) ||
        (track.description ?? '').toLowerCase().includes(query)
      );
    }
    if (artist) tracks = tracks.filter((track) => (track.artist ?? '').toLowerCase() === artist);

    tracks.sort((a, b) => {
      if (sort === 'artist') return (a.artist ?? '').localeCompare(b.artist ?? '');
      if (sort === 'newest') return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');
      return a.title.localeCompare(b.title);
    });

    const total = tracks.length;
    const page = tracks.slice(offset, offset + limit);
    return NextResponse.json({
      status: 'success',
      totalTracks: total,
      returned: page.length,
      limit,
      offset,
      tracks: page,
      storage: process.env.BLOB_READ_WRITE_TOKEN ? 'cloud' : process.env.NODE_ENV === 'production' ? 'unavailable' : 'local-development',
      timestamp: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Track catalogue storage error:', error);
    return NextResponse.json({
      status: 'seed_catalog_only',
      totalTracks: TRACKS.length,
      returned: Math.min(TRACKS.length, limit),
      limit,
      offset,
      tracks: TRACKS.slice(offset, offset + limit),
      storage: 'unavailable',
      message: 'Uploaded catalogue storage is unavailable; showing only bundled sample catalogue items.',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
