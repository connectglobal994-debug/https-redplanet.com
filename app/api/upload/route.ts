import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedTrack, getUploadedTracks } from '@/lib/trackStorage';
import { isAdminRequest } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
const MAX_COVER_BYTES = 8 * 1024 * 1024;
const VALID_AUDIO_TYPES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4',
  'audio/aac', 'audio/ogg', 'audio/flac', 'application/octet-stream',
]);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']);
const COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

function extensionOf(filename: string) {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form submission.' }, { status: 400 });
  }

  const titleValue = formData.get('title');
  const artistValue = formData.get('artist');
  const genreValue = formData.get('genre');
  const descriptionValue = formData.get('description');
  const audioFile = formData.get('audio');
  const coverFile = formData.get('cover');

  if (typeof titleValue !== 'string' || !titleValue.trim() || titleValue.trim().length > 160) {
    return NextResponse.json({ error: 'Track title is required and must be 160 characters or fewer.' }, { status: 400 });
  }
  if (!(audioFile instanceof File) || audioFile.size === 0) {
    return NextResponse.json({ error: 'A non-empty audio file is required.' }, { status: 400 });
  }
  if (audioFile.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Audio file exceeds the 50MB upload limit.' }, { status: 413 });
  }

  const extension = extensionOf(audioFile.name);
  if (!AUDIO_EXTENSIONS.has(extension) || (audioFile.type && !VALID_AUDIO_TYPES.has(audioFile.type))) {
    return NextResponse.json({ error: 'Unsupported audio file. Upload MP3, WAV, M4A, AAC, OGG or FLAC.' }, { status: 400 });
  }

  if (coverFile instanceof File && coverFile.size > 0) {
    if (coverFile.size > MAX_COVER_BYTES) {
      return NextResponse.json({ error: 'Cover image exceeds the 8MB upload limit.' }, { status: 413 });
    }
    if (!COVER_TYPES.has(coverFile.type)) {
      return NextResponse.json({ error: 'Cover must be a JPEG, PNG, WebP or AVIF image.' }, { status: 400 });
    }
  }

  const title = titleValue.trim();
  const artist = typeof artistValue === 'string' && artistValue.trim()
    ? artistValue.trim().slice(0, 120)
    : 'Independent Artist';
  const genre = typeof genreValue === 'string' && genreValue.trim()
    ? genreValue.trim().slice(0, 80)
    : 'Unspecified';
  const description = typeof descriptionValue === 'string' && descriptionValue.trim()
    ? descriptionValue.trim().slice(0, 2000)
    : '';

  try {
    const existing = await getUploadedTracks();
    const existingIds = new Set(existing.map((track) => track.id));
    const baseId = slugify(title) || 'untitled-track';
    let id = baseId;
    let suffix = 1;
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }

    const track = await saveUploadedTrack(
      {
        id,
        title,
        artist,
        genre,
        duration: 'Pending metadata',
        description: description || `Uploaded to Red Planet by ${artist}.`,
      },
      audioFile,
      coverFile instanceof File && coverFile.size > 0 ? coverFile : null
    );

    return NextResponse.json({
      ok: true,
      track,
      distribution: {
        status: 'NOT_CONFIGURED',
        message: 'The track is stored in the Red Planet catalogue. External distribution to Spotify, Apple Music or YouTube Music has not been connected.',
        channels: [],
      },
      message: 'Track uploaded to Red Planet. It has not been submitted to external streaming services.',
      catalogUrl: '/music',
    }, { status: 201 });
  } catch (error) {
    console.error('Red Planet track upload failed:', error);
    return NextResponse.json(
      { error: 'Track upload failed. Check the configured storage service and server logs.' },
      { status: 500 }
    );
  }
}
