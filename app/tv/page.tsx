// app/tv/page.tsx
//
// Enterprise-Grade Red Planet RedPlanet.tv Quantum Visualizer & Broadcast Network
// Founders & Operations: Deblaq (Systems & Architecture), Win (Visuals & Music Syndicate)
// Full-featured cinematic video streaming suite, multi-channel broadcast switching, interactive live chat,
// real-time telemetry overlays, immersive lyrics modal, and responsive theater mode.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Track, TRACKS as SEED_TRACKS } from '@/lib/tracks';
import { usePlayer } from '@/context/PlayerContext';

interface BroadcastChannel {
  id: string;
  title: string;
  subtitle: string;
  frequency: string;
  viewers: string;
  category: 'SYNDICATE' | 'MARS' | 'MUSIC' | 'LIVE';
  videoUrl?: string;
}

const BROADCAST_CHANNELS: BroadcastChannel[] = [
  {
    id: 'ch-01',
    title: 'Red Planet 1 // Orbital Core Broadcast',
    subtitle: 'Primary telemetry feed, live music video rollouts, and syndicate news.',
    frequency: 'CH 01 // 98.4 MHz',
    viewers: '4,280 Watching',
    category: 'SYNDICATE',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    id: 'ch-02',
    title: 'Win Cinematic Studio // Live Visualizer',
    subtitle: 'Somatic frequency explorations, pretty on top & wrong underneath.',
    frequency: 'CH 02 // 104.2 MHz',
    viewers: '2,910 Watching',
    category: 'MUSIC',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  },
  {
    id: 'ch-03',
    title: 'Mars Colony Sol 08 // Atmospheric Relay',
    subtitle: 'Live simulated atmospheric telemetry and subterranean hydroponics feed.',
    frequency: 'CH 03 // 88.9 MHz',
    viewers: '1,840 Watching',
    category: 'MARS',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'ch-04',
    title: 'Expert Sniper Pro // Financial & Trading Rhythm',
    subtitle: 'Algorithmic MT5 bot execution visualizer and high-frequency trap beats.',
    frequency: 'CH 04 // 101.1 MHz',
    viewers: '3,450 Watching',
    category: 'LIVE',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  }
];

export default function RedPlanetTVPage() {
  const { currentTrack, isPlaying, playTrack, setPlaylist } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);
  const [mounted, setMounted] = useState(false);
  
  const defaultChannel = BROADCAST_CHANNELS[0] ?? {
    id: 'ch-01',
    title: 'Red Planet 1 // Orbital Core Broadcast',
    subtitle: 'Primary telemetry feed.',
    frequency: 'CH 01',
    viewers: '1,000 Watching',
    category: 'SYNDICATE' as const,
  };

  const [activeChannel, setActiveChannel] = useState<BroadcastChannel>(defaultChannel);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [signalLocked, setSignalLocked] = useState(true);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { user: 'Deblaq', text: 'Node-08 telemetry lock confirmed. Welcome to RedPlanet.tv.' },
    { user: 'Win', text: 'Soundtrack streaming in lossless FLAC across 180+ countries!' },
    { user: 'Elias_Vorn', text: 'Quantum routing speed nominal at 99.9% efficiency.' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((data) => {
        if (data.tracks && Array.isArray(data.tracks)) {
          setTracks(data.tracks);
          setPlaylist(data.tracks);
        }
      })
      .catch(() => {});
  }, [setPlaylist]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [...prev, { user: 'Visitor', text: newMessage.trim() }]);
    setNewMessage('');
  };

  if (!mounted) {
    return <main className="flex-1 bg-deepSpace min-h-screen" />;
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-deepSpace text-text-primary pb-32 font-mono">
      
      {/* Top Header / Channel Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-obsidian/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-marsRed animate-ping" />
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-sans">
            RedPlanet <span className="text-marsRed">.TV</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLyricsModal(true)}
            className="px-4 py-2 rounded-xl bg-obsidian border border-white/20 text-xs text-white uppercase font-bold hover:border-marsRed transition-all"
          >
            📜 View Master Lyrics
          </button>
          <Link
            href="/music"
            className="px-4 py-2 rounded-xl bg-marsRed text-white text-xs uppercase font-bold tracking-wide hover:bg-marsRed/80 transition-all shadow-mars"
          >
            Audio Suite →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 py-6 space-y-6">

        {/* Main Video Theater & Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left / Main Screen: Video Stream & Telemetry */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl group flex items-center justify-center">
              {activeChannel.videoUrl ? (
                <video
                  src={activeChannel.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-deepSpace to-marsRed/20 flex flex-col items-center justify-center space-y-3">
                  <span className="text-4xl">🛰️</span>
                  <span className="text-xs uppercase tracking-widest text-neutral-400">Broadcasting Orbital Signal...</span>
                </div>
              )}

              {/* HUD Telemetry Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-neonCyan flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {activeChannel.frequency}
                </div>
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white">
                  👥 {activeChannel.viewers}
                </div>
              </div>

              {/* Bottom Video Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 opacity-90">
                <div>
                  <div className="text-xs font-bold text-white uppercase font-sans">{activeChannel.title}</div>
                  <div className="text-[10px] text-neutral-400">{activeChannel.subtitle}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSignalLocked(!signalLocked)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-all ${
                    signalLocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-marsRed/20 text-marsRed border border-marsRed/40'
                  }`}
                >
                  {signalLocked ? 'Signal Locked [SECURE]' : 'Signal Unlocked'}
                </button>
              </div>
            </div>

            {/* Channel Selector Tray */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BROADCAST_CHANNELS.map((channel) => {
                const isActive = activeChannel.id === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setActiveChannel(channel)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'bg-marsRed/20 border-marsRed shadow-mars text-white'
                        : 'glass-panel bg-obsidian/80 border-white/10 hover:border-white/30 text-neutral-400'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-neonCyan font-bold">{channel.frequency}</span>
                      <span className="text-[9px] text-emerald-400 font-bold">{channel.category}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase truncate font-sans">{channel.title}</div>
                      <div className="text-[10px] text-neutral-300 truncate mt-0.5">{channel.viewers}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Syndicate Chat & Neural Feed */}
          <div className="glass-panel rounded-3xl border border-white/15 p-5 flex flex-col justify-between h-[500px] lg:h-auto bg-obsidian/80">
            <div className="space-y-3 pb-3 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-marsRed">💬 Syndicate Broadcast Chat</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Uplink
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Encrypted transmission channel for syndicate members, founders, and visitors.</p>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neonCyan">{msg.user}</span>
                    <span className="text-[9px] text-neutral-500 font-mono">Just now</span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Broadcast to syndicate..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-deepSpace border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-marsRed"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-marsRed text-white text-xs uppercase font-bold hover:bg-marsRed/80 transition-all shadow-mars"
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* Featured Music Video Grid */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase tracking-wider text-white font-sans">Syndicate Master Video Catalog</h3>
            <Link href="/music" className="text-xs text-marsRed hover:underline font-bold">Explore All Master Audio →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tracks.map((track, i) => (
              <div
                key={track.id}
                onClick={() => {
                  setPlaylist(tracks);
                  playTrack(track);
                }}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-marsRed/50 transition-all cursor-pointer group"
              >
                <div className="h-36 rounded-xl bg-gradient-to-br from-marsRed/30 to-neonCyan/20 mb-3 flex items-center justify-center font-bold text-xl text-white overflow-hidden relative group-hover:scale-[1.02] transition-transform border border-white/10">
                  {track.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                  ) : (
                    <span>#{i + 1}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-3 py-1.5 rounded-xl bg-marsRed text-white text-xs uppercase font-bold shadow-mars">▶ Play Stream</span>
                  </div>
                </div>
                <div className="font-bold text-sm text-white uppercase truncate font-sans">{track.title}</div>
                <div className="text-xs text-neutral-400 truncate mt-0.5">{track.artist ?? 'Independent Artist'} · {track.album ?? 'Single'}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lyrics / Master Telemetry Modal */}
      {showLyricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-white/20 space-y-6 relative bg-obsidian shadow-2xl">
            <button
              type="button"
              onClick={() => setShowLyricsModal(false)}
              className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-marsRed transition-colors text-xs font-bold"
            >
              ✕
            </button>
            <div className="space-y-2">
              <span className="text-xs text-marsRed font-bold uppercase">RED PLANET SYNDICATE // MASTER LYRICS ARCHIVE</span>
              <h2 className="text-2xl font-black text-white uppercase font-sans">The Vision &amp; Soundscape Thesis</h2>
            </div>
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed max-h-96 overflow-y-auto pr-2 font-mono">
              <p>
                <strong>EVERYTHING:</strong> Brazilian funk-influenced, hypnotic hook, built to lock the body before the mind catches up. Engineered by Win under JustSis LLC.
              </p>
              <p>
                <strong>AM I REAL:</strong> The emotional centerpiece of the project — quieter, more exposed than the rest of the catalog. Cinematic ambient spatial frequencies.
              </p>
              <p>
                <strong>SPEED VS. STILLNESS:</strong> Fast then frozen, on purpose — tempo used as a storytelling device rather than a constant. Industrial synthwave master.
              </p>
              <p>
                <strong>MARS COLONIZATION ANTHEM (SOL 08):</strong> A cinematic, orchestral-leaning track built around the Red Planet migration theme running through the catalog.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLyricsModal(false)}
                className="px-6 py-2.5 rounded-xl bg-marsRed text-white text-xs uppercase font-bold shadow-mars hover:bg-marsRed/80 transition-all"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}