// app/api/tracks/route.ts
//
// Enterprise-Grade Red Planet Music Syndicate & Global Streaming API
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Merges seed and uploaded master catalogs, handles advanced search queries, multi-parameter filtering,
// custom sorting, high-performance pagination, multi-country streaming nodes telemetry (Tokyo, Nairobi, London,
// New York, Mars Orbital Relay 08), and artist incubation metrics.

import { NextRequest, NextResponse } from 'next/server';
import { TRACKS } from '@/lib/tracks';
import { getUploadedTracks } from '@/lib/trackStorage';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// Enterprise Syndicate Metadata & Multi-Country Streaming Telemetry Payload
const SYNDICATE_METADATA = {
  syndicate: 'Red Planet Music Syndicate',
  founders: 'Deblaq & Win',
  coreBuilder: 'Deblaq',
  primaryContact: 'redplanetcodes@gmail.com',
  whatsapp: '+254 794 190 600',
  activeStreamingNodes: [
    { country: 'Japan', city: 'Tokyo', latencyMs: 12, codec: 'FLAC / 320kbps' },
    { country: 'Kenya', city: 'Nairobi', latencyMs: 18, codec: 'FLAC / 320kbps' },
    { country: 'United Kingdom', city: 'London', latencyMs: 14, codec: 'FLAC / 320kbps' },
    { country: 'United States', city: 'New York', latencyMs: 16, codec: 'FLAC / 320kbps' },
    { country: 'Mars Colony', city: 'Orbital Relay 08', latencyMs: 42, codec: 'Martian Quantum Lossless' },
  ],
  artistIncubationProgram: {
    status: 'ACTIVE',
    mission: 'Elevating independent artists with major-label infrastructure, automated social marketing, and multi-country distribution.',
    collaboratorPortals: ['/invest', '/admin/upload', '/tv'],
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const artist = searchParams.get('artist')?.trim().toLowerCase() ?? '';
  const sort = searchParams.get('sort') ?? 'title'; // 'title' | 'artist' | 'newest'
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0);

  try {
    const uploaded = await getUploadedTracks();

    // Uploaded tracks take priority over seed tracks in case of ID collisions
    const seedIds = new Set(uploaded.map((t) => t.id));
    let combinedTracks = [...TRACKS.filter((t) => !seedIds.has(t.id)), ...uploaded];

    // --- Filtering ---
    if (query) {
      combinedTracks = combinedTracks.filter(
        (t) =>
          t.title?.toLowerCase().includes(query) ||
          t.artist?.toLowerCase().includes(query) ||
          t.album?.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }
    if (artist) {
      combinedTracks = combinedTracks.filter((t) => t.artist?.toLowerCase() === artist);
    }

    // --- Sorting ---
    combinedTracks.sort((a, b) => {
      if (sort === 'artist') return (a.artist ?? '').localeCompare(b.artist ?? '');
      if (sort === 'newest') {
        return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');
      }
      return (a.title ?? '').localeCompare(b.title ?? '');
    });

    const totalMatched = combinedTracks.length;
    const page = combinedTracks.slice(offset, offset + limit);

    return NextResponse.json(
      {
        status: 'success',
        totalTracks: totalMatched,
        returned: page.length,
        limit,
        offset,
        tracks: page,
        syndicateInfo: SYNDICATE_METADATA,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          // Cache at the edge briefly — cuts load on trackStorage for repeated requests
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    console.error('Track catalog syndicate error:', err);
    // Fallback to seed catalog if the storage subsystem fails
    return NextResponse.json(
      {
        status: 'fallback_active',
        totalTracks: TRACKS.length,
        returned: TRACKS.length,
        limit: DEFAULT_LIMIT,
        offset: 0,
        tracks: TRACKS,
        syndicateInfo: {
          ...SYNDICATE_METADATA,
          notice: 'Storage subsystem fallback engaged. Core streaming operational.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}