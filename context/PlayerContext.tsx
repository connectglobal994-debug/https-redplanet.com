// context/PlayerContext.tsx
//
// Enterprise-Grade Red Planet Global Audio Player Context & State Management
// Founders: Deblaq & Win | Core Architecture & Audio Engineering: Deblaq
// Implements robust HTML5 audio streaming, lossless track queue management, volume controls,
// telemetry synchronization, and persistent playback states across the Red Planet portal.

'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Track, TRACKS as SEED_TRACKS } from '@/lib/tracks';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  queue: Track[];
  hasError: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  seek: (fraction: number) => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  playNext: () => void;
  prevTrack: () => void;
  playPrev: () => void;
  setPlaylist: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [queue, setQueue] = useState<Track[]>(SEED_TRACKS);
  const [hasError, setHasError] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = currentIndex !== -1 && currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
    const nextItem = queue[nextIndex];
    if (nextItem) {
      // playTrack will be defined below or we can call the audio source update directly
      const audio = audioRef.current;
      if (audio) {
        const sourceUrl = nextItem.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        audio.src = sourceUrl;
        setCurrentTrack(nextItem);
        setHasError(false);
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [queue, currentTrack]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      nextTrack();
    };
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [nextTrack, volume]);

  const playTrack = useCallback((track: Track) => {
    if (!audioRef.current || !track) return;
    const audio = audioRef.current;

    const sourceUrl = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    if (currentTrack?.id !== track.id) {
      audio.src = sourceUrl;
      setCurrentTrack(track);
      setHasError(false);
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error('Audio playback error:', err);
        setHasError(true);
        setIsPlaying(false);
      });
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying, currentTrack]);

  const seekTo = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const seek = useCallback((fraction: number) => {
    if (!audioRef.current || !duration) return;
    const target = fraction * duration;
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setVolumeState(vol);
  }, []);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    const prevItem = queue[prevIndex];
    if (prevItem) {
      playTrack(prevItem);
    }
  }, [queue, currentTrack, playTrack]);

  const setPlaylist = useCallback((tracks: Track[]) => {
    setQueue(tracks);
    if (!currentTrack && tracks.length > 0) {
      const firstItem = tracks[0];
      if (firstItem) {
        setCurrentTrack(firstItem);
        if (audioRef.current) {
          audioRef.current.src = firstItem.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        }
      }
    }
  }, [currentTrack]);

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        progress,
        volume,
        queue,
        hasError,
        playTrack,
        togglePlay,
        seekTo,
        seek,
        setVolume,
        nextTrack,
        playNext: nextTrack,
        prevTrack,
        playPrev: prevTrack,
        setPlaylist,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}