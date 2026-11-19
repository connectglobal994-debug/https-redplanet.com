// lib/trackStorage.ts
//
// Enterprise-Grade Red Planet High-Capacity Storage Abstraction (Tesla / SpaceX / Apple Scale)
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Handles multi-gigabyte lossless audio tracks, high-definition video master files, and cover assets.
// Features automatic environment detection: routes securely via Vercel Blob cloud storage (supporting
// objects up to 5 TB with multipart chunking) in production, and local disk storage in development.

import { Track } from './tracks';
import fs from 'fs';
import path from 'path';

const LOCAL_MANIFEST_PATH = path.join(process.cwd(), 'data', 'uploaded-tracks.json');
const LOCAL_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const LOCAL_COVERS_DIR = path.join(process.cwd(), 'public', 'covers');
const LOCAL_VIDEO_DIR = path.join(process.cwd(), 'public', 'video');

function usingBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function readLocalManifest(): Track[] {
  try {
    const raw = fs.readFileSync(LOCAL_MANIFEST_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalManifest(tracks: Track[]) {
  fs.mkdirSync(path.dirname(LOCAL_MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_MANIFEST_PATH, JSON.stringify(tracks, null, 2));
}

// Enterprise metadata defaults for uploaded content across all genres (Reggae, Afrobeat, Hip Hop, etc.)
function withDefaults(track: Omit<Track, 'audioUrl' | 'coverUrl' | 'videoUrl'>): Omit<Track, 'audioUrl' | 'coverUrl' | 'videoUrl'> {
  return {
    ...track,
    artist: track.artist?.trim() || 'Red Planet Syndicate / Independent Artist',
    genre: track.genre?.trim() || 'Cinematic / Multi-Genre Master',
    duration: track.duration ? String(track.duration) : '3:35',
    streamingStandard: track.streamingStandard?.trim() || 'Studio Master Lossless / HD Stream',
  };
}

export async function getUploadedTracks(): Promise<Track[]> {
  if (usingBlob()) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'manifest/tracks.json' });
      if (blobs.length === 0) return [];
      const firstBlob = blobs[0];
      if (!firstBlob || !firstBlob.url) return [];
      const res = await fetch(firstBlob.url, { cache: 'no-store' });
      if (!res.ok) {
        console.error('Track manifest fetch failed from cloud storage:', res.status);
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Cloud Blob read error:', err);
      return [];
    }
  }
  return readLocalManifest();
}

export async function saveUploadedTrack(
  track: Omit<Track, 'audioUrl' | 'coverUrl' | 'videoUrl'>,
  audioFile: File,
  coverFile: File | null,
  videoFile?: File | null
): Promise<Track> {
  const withMeta = withDefaults(track);

  if (usingBlob()) {
    const { put } = await import('@vercel/blob');

    // High-capacity cloud storage upload (Vercel Blob supports objects up to 5 TB with multipart chunking)
    const audioBlob = await put(`audio/${track.id}-${audioFile.name}`, audioFile, {
      access: 'public',
      addRandomSuffix: false,
      multipart: audioFile.size > 100 * 1024 * 1024, // Enable automated multipart parallel chunking for large masters (>100MB)
    } as any);

    let coverUrl: string | undefined;
    if (coverFile) {
      const coverBlob = await put(`covers/${track.id}-${coverFile.name}`, coverFile, {
        access: 'public',
        addRandomSuffix: false,
      });
      coverUrl = coverBlob.url;
    }

    let videoUrl: string | undefined;
    if (videoFile && videoFile.size > 0) {
      const videoBlob = await put(`video/${track.id}-${videoFile.name}`, videoFile, {
        access: 'public',
        addRandomSuffix: false,
        multipart: true, // HD Video streams utilize multipart upload chunking
      } as any);
      videoUrl = videoBlob.url;
    }

    const newTrack: Track = {
      ...withMeta,
      audioUrl: audioBlob.url,
      coverUrl,
      videoUrl,
      mediaType: videoUrl ? 'video' : 'audio',
    };

    const existing = await getUploadedTracks();
    const updated = [...existing.filter((t) => t.id !== track.id), newTrack];

    await put('manifest/tracks.json', JSON.stringify(updated), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    console.log('[RED PLANET EMPIRE — CLOUD STORAGE SYNDICATE SUCCESS]', { trackId: newTrack.id, sizeBytes: audioFile.size });
    return newTrack;
  }

  // Local development high-capacity filesystem fallback
  fs.mkdirSync(LOCAL_AUDIO_DIR, { recursive: true });
  fs.mkdirSync(LOCAL_COVERS_DIR, { recursive: true });
  fs.mkdirSync(LOCAL_VIDEO_DIR, { recursive: true });

  const audioFileName = `${track.id}-${audioFile.name}`;
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
  fs.writeFileSync(path.join(LOCAL_AUDIO_DIR, audioFileName), audioBuffer);

  let coverUrl: string | undefined;
  if (coverFile) {
    const coverFileName = `${track.id}-${coverFile.name}`;
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    fs.writeFileSync(path.join(LOCAL_COVERS_DIR, coverFileName), coverBuffer);
    coverUrl = `/covers/${coverFileName}`;
  }

  let videoUrl: string | undefined;
  if (videoFile && videoFile.size > 0) {
    const videoFileName = `${track.id}-${videoFile.name}`;
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    fs.writeFileSync(path.join(LOCAL_VIDEO_DIR, videoFileName), videoBuffer);
    videoUrl = `/video/${videoFileName}`;
  }

  const newTrack: Track = {
    ...withMeta,
    audioUrl: `/audio/${audioFileName}`,
    coverUrl,
    videoUrl,
    mediaType: videoUrl ? 'video' : 'audio',
  };

  const existing = readLocalManifest();
  const updated = [...existing.filter((t) => t.id !== track.id), newTrack];
  writeLocalManifest(updated);

  console.log('[RED PLANET EMPIRE — LOCAL STORAGE PERSISTED]', { trackId: newTrack.id, sizeBytes: audioFile.size });
  return newTrack;
}
