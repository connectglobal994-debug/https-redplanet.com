// app/layout.tsx
//
// Enterprise-Grade Red Planet Root Layout & Cinematic Music Syndicate Portal
// Founders: Deblaq & Win | Core Architecture & Satellite Engineering: Deblaq
// Fully upgraded with high-end navigation, cinematic color palette (Obsidian, Mars Red, Neon Cyan, Deep Space),
// multi-tab routing inspired by modern Apple & Tesla layouts, persistent mini & full-screen music players,
// and high-frequency streaming integration across 180+ countries.

import type { Metadata } from 'next';
import { PlayerProvider } from '@/context/PlayerContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MusicPlayer from '@/components/MusicPlayer';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Red Planet // Multi-Planetary Syndicate & Cinematic Music Empire',
  description: 'Engineered by Deblaq & Win. Preparing humanity for Mars through cinematic music, autonomous trading systems, and multi-country streaming distribution.',
  keywords: ['Red Planet', 'Deblaq', 'Win', 'Mars Colonization', 'Music Syndicate', 'Expert Sniper Pro', 'Independent Artists', 'Cinematic UI'],
  authors: [{ name: 'Deblaq & Win', url: 'https://redplanetcodes@gmail.com' }],
  openGraph: {
    title: 'Red Planet // Multi-Planetary Syndicate',
    description: 'The autonomous digital empire and music house preparing humanity for Mars.',
    url: 'https://redplanet.com',
    siteName: 'Red Planet Syndicate',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.44.0/iconfont/tabler-icons.min.css" />
      </head>
      <body className="bg-obsidian text-white min-h-screen flex flex-col selection:bg-marsRed selection:text-white antialiased font-sans overflow-x-hidden">
        <PlayerProvider>
          {/* Persistent Cinematic Navbar with Advanced Syndicate Channels & User Profile Gear */}
          <Navbar />

          {/* Main Content Viewport Container */}
          <div className="flex-1 flex flex-col w-full min-h-[85vh]">
            {children}
          </div>

          {/* Persistent Master Footer with Telemetry Links */}
          <Footer />

          {/* Persistent Floating Lossless FLAC Music Player & Audio Streaming Bar */}
          <MusicPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}