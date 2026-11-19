import type { Track } from './tracks';
import fs from 'node:fs';
import path from 'node:path';

const LOCAL_MANIFEST_PATH = path.join(process.cwd(), 'data', 'uploaded-tracks.json');
const LOCAL_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const LOCAL_COVERS_DIR = path.join(process.cwd(), 'public', 'covers');
const LOCAL_VIDEO_DIR = path.join(process.cwd(), 'public', 'video');

function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function safeFileName(filename: string) {
  const base = path.basename(filename).normalize('NFKC');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  return cleaned || 'upload.bin';
}

function readLocalManifest(): Track[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(LOCAL_MANIFEST_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed as Track[] : [];
  } catch {
    return [];
  }
}

function writeLocalManifest(tracks: Track[]) {
  fs.mkdirSync(path.dirname(LOCAL_MANIFEST_PATH), { recursive: true });
  const temporaryPath = `${LOCAL_MANIFEST_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(tracks, null, 2), 'utf8');
  fs.renameSync(temporaryPath, LOCAL_MANIFEST_PATH);
}

function withDefaults(track: Omit<Track, 'audioUrl' | 'coverUrl' | 'videoUrl'>): Omit<Track, 'audioUrl' | 'coverUrl' | 'videoUrl'> {
  return {
    ...track,
    artist: track.artist?.trim() || 'Independent Artist',
    genre: track.genre?.trim() || 'Unspecified',
    duration: track.duration ? String(track.duration) : 'Pending metadata',
    streamingStandard: track.streamingStandard?.trim() || 'Original uploaded audio',
  };
}

export async function getUploadedTracks(): Promise<Track[]> {
  if (usingBlob()) {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'manifest/tracks.json' });
    const manifest = blobs.find((blob) => blob.pathname === 'manifest/tracks.json');
    if (!manifest?.url) return [];
    const response = await fetch(manifest.url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Track manifest request failed: ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error('Track manifest has an invalid format.');
    return data as Track[];
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Persistent media storage is not configured. Set BLOB_READ_WRITE_TOKEN before enabling uploads.');
  }
  return readLocalManifest();
}

export async function saveUploadedTrack(
  track: Omit<Track, 'audioUrl' | 'coverUrl' | 'videoUrl'>,
  audioFile: File,
  coverFile: File | null,
  videoFile?: File | null
): Promise<Track> {
  const metadata = withDefaults(track);
  const audioName = safeFileName(audioFile.name);
  const coverName = coverFile ? safeFileName(coverFile.name) : undefined;
  const videoName = videoFile ? safeFileName(videoFile.name) : undefined;

  if (usingBlob()) {
    const { put } = await import('@vercel/blob');
    const audioBlob = await put(`audio/${track.id}-${audioName}`, audioFile, {
      access: 'public',
      addRandomSuffix: true,
    });

    let coverUrl: string | undefined;
    if (coverFile && coverName) {
      const coverBlob = await put(`covers/${track.id}-${coverName}`, coverFile, {
        access: 'public',
        addRandomSuffix: true,
      });
      coverUrl = coverBlob.url;
    }

    let videoUrl: string | undefined;
    if (videoFile && videoFile.size > 0 && videoName) {
      const videoBlob = await put(`video/${track.id}-${videoName}`, videoFile, {
        access: 'public',
        addRandomSuffix: true,
      });
      videoUrl = videoBlob.url;
    }

    const newTrack: Track = {
      ...metadata,
      audioUrl: audioBlob.url,
      coverUrl,
      videoUrl,
      mediaType: videoUrl ? 'video' : 'audio',
    };

    const existing = await getUploadedTracks();
    const updated = [...existing.filter((item) => item.id !== track.id), newTrack];
    await put('manifest/tracks.json', JSON.stringify(updated), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return newTrack;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Uploads are disabled until persistent cloud storage is configured.');
  }

  fs.mkdirSync(LOCAL_AUDIO_DIR, { recursive: true });
  fs.mkdirSync(LOCAL_COVERS_DIR, { recursive: true });
  fs.mkdirSync(LOCAL_VIDEO_DIR, { recursive: true });

  const audioFileName = `${track.id}-${audioName}`;
  fs.writeFileSync(path.join(LOCAL_AUDIO_DIR, audioFileName), Buffer.from(await audioFile.arrayBuffer()));

  let coverUrl: string | undefined;
  if (coverFile && coverName) {
    const coverFileName = `${track.id}-${coverName}`;
    fs.writeFileSync(path.join(LOCAL_COVERS_DIR, coverFileName), Buffer.from(await coverFile.arrayBuffer()));
    coverUrl = `/covers/${coverFileName}`;
  }

  let videoUrl: string | undefined;
  if (videoFile && videoFile.size > 0 && videoName) {
    const videoFileName = `${track.id}-${videoName}`;
    fs.writeFileSync(path.join(LOCAL_VIDEO_DIR, videoFileName), Buffer.from(await videoFile.arrayBuffer()));
    videoUrl = `/video/${videoFileName}`;
  }

  const newTrack: Track = {
    ...metadata,
    audioUrl: `/audio/${audioFileName}`,
    coverUrl,
    videoUrl,
    mediaType: videoUrl ? 'video' : 'audio',
  };
  writeLocalManifest([...readLocalManifest().filter((item) => item.id !== track.id), newTrack]);
  return newTrack;
}
