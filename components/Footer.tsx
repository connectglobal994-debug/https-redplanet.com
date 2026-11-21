// components/Footer.tsx
//
// Enterprise-Grade Red Planet Footer & Global Command Center (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq
// Implements an elite glassmorphic footer featuring brand manifesto, direct contact links
// (redplanetcodes@gmail.com / WhatsApp: +254 794 190 600), platform node navigation, syndicate gateway,
// fully corrected verified creator channels including flagship African Motivation (@_african_motivation),
// and encrypted orbital relay telemetry notices.

import Link from 'next/link';

const SYNDICATE_FOOTER_CHANNELS = [
  { name: 'African Motivation', handle: '@_african_motivation', href: 'https://www.instagram.com/_african_motivation/', featured: true },
  { name: 'Pillar Alliance', handle: '@pillar.alliance', href: 'https://instagram.com/pillar.alliance/', featured: true },
  { name: 'Deblaq443', handle: '@deblaq443', href: 'https://youtube.com', featured: false },
  { name: 'Win Syndicate', handle: '@kidsoulwin', href: 'https://youtube.com', featured: false },
  { name: 'Produced By WestLif', handle: '@YSociety-q1u', href: 'https://youtube.com', featured: false },
  { name: 'Sam White', handle: '@Samwitr22', href: 'https://youtube.com', featured: false },
  { name: 'Deon Edwards', handle: '@DeonEdwards-y9e', href: 'https://youtube.com', featured: false },
  { name: 'Playing Outside', handle: '@Eagleeyetoo', href: 'https://youtube.com', featured: false },
  { name: 'Canarazy Beats', handle: '@thiswomanfromcanada1826', href: 'https://youtube.com', featured: false },
  { name: 'GetLikeMessiah', handle: '@GetLikeMessiah', href: 'https://youtube.com', featured: false },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto bg-obsidian/95 backdrop-blur-2xl font-mono text-xs">
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col space-y-10">
        
        {/* Top Footer Grid: Empire Info, Direct Contacts & Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          
          {/* Col 1: Brand & Founders */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-marsRed animate-pulse" />
              <span className="text-sm font-black tracking-widest uppercase text-white font-sans">
                Red Planet Syndicate
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Autonomous multi-planetary digital empire. Founded by Deblaq &amp; Win. Engineering the future of music, media, and financial markets.
            </p>
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-neonCyan font-bold flex items-center gap-1.5">
                <span>✉</span> redplanetcodes@gmail.com
              </div>
              <div className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                <span>📞</span> WhatsApp: +254 794 190 600
              </div>
            </div>
          </div>

          {/* Col 2: Core Platform Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-marsRed uppercase tracking-wider font-sans">
              Platform Nodes
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-neutral-400 hover:text-white transition-colors">Command Center</Link></li>
              <li><Link href="/music" className="text-neutral-400 hover:text-white transition-colors">Music Syndicate</Link></li>
              <li><Link href="/tv" className="text-neutral-400 hover:text-white transition-colors">RedPlanet.tv Live</Link></li>
              <li><Link href="/trading" className="text-neutral-400 hover:text-white transition-colors">Trading Bot Telemetry</Link></li>
              <li><Link href="/ai" className="text-neutral-400 hover:text-white transition-colors">Neural AI Core</Link></li>
            </ul>
          </div>

          {/* Col 3: Investor & Admin Gateway */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neonCyan uppercase tracking-wider font-sans">
              Syndicate Gateway
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/invest" className="text-neutral-400 hover:text-white transition-colors">Invest / Partner Portal</Link></li>
              <li><Link href="/members" className="text-neutral-400 hover:text-white transition-colors">Syndicate Membership</Link></li>
              <li><Link href="/about" className="text-neutral-400 hover:text-white transition-colors">About &amp; Lore (Win &amp; Deblaq)</Link></li>
              <li><Link href="/admin/upload" className="text-neutral-400 hover:text-marsRed transition-colors font-bold">Admin Studio (Protected)</Link></li>
            </ul>
          </div>

          {/* Col 4: Verified Syndicate Creators */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-marsRed uppercase tracking-wider font-sans flex items-center justify-between">
              <span>Verified Channels</span>
              <span className="text-[10px] text-neonCyan font-mono">10 Nodes</span>
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
              {SYNDICATE_FOOTER_CHANNELS.map((ch, idx) => (
                <a
                  key={idx}
                  href={ch.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-2.5 rounded-xl border transition-all flex justify-between items-center ${
                    ch.featured
                      ? 'bg-marsRed/10 border-marsRed/40 text-white shadow-mars'
                      : 'bg-deepSpace hover:bg-white/5 border-white/5 text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-[11px] truncate flex items-center gap-1">
                      {ch.featured && <span className="text-marsRed-bright text-[9px]">★</span>}
                      {ch.name}
                    </div>
                    <div className="text-[9px] text-neutral-400 truncate">{ch.href.includes('instagram') ? 'Instagram' : 'YouTube'}</div>
                  </div>
                  <span className="text-neonCyan text-[10px] font-bold flex-shrink-0 ml-2">{ch.handle}</span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Security Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            Red Planet Global Syndicate © {new Date().getFullYear()} — All Rights Reserved. Founders: Deblaq &amp; Win.
          </div>
          <div className="text-neonCyan text-[11px] font-bold">
            Encrypted via Red Planet Secure Satellite Relay 08.
          </div>
        </div>

      </div>
    </footer>
  );
}