// components/Sidebar.tsx
//
// Enterprise-Grade Red Planet Navigation & Global Command Bar (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Implements an elite glassmorphic navigation bar and sidebar system, featuring direct routing
// to all core nodes, a prominent spotlight for African Motivation (@_african_motivation) as the
// flagship sovereign channel (123K+ followers), active syndicate channel dropdowns, secure direct
// email uplink (redplanetcodes@gmail.com), and mobile drawer controls.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ---------------------------------------------------------
   Navigation Architecture — Apple Music / Tesla Grade
--------------------------------------------------------- */
const MAIN_LINKS = [
  { href: '/', label: 'Command Center', icon: 'ti-bolt' },
  { href: '/music', label: 'Music Syndicate', icon: 'ti-disc' },
  { href: '/jobs', label: 'Careers & Jobs', icon: 'ti-briefcase' },
  { href: '/career/profile', label: 'Build Your CV', icon: 'ti-file-cv' },
  { href: '/career/applications', label: 'My Applications', icon: 'ti-clipboard-list' },
  { href: '/research', label: 'Research OS', icon: 'ti-search' },
  { href: '/account', label: 'Sign In / Account', icon: 'ti-user-circle' },
  { href: '/tv', label: 'RedPlanet.tv', icon: 'ti-broadcast' },
  { href: '/ai', label: 'Neural AI', icon: 'ti-sparkles' },
  { href: '/growth', label: 'Growth Studio', icon: 'ti-trending-up' },
  { href: '/platforms', label: 'Platforms', icon: 'ti-apps' },
  { href: '/academy', label: 'AI Academy', icon: 'ti-school' },
  { href: '/team-portal.html', label: 'Team OS', icon: 'ti-users' },
];

const BUSINESS_LINKS = [
  { href: '/trading', label: 'Trading Bots', icon: 'ti-chart-line' },
  { href: '/invest', label: 'Invest / Partner', icon: 'ti-briefcase' },
  { href: '/real-estate', label: 'Red Planet Living', icon: 'ti-building-community' },
  { href: '/admin/jobs', label: 'Jobs Admin', icon: 'ti-clipboard-check' },
  { href: '/members', label: 'Members', icon: 'ti-users' },
];

const INFO_LINKS = [
  { href: '/about', label: 'About & Lore', icon: 'ti-planet' },
];

/* ---------------------------------------------------------
   Official Syndicate Channel Roster
   Flagship Spotlight: African Motivation (@_african_motivation)
--------------------------------------------------------- */
const SYNDICATE_CHANNELS = [
  {
    name: 'African Motivation',
    handle: '@_african_motivation',
    type: 'Instagram · 123K+ Followers · Flagship Node',
    href: 'https://www.instagram.com/_african_motivation/',
    featured: true,
  },
  {
    name: 'Pillar Alliance',
    handle: '@pillar.alliance',
    type: 'Instagram · Sovereign Union',
    href: 'https://instagram.com/pillar.alliance/',
    featured: false,
  },
  { name: 'Deblaq443', handle: '@deblaq443', type: 'YouTube · Primary Node', href: 'https://youtube.com' },
  { name: 'Win Syndicate', handle: '@kidsoulwin', type: 'YouTube · Music & Visuals', href: 'https://youtube.com' },
  { name: 'Produced By WestLif', handle: '@YSociety-q1u', type: 'YouTube · Audio Production', href: 'https://youtube.com' },
  { name: 'Sam White', handle: '@Samwitr22', type: 'YouTube · Media Operations', href: 'https://youtube.com' },
  { name: 'Deon Edwards', handle: '@DeonEdwards-y9e', type: 'YouTube · Network Telemetry', href: 'https://youtube.com' },
  { name: 'Playing Outside Somewhere', handle: '@Eagleeyetoo', type: 'YouTube · Field Broadcast', href: 'https://youtube.com' },
  { name: 'Canarazy Beats', handle: '@thiswomanfromcanada1826', type: 'YouTube · Beat Production', href: 'https://youtube.com' },
  { name: 'GetLikeMessiah', handle: '@GetLikeMessiah', type: 'YouTube · Outreach Channel', href: 'https://youtube.com' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(true);

  const NavGroup = ({
    title,
    links,
  }: {
    title: string;
    links: { href: string; label: string; icon: string }[];
  }) => (
    <div className="mb-6">
      <p className="text-eyebrow px-3 mb-2 text-marsRed-bright font-mono text-[10px] tracking-widest uppercase">{title}</p>
      <div className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                active
                  ? 'bg-marsRed text-white shadow-mars font-bold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`ti ${link.icon} text-base flex-shrink-0 text-neonCyan`} />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full font-mono">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="relative flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-marsRed animate-ping opacity-75" />
          <span className="relative block h-3.5 w-3.5 rounded-full bg-marsRed" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-black tracking-widest uppercase text-white group-hover:text-marsRed transition-colors truncate font-sans">
            Red Planet
          </span>
          <span className="text-[10px] text-neutral-400 tracking-wider truncate">
            Deblaq &amp; Win Syndicate
          </span>
        </div>
      </Link>

      {/* Flagship Spotlight Card: African Motivation */}
      <a
        href="https://www.instagram.com/_african_motivation/"
        target="_blank"
        rel="noreferrer"
        className="mx-2 mb-6 p-3.5 rounded-2xl bg-gradient-to-br from-marsRed/20 via-obsidian to-deepSpace border border-marsRed/40 hover:border-marsRed transition-all shadow-mars group block"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-marsRed-bright flex items-center gap-1">
            <i className="ti ti-star-filled text-xs animate-pulse" /> Flagship Node
          </span>
          <span className="text-[10px] text-neonCyan font-bold">123K+</span>
        </div>
        <div className="text-xs font-bold text-white group-hover:text-marsRed transition-colors font-sans">
          African Motivation
        </div>
        <div className="text-[10px] text-neutral-400 truncate mt-0.5">
          @_african_motivation (IG)
        </div>
      </a>

      {/* Navigation Groups */}
      <NavGroup title="Explore" links={MAIN_LINKS} />
      <NavGroup title="Business & Telemetry" links={BUSINESS_LINKS} />
      <NavGroup title="Intel & Lore" links={INFO_LINKS} />

      {/* Syndicate Channels — Collapsible Roster */}
      <div className="mb-6 px-1">
        <button
          type="button"
          onClick={() => setChannelsOpen(!channelsOpen)}
          className="w-full flex items-center justify-between px-2 mb-2 text-eyebrow text-[10px] font-mono uppercase tracking-widest text-neonCyan font-bold"
        >
          <span className="flex items-center gap-1.5">
            <i className="ti ti-antenna" /> Syndicate Channels ({SYNDICATE_CHANNELS.length})
          </span>
          <i className={`ti ti-chevron-down text-neutral-400 transition-transform ${channelsOpen ? 'rotate-180' : ''}`} />
        </button>
        {channelsOpen && (
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
            {SYNDICATE_CHANNELS.map((ch) => (
              <a
                key={ch.handle}
                href={ch.href}
                target="_blank"
                rel="noreferrer"
                className={`p-2.5 rounded-xl text-xs transition-all ${
                  ch.featured
                    ? 'bg-marsRed/10 border border-marsRed/40 text-white shadow-mars'
                    : 'bg-deepSpace hover:bg-white/5 border border-white/5 text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white truncate flex items-center gap-1">
                    {ch.featured && <i className="ti ti-star-filled text-marsRed-bright text-[10px]" />}
                    {ch.name}
                  </span>
                  <span className="text-[10px] text-neonCyan flex-shrink-0 ml-2 font-mono">{ch.handle}</span>
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">{ch.type}</div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Admin Studio & Executive Actions */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-3 px-1">
        <Link
          href="/admin/upload"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors uppercase font-bold"
        >
          <i className="ti ti-lock text-sm text-marsRed" />
          Admin Studio
        </Link>

        <Link
          href="/invest"
          onClick={() => setMobileOpen(false)}
          className="btn btn-primary w-full py-3 text-xs uppercase font-bold tracking-widest rounded-xl text-center shadow-mars block"
        >
          <i className="ti ti-handshake mr-1.5" /> Collaborate
        </Link>

        <a
          href="mailto:redplanetcodes@gmail.com"
          className="block text-center text-[10px] text-neutral-400 hover:text-neonCyan transition-colors truncate pt-1"
        >
          redplanetcodes@gmail.com
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* ============ Desktop Sidebar ============ */}
      <aside className="hidden xl:flex xl:flex-col xl:w-72 xl:fixed xl:inset-y-0 xl:left-0 glass-panel-strong border-r border-white/10 px-4 py-6 z-40 shadow-2xl">
        {SidebarContent()}
      </aside>

      {/* ============ Mobile Top Bar + Drawer ============ */}
      <div className="xl:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3.5 glass-panel-strong border-b border-white/10 shadow-lg">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="block h-3 w-3 rounded-full bg-marsRed animate-pulse" />
          <span className="text-sm font-black tracking-widest uppercase text-white font-sans">Red Planet</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="p-2.5 rounded-xl bg-obsidian border border-white/10 text-white hover:border-marsRed transition-colors"
        >
          <i className={`ti ${mobileOpen ? 'ti-x' : 'ti-menu-2'} text-lg`} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-deepSpace/95 backdrop-blur-2xl px-6 py-6 pt-24 overflow-y-auto flex flex-col">
          {SidebarContent()}
        </div>
      )}

      {/* Spacer so page content clears the fixed desktop sidebar */}
      <div className="hidden xl:block xl:w-72 flex-shrink-0" aria-hidden="true" />
    </>
  );
}