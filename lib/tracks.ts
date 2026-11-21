// lib/tracks.ts
//
// Enterprise-Grade Red Planet Music Syndicate & Universal Media Catalog
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Comprehensive master catalog supporting multi-genre acoustic streams (Reggae, Afrobeat,
// Alternative Hip Hop, Electronic Trap, Cinematic Orchestral, Space Ambient), dual audio/video
// playback capabilities, high-frequency metadata telemetry, and global multi-planetary distribution.

export type MediaType = 'audio' | 'video';

export type Track = {
  id: string;
  title: string;
  duration: string; // Display duration, e.g., "3:42"
  description: string;
  audioUrl: string; // Supports MP3, FLAC, WAV, M4A, AAC, OGG
  videoUrl?: string; // Optional high-definition video stream (MP4 / WebM)
  mediaType?: MediaType; // Explicitly toggle between audio player and RedPlanet.tv visualizer
  coverUrl?: string; // Optional album art / visual frame
  artist?: string;
  album?: string; // Used by search and filtering APIs
  genre?: string;
  releaseDate?: string; // ISO format date for chronological sorting
  featured?: boolean;
  streamingStandard?: string; // e.g., "Lossless FLAC" or "HD Video Stream"
};

export const TRACKS: Track[] = [
  {
    id: 'everything',
    title: 'EVERYTHING',
    duration: '3:45',
    description: 'Brazilian funk-influenced, hypnotic hook, built to lock the body before the mind catches up.',
    audioUrl: '/audio/everything.mp3',
    videoUrl: '/video/everything-visualizer.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/everything.jpg',
    artist: 'Win',
    album: 'Singles',
    genre: 'Alternative Hip Hop / Brazilian Funk',
    releaseDate: '2026-05-01',
    featured: true,
    streamingStandard: 'Lossless MP3 / 320kbps Master',
  },
  {
    id: 'reggae-dub-zion',
    title: 'ZION RIDDIM (REGGAE DUB VIBES)',
    duration: '4:20',
    description: 'Deep roots reggae basslines combined with interstellar echoes and conscious conscious lyrics.',
    audioUrl: '/audio/reggae-dub-zion.mp3',
    videoUrl: '/video/reggae-dub-zion.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/reggae-dub-zion.jpg',
    artist: 'Red Planet Sound Syndicate',
    album: 'Dubplate Collection Vol. 1',
    genre: 'Roots Reggae / Dub',
    releaseDate: '2026-06-10',
    featured: true,
    streamingStandard: 'High-Fidelity Master Audio',
  },
  {
    id: 'afrobeat-lagos-mars',
    title: 'LAGOS TO MARS (AFROBEAT FUSION)',
    duration: '3:55',
    description: 'Vibrant percussion, swinging horns, and rhythmic afrobeat grooves engineered for global dancefloors.',
    audioUrl: '/audio/afrobeat-lagos-mars.mp3',
    videoUrl: '/video/afrobeat-lagos-mars.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/afrobeat-lagos-mars.jpg',
    artist: 'Win & Guest Syndicate',
    album: 'Global Grooves',
    genre: 'Afrobeat / Dancehall',
    releaseDate: '2026-06-15',
    featured: true,
    streamingStandard: 'Studio Master Lossless',
  },
  {
    id: 'am-i-real',
    title: 'AM I REAL',
    duration: '4:12',
    description: 'The emotional centerpiece of the project — quieter, more exposed than the rest of the catalog.',
    audioUrl: '/audio/am-i-real.mp3',
    videoUrl: '/video/am-i-real.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/am-i-real.jpg',
    artist: 'Win',
    album: 'am i real',
    genre: 'Cinematic Ambient / Electronic',
    releaseDate: '2026-06-01',
    featured: false,
    streamingStandard: 'Lossless Ambient Master',
  },
  {
    id: 'speed-vs-stillness',
    title: 'SPEED VS. STILLNESS',
    duration: '3:20',
    description: 'Fast then frozen, on purpose — tempo used as a storytelling device rather than a constant.',
    audioUrl: '/audio/speed-vs-stillness.mp3',
    videoUrl: '/video/speed-vs-stillness.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/speed-vs-stillness.jpg',
    artist: 'Win',
    album: 'Winlock',
    genre: 'Electronic / Industrial Synthwave',
    releaseDate: '2026-04-01',
    featured: false,
    streamingStandard: 'Industrial Synth Master',
  },
  {
    id: 'mars-colony-anthem',
    title: 'MARS COLONIZATION ANTHEM (SOL 08)',
    duration: '3:58',
    description: 'A cinematic, orchestral-leaning track built around the Red Planet migration theme running through the catalog.',
    audioUrl: '/audio/mars-colony-anthem.mp3',
    videoUrl: '/video/mars-colony-anthem.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/mars-colony-anthem.jpg',
    artist: 'Win',
    album: 'Winlock',
    genre: 'Cinematic Space Orchestral',
    releaseDate: '2026-04-15',
    featured: true,
    streamingStandard: 'Orchestral Master Stream',
  },
  {
    id: 'expert-sniper-pro-rhythm',
    title: 'EXPERT SNIPER PRO (TRADING RHYTHM)',
    duration: '3:10',
    description: 'High-frequency trap production, built around the same pulse-driven energy as the Red Planet trading tools.',
    audioUrl: '/audio/expert-sniper-pro-rhythm.mp3',
    videoUrl: '/video/expert-sniper-pro-rhythm.mp4',
    mediaType: 'audio',
    coverUrl: '/covers/expert-sniper-pro-rhythm.jpg',
    artist: 'Deblaq & Win',
    album: 'Singles',
    genre: 'Electronic Trap',
    releaseDate: '2026-03-20',
    featured: false,
    streamingStandard: 'Trap Master Feed',
  },
];

/* ---------------------------------------------------------
   Syndicate Configuration & Universal Streaming Standard
--------------------------------------------------------- */
export const SYNDICATE_MUSIC_CONFIG = {
  syndicateName: 'Red Planet Music & Media Syndicate',
  founders: 'Deblaq & Win',
  coreBuilder: 'Deblaq',
  primaryContact: 'redplanetcodes@gmail.com',
  whatsappSupport: '+254 794 190 600',
  uploadPortal: '/admin/upload',
  streamingStandard: 'Universal Multi-Format (Audio & HD Video / Lossless Ready)',
  supportedGenres: [
    'Roots Reggae & Dub',
    'Afrobeat & Dancehall',
    'Alternative Hip Hop',
    'Cinematic Space Orchestral',
    'Electronic & Synthwave',
    'Brazilian Funk & Trap',
  ],
  artistIncubationNote:
    'Elevating independent artists across all genres with major-label infrastructure, automated social syndication, and multi-country audio-visual distribution.',
};