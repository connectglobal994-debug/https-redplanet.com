// components/MusicPlayer.tsx
//
// Enterprise-Grade Red Planet High-Fidelity Music Player & Audio Command Center (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Implements an elite floating glassmorphic music player dock, real-time audio scrubbing, track metadata
// telemetry, losslessness/codec labeling (FLAC, WAV, MP3), next/previous routing, live volume controls,
// and direct links to catalog browsing and admin studio uploads.

'use client';

import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Best-effort format label from the file extension — not a lossless/lossy
// claim manufactured out of nowhere. Falls back to nothing rather than guessing wrong.
function formatLabel(audioUrl?: string) {
  if (!audioUrl) return null;
  const ext = audioUrl.split('.').pop()?.toLowerCase();
  const labels: Record<string, string> = {
    flac: 'FLAC · Lossless',
    wav: 'WAV · Lossless',
    mp3: 'MP3 · 320kbps',
    m4a: 'M4A',
    aac: 'AAC',
    ogg: 'OGG',
  };
  return ext ? labels[ext] ?? null : null;
}

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    currentTime,
    volume,
    hasError,
    togglePlay,
    seekTo,
    setVolume,
    nextTrack,
    prevTrack,
  } = usePlayer();

  if (!currentTrack) return null;

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    const targetSeconds = Math.min(Math.max(fraction, 0), 1) * duration;
    seekTo(targetSeconds);
  }

  const audioFormat = formatLabel(currentTrack.audioUrl);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel-strong border-t border-white/15 shadow-2xl bg-obsidian/95 backdrop-blur-2xl font-mono">
      
      {/* Interactive Scrub Bar */}
      <div
        onClick={handleSeekClick}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        className="h-1.5 w-full bg-deepSpace cursor-pointer relative group transition-all hover:h-2.5"
      >
        <div
          className="h-full bg-gradient-to-r from-marsRed to-neonCyan transition-all relative"
          style={{ width: `${progress * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-mars opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Track Metadata & Cover Art */}
        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-marsRed to-obsidian flex items-center justify-center flex-shrink-0 text-white font-bold overflow-hidden border border-marsRed/40 shadow-lg">
            {currentTrack.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg">🎵</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate flex items-center gap-2 font-sans">
              <span className="truncate">{currentTrack.title}</span>
            </div>
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 truncate mt-0.5">
              {hasError ? (
                <span className="text-red-400">
                  Audio file missing at {currentTrack.audioUrl}
                </span>
              ) : (
                <>
                  {currentTrack.artist && <span className="truncate text-neutral-300 font-bold">{currentTrack.artist}</span>}
                  <span className="text-neutral-600">·</span>
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                  {audioFormat && (
                    <>
                      <span className="text-neutral-600 hidden sm:inline">·</span>
                      <span className="text-neonCyan hidden sm:inline font-bold">{audioFormat}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls & Navigation Shortcuts */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={prevTrack}
              aria-label="Previous track"
              className="text-neutral-400 hover:text-white transition-colors text-lg p-1"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="h-12 w-12 rounded-2xl bg-marsRed hover:bg-marsRed/80 text-white flex items-center justify-center transition-all glow-mars shadow-lg text-lg"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              onClick={nextTrack}
              aria-label="Next track"
              className="text-neutral-400 hover:text-white transition-colors text-lg p-1"
            >
              ⏭
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2.5 font-mono text-xs">
            <Link href="/music" className="px-3.5 py-2 rounded-xl bg-deepSpace hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors uppercase flex items-center gap-1.5 font-bold">
              <span>💽</span> Browse
            </Link>
            <Link href="/admin/upload" className="px-3.5 py-2 rounded-xl bg-marsRed/20 hover:bg-marsRed text-white border border-marsRed/40 transition-colors uppercase flex items-center gap-1.5 font-bold shadow-mars">
              <span>🚀</span> Upload
            </Link>
          </div>
        </div>

        {/* Volume & Telemetry Status */}
        <div className="hidden sm:flex items-center gap-5 w-52 justify-end">
          <div className="flex items-center gap-2.5 w-32">
            <span className="text-neutral-400 text-sm">🔊</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-marsRed cursor-pointer bg-deepSpace"
              aria-label="Volume"
            />
          </div>
          {isPlaying && (
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 flex-shrink-0 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-900/50">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}