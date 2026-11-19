// lib/socialLinks.ts
//
// Enterprise-Grade Red Planet Social & External Platform Directory (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Master directory of external channels. Features the flagship sovereign community African Motivation
// (@_african_motivation, 123K+ followers) as the primary hub, verified YouTube creator channels,
// sovereign Pillar Alliance network, direct executive communication channels (WhatsApp & Email),
// and technical automation blueprints for cross-platform syndication.

export type SocialLink = {
  platform: string;
  url: string | null;
  handle?: string;
  category: 'social' | 'broadcast' | 'satellite' | 'direct_contact';
  // Whether an automated sync/posting pipeline is active for this node.
  automationSyncActive: boolean;
  featured?: boolean;
  description?: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'Instagram (African Motivation — Flagship Hub)',
    url: 'https://www.instagram.com/_african_motivation/',
    handle: '@_african_motivation',
    category: 'social',
    automationSyncActive: true,
    featured: true,
    description: 'Primary flagship community — African history, culture, motivation, and music. 123K+ followers.',
  },
  {
    platform: 'Instagram (Pillar Alliance)',
    url: 'https://instagram.com/pillar.alliance/',
    handle: '@pillar.alliance',
    category: 'social',
    automationSyncActive: false,
    featured: true,
    description: 'Sovereign alliance network supporting creative infrastructure and independent artist growth.',
  },
  {
    platform: 'YouTube (Deblaq443 — Primary Node)',
    url: 'https://youtube.com',
    handle: '@deblaq443',
    category: 'broadcast',
    automationSyncActive: false,
    featured: true,
    description: 'Primary YouTube network telemetry and autonomous operations broadcast.',
  },
  {
    platform: 'YouTube (Win Syndicate — Music & Visuals)',
    url: 'https://youtube.com',
    handle: '@kidsoulwin',
    category: 'broadcast',
    automationSyncActive: false,
    featured: true,
    description: 'Cinematic music rollouts, visual art, and somatic audio frequency streams.',
  },
  {
    platform: 'YouTube (Produced By WestLif)',
    url: 'https://youtube.com',
    handle: '@YSociety-q1u',
    category: 'broadcast',
    automationSyncActive: false,
    featured: false,
    description: 'Audio production and master beat engineering syndicate.',
  },
  {
    platform: 'YouTube (Sam White)',
    url: 'https://youtube.com',
    handle: '@Samwitr22',
    category: 'broadcast',
    automationSyncActive: false,
    featured: false,
    description: 'Media operations and strategic network coordination.',
  },
  {
    platform: 'YouTube (Deon Edwards)',
    url: 'https://youtube.com',
    handle: '@DeonEdwards-y9e',
    category: 'broadcast',
    automationSyncActive: false,
    featured: false,
    description: 'Network telemetry and inter-node communication relays.',
  },
  {
    platform: 'YouTube (Playing Outside Somewhere)',
    url: 'https://youtube.com',
    handle: '@Eagleeyetoo',
    category: 'broadcast',
    automationSyncActive: false,
    featured: false,
    description: 'Field broadcast and cultural expedition streams.',
  },
  {
    platform: 'YouTube (Canarazy Beats)',
    url: 'https://youtube.com',
    handle: '@thiswomanfromcanada1826',
    category: 'broadcast',
    automationSyncActive: false,
    featured: false,
    description: 'Beat production and rhythm engineering node.',
  },
  {
    platform: 'YouTube (GetLikeMessiah)',
    url: 'https://youtube.com',
    handle: '@GetLikeMessiah',
    category: 'broadcast',
    automationSyncActive: false,
    featured: false,
    description: 'Outreach channel and community growth syndicate.',
  },
  {
    platform: 'Orbital Satellite Relay 08',
    url: null,
    handle: 'Node-08',
    category: 'satellite',
    automationSyncActive: true,
    featured: false,
    description: 'Active Martian atmospheric telemetry and orbital news relay node.',
  },
  {
    platform: 'WhatsApp Direct',
    url: 'https://wa.me/254794190600',
    handle: '+254 794 190 600',
    category: 'direct_contact',
    automationSyncActive: true,
    featured: true,
    description: 'Direct secure line to founders Deblaq & Win.',
  },
  {
    platform: 'Email Uplink',
    url: 'mailto:redplanetcodes@gmail.com',
    handle: 'redplanetcodes@gmail.com',
    category: 'direct_contact',
    automationSyncActive: true,
    featured: true,
    description: 'Partnerships, investor dossiers, label inquiries, and support.',
  },
  {
    platform: 'Syndicate Members',
    url: '/members',
    handle: 'Join list',
    category: 'direct_contact',
    automationSyncActive: true,
    featured: true,
    description: 'Join the Red Planet member list for early lossless releases and drop updates.',
  },
];

// --- AUTOMATION BLUEPRINT & API INTEGRATION HUB ---
// To execute cross-platform syndication across the Red Planet empire:
// 1. API Integration Hub: Next.js secure API routes (e.g. /api/syndicate/push) interfacing with
//    the Meta Graph API, X API v2, and YouTube Data API v3, with credentials stored securely in .env.local.
// 2. Automated Release Announcements: When a master track or video is deployed via /admin/upload,
//    trigger an asynchronous worker job to broadcast across connected syndicate channels.
// 3. Satellite Telemetry Feed: Integrate live simulated or actual Node 08 atmospheric data into
//    the 3D Mars WebGL hero and RedPlanet.tv interface.