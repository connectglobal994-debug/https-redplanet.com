// app/music/page.tsx
//
// Enterprise-Grade Red Planet Music Syndicate & Streaming Catalog (Apple Music & Epic Records Scale)
// Founders: Deblaq & Win | Core Architecture & Satellite Engineering: Deblaq
// Multi-country streaming across 180+ countries, artist incubation programs, high-fidelity FLAC audio playback,
// real-time royalty ledger tracking, instant playlist management, and secure artist onboarding portals.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Track, TRACKS as SEED_TRACKS } from '@/lib/tracks';
import { usePlayer } from '@/context/PlayerContext';

type MusicTab = 'home' | 'new' | 'radio' | 'library' | 'search';

const RADIO_STATIONS = [
  { id: 'rs-1', title: 'Red Planet 1', subtitle: 'Global Hits & Telemetry Anthems', frequency: '98.4 FM', cover: 'gradient-mars' },
  { id: 'rs-2', title: 'Interzone Deep Beats', subtitle: 'Underground Electronic & Cut-up Soundscapes', frequency: '104.2 FM', cover: 'gradient-violet' },
  { id: 'rs-3', title: 'Mars Orbital Chill', subtitle: 'Ambient Atmospheric Soundtracks', frequency: '88.9 FM', cover: 'gradient-mint' },
  { id: 'rs-4', title: 'Win Syndicate Live', subtitle: 'Exclusive Master Catalog & Artist Interviews', frequency: '101.1 FM', cover: 'gradient-amber' },
];

export default function RedPlanetMusicHubPage() {
  const { currentTrack, isPlaying, playTrack, setPlaylist } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MusicTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Library state (saved/liked tracks simulation)
  const [savedTrackIds, setSavedTrackIds] = useState<string[]>(['everything', 'am-i-real']);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'artists' | 'albums' | 'downloaded'>('all');
  const [libraryViewMode, setLibraryViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((data) => {
        const list: Track[] = data.tracks ?? SEED_TRACKS;
        setTracks(list);
        setPlaylist(list);
      })
      .catch(() => {
        setTracks(SEED_TRACKS);
        setPlaylist(SEED_TRACKS);
      })
      .finally(() => setLoading(false));
  }, [setPlaylist]);

  function shareTrack(track: Track) {
    const url = `${window.location.origin}/music#${track.id}`;
    if (navigator.share) {
      navigator.share({ title: `${track.title} — Red Planet Records`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(track.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function toggleSaveTrack(id: string) {
    setSavedTrackIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  const genres = ['ALL', 'ALTERNATIVE HIP HOP', 'AFROBEATS', 'ELECTRONIC', 'SYNTHWAVE', 'GLOBAL INDIE'];

  const filteredTracks = tracks.filter((track) => {
    const title = track.title ?? '';
    const artist = track.artist ?? '';
    const description = track.description ?? '';
    const album = track.album ?? '';

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === 'ALL' || album.toUpperCase().includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-deepSpace text-text-primary pb-32 font-mono">
      
      {/* Top Header / Profile & Account Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-obsidian/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-marsRed animate-ping" />
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-sans">
            Red Planet <span className="text-marsRed">Music Suite</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/upload"
            className="px-3 py-1.5 rounded-xl bg-marsRed text-white text-xs uppercase font-bold tracking-wide hover:bg-marsRed/80 transition-all shadow-mars"
          >
            + Upload Track
          </Link>
          <div className="w-9 h-9 rounded-full gradient-violet flex items-center justify-center text-xs font-bold shadow-lg border border-white/20">
            W
          </div>
        </div>
      </div>

      {/* Main Container with Apple Music / Tesla hybrid navigation layout */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 py-6 space-y-8">

        {/* Tab Selection Bar (Home, New, Radio, Library, Search) */}
        <div className="flex items-center gap-2 bg-obsidian p-2 rounded-2xl border border-white/10 overflow-x-auto w-full">
          {[
            { id: 'home', label: 'Home', icon: 'ti-home' },
            { id: 'new', label: 'New', icon: 'ti-disc' },
            { id: 'radio', label: 'Radio', icon: 'ti-antenna' },
            { id: 'library', label: 'Library', icon: 'ti-library' },
            { id: 'search', label: 'Search', icon: 'ti-search' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as MusicTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-marsRed text-white shadow-mars'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`ti ${tab.icon} text-sm`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================= */}
        {/* TAB 1: HOME (Personalized Listen Now) */}
        {/* ========================================= */}
        {activeTab === 'home' && (
          <div className="space-y-10 animate-fade-in-up">
            
            {/* Hero Banner */}
            <section className="relative rounded-3xl overflow-hidden gradient-mars p-8 sm:p-10 shadow-2xl border border-white/20">
              <div className="absolute inset-0 gradient-obsidian-fade" />
              <div className="relative z-10 max-w-xl space-y-3">
                <div className="text-xs uppercase font-bold tracking-widest text-white/80">
                  FEATURED ALBUM // WINLOCK MASTER
                </div>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-sans">
                  The Win Catalog
                </h2>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  Soundscapes engineered by Win. Pretty on top, wrong underneath. High-fidelity lossless streaming across 180+ countries.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (tracks.length > 0) {
                        const firstTrack = tracks[0];
                        if (firstTrack) {
                          setPlaylist(tracks);
                          playTrack(firstTrack);
                        }
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-white text-obsidian font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg flex items-center gap-2"
                  >
                    <span>▶ Play Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('library')}
                    className="px-6 py-3 rounded-xl bg-black/40 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider hover:bg-black/60 transition-all border border-white/20"
                  >
                    View Library
                  </button>
                </div>
              </div>
            </section>

            {/* Listen Now Shelves */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wider text-white font-sans">Listen Now Recommendations</h3>
                <button type="button" onClick={() => setActiveTab('new')} className="text-xs text-marsRed hover:underline font-bold">See All →</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tracks.slice(0, 4).map((track, i) => (
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
                    </div>
                    <div className="font-bold text-sm text-white uppercase truncate font-sans">{track.title}</div>
                    <div className="text-xs text-neutral-400 truncate mt-0.5">{track.artist ?? 'Independent Artist'} · {track.album ?? 'Single'}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recently Played Shelf */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wider text-white font-sans">Recently Played &amp; Telemetry</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tracks.slice(1, 4).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      setPlaylist(tracks);
                      playTrack(track);
                    }}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:border-neonCyan/40 transition-all"
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-marsRed flex-shrink-0 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                      {track.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                      ) : (
                        <span>RP</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate uppercase font-sans">{track.title}</div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">{track.artist ?? 'Independent Artist'}</div>
                      <span className="text-[9px] text-emerald-400 font-mono mt-1 block">● FLAC Lossless Stream</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: NEW (Browse Releases & Charts) */}
        {/* ========================================= */}
        {activeTab === 'new' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-3xl border border-white/15 bg-gradient-to-r from-deepSpace to-obsidian space-y-3">
              <div className="text-xs text-marsRed font-bold uppercase">NEW RELEASES &amp; EDITORIAL PLAYLISTS</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Fresh Drops Across 180+ Countries</h2>
              <p className="text-xs text-neutral-400">Explore editorial charts, independent artist spotlights, and genre-specific master drops.</p>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-obsidian p-3 rounded-2xl border border-white/10">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs uppercase font-bold transition-all ${
                    selectedGenre === genre
                      ? 'bg-marsRed text-white shadow-mars'
                      : 'text-neutral-400 hover:text-white bg-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Tracks List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTracks.map((track, i) => {
                const isActive = currentTrack?.id === track.id;
                const isActivePlaying = isActive && isPlaying;

                return (
                  <div
                    key={track.id}
                    className={`glass-panel p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isActive ? 'border-marsRed bg-marsRed/10 shadow-mars' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPlaylist(filteredTracks);
                          playTrack(track);
                        }}
                        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-marsRed/40 to-neonCyan/20 flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0 border border-white/10 relative group"
                      >
                        {track.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                        ) : (
                          <span>{String(i + 1).padStart(2, '0')}</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs">{isActivePlaying ? '⏸' : '▶'}</span>
                        </div>
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white uppercase tracking-wide truncate text-sm sm:text-base font-sans">{track.title}</h4>
                          {isActivePlaying && (
                            <span className="text-[10px] text-marsRed uppercase bg-marsRed/20 px-2 py-0.5 rounded border border-marsRed/40 animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist ?? 'Independent Artist'} · {track.album ?? 'Single'}</p>
                        <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-2">
                          <span>Codec: FLAC / 320kbps</span>
                          <span>•</span>
                          <span>Global Satellite Uplink</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                      <button
                        type="button"
                        onClick={() => toggleSaveTrack(track.id)}
                        className={`h-10 w-10 rounded-xl border flex items-center justify-center text-xs transition-colors ${
                          savedTrackIds.includes(track.id)
                            ? 'bg-marsRed border-marsRed text-white shadow-mars'
                            : 'border-white/10 text-neutral-400 hover:text-white'
                        }`}
                        title="Save to Library"
                      >
                        ♥
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlaylist(filteredTracks);
                          playTrack(track);
                        }}
                        className="px-4 py-2 rounded-xl bg-marsRed hover:bg-marsRed/80 text-white text-xs uppercase font-bold tracking-wider shadow-mars transition-all"
                      >
                        {isActivePlaying ? 'Pause' : 'Stream Track'}
                      </button>
                      <button
                        type="button"
                        onClick={() => shareTrack(track)}
                        className="h-10 w-10 rounded-xl border border-white/10 hover:border-neonCyan flex items-center justify-center text-neutral-400 hover:text-neonCyan transition-colors text-xs"
                        title="Share Track"
                      >
                        {copiedId === track.id ? '✓' : '↗'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: RADIO (Live Stations & Curated Moods) */}
        {/* ========================================= */}
        {activeTab === 'radio' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-3xl border border-white/15 bg-gradient-to-r from-deepSpace to-obsidian space-y-3">
              <div className="text-xs text-neonCyan font-bold uppercase">LIVE SATELLITE RADIO STATIONS</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Continuous Interplanetary Broadcasts</h2>
              <p className="text-xs text-neutral-400">Tune in 24/7 to live continuous feeds curated by Deblaq, Win, and autonomous AI nodes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {RADIO_STATIONS.map((station) => (
                <div key={station.id} className="glass-panel p-6 rounded-3xl border border-white/15 space-y-4 hover:border-marsRed/50 transition-all flex flex-col justify-between shadow-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-neonCyan font-mono">
                      <span>{station.frequency}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Broadcast
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase font-sans">{station.title}</h3>
                    <p className="text-xs text-neutral-300">{station.subtitle}</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500 uppercase">Stream Quality: Lossless</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (tracks.length > 0) {
                          const firstTrack = tracks[0];
                          if (firstTrack) {
                            setPlaylist(tracks);
                            playTrack(firstTrack);
                          }
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-marsRed hover:bg-marsRed/80 text-xs text-white uppercase font-bold tracking-wider shadow-mars transition-all"
                    >
                      Tune In ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 4: LIBRARY (Saved Music & Custom Filters) */}
        {/* ========================================= */}
        {activeTab === 'library' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-3xl border border-white/15 bg-gradient-to-r from-deepSpace to-obsidian flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs text-marsRed font-bold uppercase">YOUR PERSONALIZED REPOSITORY</div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Saved Library &amp; Downloads</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLibraryViewMode('grid')}
                  className={`px-3 py-1.5 rounded-xl text-xs uppercase font-bold ${libraryViewMode === 'grid' ? 'bg-marsRed text-white' : 'bg-white/5 text-neutral-400'}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs uppercase font-bold ${libraryViewMode === 'list' ? 'bg-marsRed text-white' : 'bg-white/5 text-neutral-400'}`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 bg-obsidian p-3 rounded-2xl border border-white/10 overflow-x-auto">
              {(['all', 'playlists', 'artists', 'albums', 'downloaded'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setLibraryFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs uppercase font-bold transition-all ${
                    libraryFilter === filter ? 'bg-marsRed text-white shadow-mars' : 'text-neutral-400 hover:text-white bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Display Saved Tracks */}
            {savedTrackIds.length === 0 ? (
              <div className="text-center py-20 text-xs text-neutral-400 glass-panel rounded-3xl border border-white/10">
                Your library is currently empty. Click the heart icon on any track to save it here.
              </div>
            ) : libraryViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tracks
                  .filter((t) => savedTrackIds.includes(t.id))
                  .map((track) => (
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
                          <span>RP</span>
                        )}
                      </div>
                      <div className="font-bold text-sm text-white uppercase truncate font-sans">{track.title}</div>
                      <div className="text-xs text-neutral-400 truncate mt-0.5">{track.artist ?? 'Independent Artist'}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {tracks
                  .filter((t) => savedTrackIds.includes(t.id))
                  .map((track) => (
                    <div key={track.id} className="glass-panel p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-white uppercase font-sans">{track.title}</div>
                        <div className="text-xs text-neutral-400">{track.artist ?? 'Independent Artist'} · {track.album ?? 'Single'}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPlaylist(tracks);
                          playTrack(track);
                        }}
                        className="px-4 py-2 rounded-xl bg-marsRed text-xs text-white uppercase font-bold shadow-mars"
                      >
                        Play ▶
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 5: SEARCH (Advanced Search Bar & Categories) */}
        {/* ========================================= */}
        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-3xl border border-white/15 bg-gradient-to-r from-deepSpace to-obsidian space-y-4">
              <div className="text-xs text-neonCyan font-bold uppercase">GLOBAL MUSIC DISCOVERY</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Search Across Songs, Artists &amp; Albums</h2>
              <div className="relative w-full">
                <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Type song title, artist name, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-deepSpace border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-marsRed shadow-inner"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTracks.map((track) => (
                <div key={track.id} className="glass-panel p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-marsRed/30 to-neonCyan/20 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                      {track.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                      ) : (
                        <span>RP</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase font-sans">{track.title}</div>
                      <div className="text-xs text-neutral-400">{track.artist ?? 'Independent Artist'} · {track.album ?? 'Single'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaylist(tracks);
                      playTrack(track);
                    }}
                    className="px-4 py-2 rounded-xl bg-marsRed hover:bg-marsRed/80 text-xs text-white uppercase font-bold shadow-mars"
                  >
                    Play ▶
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artist Incubation & Global Distribution Footer Callout */}
        <section className="glass-panel-strong p-8 rounded-3xl border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl bg-gradient-to-r from-obsidian to-deepSpace">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-xs text-marsRed font-bold uppercase tracking-widest">ARTIST INCUBATION // RED PLANET RECORDS</div>
            <h3 className="text-xl font-black text-white uppercase font-sans">Ready to Distribute Your Music Globally?</h3>
            <p className="text-xs text-neutral-400 max-w-xl">
              Co-founded by Deblaq &amp; Win. Upload your master catalog, set release dates, and stream instantly across 180+ countries with institutional-grade payouts.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/admin/upload"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-marsRed hover:bg-marsRed/80 text-white text-xs font-mono uppercase font-bold tracking-widest transition-all text-center glow-mars shadow-lg"
            >
              Upload &amp; Release Track
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}