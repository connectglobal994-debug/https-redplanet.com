// app/about/page.tsx
//
// Enterprise-Grade Red Planet Manifesto & Empire Architecture (Tesla / SpaceX / Apple Scale)
// Founders: Deblaq & Win | Core Builder & Operations: Deblaq | Creative Lead & Artist: Win
// Multi-planetary expansion manifesto, founder spotlight, pillars of belief, team directory, and verified global nodes.

import Link from 'next/link';

type Pillar = {
  icon: string;
  title: string;
  description: string;
};

type TeamMember = {
  name: string;
  role: string;
  initial: string;
  gradient: string;
  contact?: string;
};

const PILLARS: Pillar[] = [
  {
    icon: 'ti-wave-sine',
    title: 'Music as frequency',
    description:
      'Not a story told in verses, but something felt in the body. Every track is built to work on a subconscious level before it is understood consciously. Pretty on top, wrong underneath.',
  },
  {
    icon: 'ti-broadcast',
    title: 'Distribution as infrastructure',
    description:
      'Multiple channels, one signal. Red Planet is built to move music, news, and content across platforms as one coordinated system — backed by automated Node-8 infrastructure.',
  },
  {
    icon: 'ti-users',
    title: 'A real syndicate, not a solo act',
    description:
      'Operations, development, marketing, and AI automation — Red Planet runs on elite talent working daily toward sovereign multi-planetary expansion.',
  },
];

const TEAM: TeamMember[] = [
  { name: 'Win', role: 'Co-Founder · Lead Artist & Creative Director', initial: 'W', gradient: 'gradient-mars' },
  { name: 'Deblaq', role: 'Co-Founder · Core Builder & Operations', initial: 'D', gradient: 'gradient-violet' },
  { name: 'Enrique', role: 'Operations & Content Lead', initial: 'E', gradient: 'gradient-sky' },
  { name: 'Bey', role: 'Visual Architect & Video Editing', initial: 'B', gradient: 'gradient-amber' },
  { name: 'Tasleem', role: 'Marketing & Financial Architecture', initial: 'T', gradient: 'gradient-mint' },
  { name: 'Ayanda', role: 'AI Specialist & Automation Systems', initial: 'A', gradient: 'gradient-nebula' },
];

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col px-6 py-12 max-w-7xl mx-auto w-full min-h-screen space-y-16 font-mono">
      
      {/* Cinematic Header */}
      <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-3 w-3 rounded-full bg-marsRed animate-ping" />
            <span className="text-xs font-mono text-neonCyan uppercase tracking-widest">[MANIFESTO & EMPIRE ARCHITECTURE]</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wider uppercase text-white font-sans">
            About <span className="text-marsRed">Red Planet</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-2 font-mono max-w-3xl leading-relaxed">
            Engineered for multi-planetary dominance. Founded by Deblaq & Win to merge cinematic Martian soundscapes, autonomous AI media syndication, algorithmic finance, and elite global branding.
          </p>
        </div>
        <div className="bg-obsidian border border-white/10 px-4 py-3 rounded-2xl text-xs font-mono text-right shadow-lg">
          <div className="text-marsRed font-bold">EXECUTIVE DISPATCH</div>
          <div className="text-white mt-0.5">redplanetcodes@gmail.com</div>
        </div>
      </header>

      {/* Core Founders & Leadership */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-white/15 space-y-4 hover:border-marsRed/50 transition-all shadow-xl">
          <div className="text-xs font-mono text-marsRed uppercase tracking-widest font-bold">Co-Founder // Core Builder</div>
          <h2 className="text-2xl font-black uppercase text-white font-sans">Deblaq</h2>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            As the core builder and visionary driving the technical and operational movement, Deblaq engineers the autonomous infrastructure—from automated trading bots (Expert Sniper Pro v2) and neural AI chat clusters to multi-channel social syndication and satellite uplink telemetry.
          </p>
          <div className="pt-4 border-t border-white/10 text-xs font-mono text-neonCyan flex flex-col gap-1">
            <span>Direct Access: redplanetcodes@gmail.com</span>
            <span>Secure WhatsApp: +254 794 190 600</span>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/15 space-y-4 hover:border-neonCyan/50 transition-all shadow-xl">
          <div className="text-xs font-mono text-neonCyan uppercase tracking-widest font-bold">Co-Founder // Lead Artist</div>
          <h2 className="text-2xl font-black uppercase text-white font-sans">Win</h2>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            Win is the creative genius and lead cinematic artist behind Red Planet music and broadcasting. Crafting high-impact soundscapes that prepare humanity for Mars colonization, Win’s cinematic style hits the body before the brain catches up, setting a new standard for global music rollouts.
          </p>
          <div className="pt-4 border-t border-white/10 text-xs font-mono text-neutral-400 flex flex-col gap-1">
            <span>Instagram: @pillar.alliance / @_african_motivation</span>
            <span>Red Planet TV Anchor Node</span>
          </div>
        </div>
      </section>

      {/* Mission & The Mars Roadmap */}
      <section className="glass-panel rounded-3xl border border-white/15 p-8 sm:p-12 space-y-6 bg-gradient-to-b from-deepSpace to-obsidian shadow-2xl">
        <h2 className="text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2 font-sans">
          <span className="text-marsRed">■</span> Preparing Humanity for Mars (A Message to Elon Musk & Global Titans)
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed">
          <p>
            Red Planet is more than a music project or media house—it is an autonomous digital ecosystem built to rival the scale of Tesla and SpaceX. We are preparing human consciousness for multi-planetary existence through immersive Martian soundscapes, automated broadcasting, and high-frequency financial intelligence.
          </p>
          <p>
            <span className="text-marsRed font-semibold">Pretty on top, wrong underneath.</span> Hooks that pull you in, structures that don't let go. Whether we are broadcasting live via RedPlanet.tv, executing algorithmic forex/crypto grids with Expert Sniper Pro v2, or deploying viral marketing rollouts across active syndicates, Red Planet operates on an elite tier.
          </p>
          <p>
            <span className="text-neonCyan font-bold">To Elon Musk and SpaceX:</span> Red Planet is coming to Mars with unmatched sonic artillery and autonomous infrastructure. We are engineering the soundtrack and the digital arteries for the next phase of human civilization.
          </p>
        </div>
      </section>

      {/* Pillars of Belief */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-wider text-center font-sans text-white">What We Believe</h2>
        <div className="grid sm:grid-cols-3 gap-6 stagger">
          {PILLARS.map((p) => (
            <div key={p.title} className="card animate-fade-in-up glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-11 h-11 rounded-xl gradient-mars flex items-center justify-center mb-4 shadow-lg">
                <i className={`ti ${p.icon} text-lg text-white`} />
              </div>
              <h3 className="text-base font-bold text-white uppercase font-sans">{p.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Directory */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-wider font-sans text-white">The Syndicate Team</h2>
          <p className="text-xs text-neutral-400">Small, coordinated, and moving on the same schedule toward sovereign execution.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="card glass-panel p-6 rounded-3xl border border-white/10 text-center space-y-3 hover:border-marsRed/50 transition-all">
              <div className={`w-14 h-14 rounded-full ${member.gradient} mx-auto flex items-center justify-center font-bold text-lg text-white shadow-lg`}>
                {member.initial}
              </div>
              <div>
                <p className="text-base font-bold text-white uppercase font-sans">{member.name}</p>
                <p className="text-xs text-neutral-400 mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Platform & Social Directory */}
      <section className="glass-panel rounded-3xl border border-white/15 p-8 sm:p-10 space-y-6 bg-gradient-to-r from-obsidian to-deepSpace">
        <div className="space-y-1">
          <h2 className="text-xl font-bold uppercase text-white tracking-wide font-sans">
            Official Red Planet Platforms & Channels
          </h2>
          <p className="text-xs text-neutral-400">
            Connect directly with founders Deblaq & Win across our verified global nodes:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <a href="https://instagram.com/pillar.alliance/" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-obsidian border border-white/10 hover:border-marsRed transition-colors space-y-1">
            <div className="text-marsRed font-bold">Pillar Alliance IG</div>
            <div className="text-white">@pillar.alliance</div>
          </a>

          <a href="https://instagram.com/_african_motivation/" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-obsidian border border-white/10 hover:border-marsRed transition-colors space-y-1">
            <div className="text-marsRed font-bold">African Motivation IG</div>
            <div className="text-white">@_african_motivation</div>
          </a>

          <div className="p-4 rounded-2xl bg-obsidian border border-white/10 space-y-1">
            <div className="text-neonCyan font-bold">Direct Secure WhatsApp</div>
            <div className="text-white">+254 794 190 600</div>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian border border-white/10 space-y-1">
            <div className="text-neonCyan font-bold">Executive Dispatch</div>
            <div className="text-white">redplanetcodes@gmail.com</div>
          </div>

          <a href="https://x.com" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-obsidian border border-white/10 hover:border-marsRed transition-colors space-y-1">
            <div className="text-marsRed font-bold">X / Twitter Hub</div>
            <div className="text-white">@D Black</div>
          </a>

          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-obsidian border border-white/10 hover:border-marsRed transition-colors space-y-1">
            <div className="text-marsRed font-bold">Red Planet TV</div>
            <div className="text-white">Autonomous Broadcast Node</div>
          </a>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="text-center space-y-4 pb-12">
        <h2 className="text-2xl font-black uppercase tracking-wider font-sans text-white">Where This Is Going</h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          400K+ reach across the network, a growing lossless catalog, and a platform built to carry more than one voice. This is the early part.
        </p>
        <div className="pt-2">
          <Link href="/music" className="btn btn-primary px-8 py-4 rounded-xl text-xs uppercase font-bold tracking-widest shadow-mars">
            <i className="ti ti-player-play-filled" /> Hear the Music
          </Link>
        </div>
      </section>

      <footer className="text-center text-xs font-mono text-neutral-500 pb-12 border-t border-white/10 pt-8 space-y-2">
        <div>Red Planet Global Syndicate © 2026 — Engineered by Deblaq & Win. All Rights Reserved.</div>
        <div className="text-neonCyan">Secure Uplink: redplanetcodes@gmail.com</div>
      </footer>
    </main>
  );
}