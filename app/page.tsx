// app/page.tsx
//
// Enterprise-Grade Red Planet Command Center Homepage & Interactive Design Deck
// Founders: Deblaq & Win | Core Builder: Deblaq
// Features the 3D WebGL Mars Hero, core syndicate pillars, direct multi-planetary expansion gateways,
// and the fully integrated high-end Interactive Design Showcase (Apple Music, Tesla, and Amazon UI panels).

import Mars3DHero from '@/components/Mars3DHero';
import Link from 'next/link';

export default function CommandCenter() {
  return (
    <main className="flex-1 flex flex-col px-6 py-10 max-w-7xl mx-auto w-full min-h-screen space-y-16">
      
      {/* 3D Mars Interactive Hero & Satellite Telemetry Hub */}
      <Mars3DHero />

      {/* Core Syndicate Strategic Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1: Cinematic Audio & Music Syndicate */}
        <div className="glass-panel p-8 rounded-3xl border border-white/15 space-y-4 hover:border-marsRed/50 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-marsRed font-bold">01 // CINEMATIC AUDIO</span>
            <span className="text-xs font-mono text-neutral-500">FLAC / 320kbps</span>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-wide group-hover:text-marsRed transition-colors">
            The Win Catalog
          </h3>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            Soundscapes designed to hit the body before the mind catches up. Pretty on top, wrong underneath. Engineered by Win.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <Link href="/music" className="text-xs font-mono text-neonCyan hover:underline font-bold flex items-center gap-1">
              Stream Master Catalog <span>→</span>
            </Link>
            <Link href="/admin/upload" className="text-[10px] font-mono bg-white/5 hover:bg-marsRed text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors uppercase">
              Upload Track
            </Link>
          </div>
        </div>

        {/* Pillar 2: Autonomous Finance & Trading Bots */}
        <div className="glass-panel p-8 rounded-3xl border border-white/15 space-y-4 hover:border-neonCyan/50 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neonCyan font-bold">02 // AUTONOMOUS FINANCE</span>
            <span className="text-xs font-mono text-emerald-400">Node 08 Active</span>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-wide group-hover:text-neonCyan transition-colors">
            Expert Sniper Pro v2
          </h3>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            Algorithmic MetaTrader 5 bots and web automation frameworks developed by core builder Deblaq. High-frequency market intelligence.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <Link href="/trading" className="text-xs font-mono text-marsRed hover:underline font-bold flex items-center gap-1">
              View Telemetry <span>→</span>
            </Link>
            <span className="text-[10px] font-mono text-neutral-500">Secured Node</span>
          </div>
        </div>

        {/* Pillar 3: Mars Expansion & Investor Syndicate */}
        <div className="glass-panel p-8 rounded-3xl border border-white/15 space-y-4 hover:border-emerald-400/50 transition-all shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold">03 // MARS EXPANSION</span>
            <span className="text-xs font-mono text-marsRed">Sol 08</span>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
            The Elon Musk Roadmap
          </h3>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            Fulfilling multi-planetary migration through sovereign infrastructure, direct investor syndicates, and Martian soundscapes.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <Link href="/invest" className="text-xs font-mono text-emerald-400 hover:underline font-bold flex items-center gap-1">
              Invest / Collaborate <span>→</span>
            </Link>
            <a href="mailto:redplanetcodes@gmail.com" className="text-[10px] font-mono text-neonCyan hover:underline">
              Direct Email
            </a>
          </div>
        </div>

      </section>

      {/* Interactive Design Showcase Deck (Apple Music, Tesla, Amazon UI Stacks) */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/15 space-y-8 bg-gradient-to-b from-obsidian to-deepSpace shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono text-marsRed font-bold tracking-widest uppercase">
            Interactive Design Deck // UI Standards
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            Three Products, One Review
          </h2>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            Apple Music, Tesla, and Amazon rebuilt side by side — each maintaining its proprietary brand language, staged together within the Red Planet command architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

          {/* Stack 1: Apple Music Syndicate Panel */}
          <div className="flex flex-col items-center">
            <div className="font-mono text-sm font-bold mb-1 text-white">Apple Music Syndicate</div>
            <div className="text-[11px] text-neutral-400 font-mono mb-5 text-center">Dark glass · gradient art · SF-style type</div>
            
            <div className="w-full max-w-[300px] aspect-[390/844] bg-[#0a0a0c] rounded-[34px] shadow-2xl border-4 border-[#1a1a1c] overflow-hidden relative font-sans flex flex-col">
              <div className="flex justify-between items-center px-5 pt-3 pb-1 text-[11px] font-semibold text-neutral-400">
                <span>9:41</span>
                <span><i className="ti ti-wifi" /></span>
              </div>
              
              <div className="px-3.5 py-1 flex-1 overflow-y-auto scrollbar-none text-[#f5f5f7]">
                <div className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wide mt-2">Good evening</div>
                <h4 className="font-black text-xl tracking-tight my-0.5">Listen Now</h4>
                
                <div className="relative h-[110px] rounded-xl overflow-hidden bg-gradient-to-br from-[#5e5ce6] to-[#bf5af2] mb-3.5 flex flex-col justify-end p-3">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="relative z-10 text-[8px] font-bold text-white/85 uppercase tracking-wider">New Album</span>
                  <div className="relative z-10 font-black text-sm text-white">Winlock</div>
                </div>

                <div className="text-xs font-bold my-2">Recently played</div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                  <div className="flex-shrink-0 w-[76px]">
                    <div className="w-[76px] h-[76px] rounded-lg bg-gradient-to-br from-[#fa233b] to-[#ff6482] mb-1" />
                    <div className="text-[9px] font-semibold truncate">am i real</div>
                    <div className="text-[8px] text-neutral-400 truncate">Winston</div>
                  </div>
                  <div className="flex-shrink-0 w-[76px]">
                    <div className="w-[76px] h-[76px] rounded-lg bg-gradient-to-br from-[#0a84ff] to-[#64d2ff] mb-1" />
                    <div className="text-[9px] font-semibold truncate">EVERYTHING</div>
                    <div className="text-[8px] text-neutral-400 truncate">Winston</div>
                  </div>
                  <div className="flex-shrink-0 w-[76px]">
                    <div className="w-[76px] h-[76px] rounded-lg bg-gradient-to-br from-[#ff9f0a] to-[#ffd60a] mb-1" />
                    <div className="text-[9px] font-semibold truncate">Nganja</div>
                    <div className="text-[8px] text-neutral-400 truncate">Winston</div>
                  </div>
                </div>

                <div className="text-xs font-bold mt-3 mb-2">Made for you</div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-12">
                  <div className="flex-shrink-0 w-[76px]">
                    <div className="w-[76px] h-[76px] rounded-lg bg-gradient-to-br from-[#5e5ce6] to-[#bf5af2] mb-1" />
                    <div className="text-[9px] font-semibold truncate">Deep Focus</div>
                    <div className="text-[8px] text-neutral-400 truncate">Playlist</div>
                  </div>
                  <div className="flex-shrink-0 w-[76px]">
                    <div className="w-[76px] h-[76px] rounded-lg bg-gradient-to-br from-[#30d158] to-[#66d4cf] mb-1" />
                    <div className="text-[9px] font-semibold truncate">Night Drive</div>
                    <div className="text-[8px] text-neutral-400 truncate">Playlist</div>
                  </div>
                </div>
              </div>

              {/* Mini Player */}
              <div className="absolute left-2 right-2 bottom-12 bg-[#1c1c20]/85 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2 px-2.5 py-1.5 shadow-lg">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#fa233b] to-[#ff6482] flex-shrink-0" />
                <div className="text-[10px] font-semibold flex-1 truncate">Track One</div>
                <i className="ti ti-player-pause-filled text-xs text-white" />
              </div>

              {/* Tab Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-[#141417]/90 backdrop-blur-md border-t border-white/10 flex justify-around py-2 px-1">
                <i className="ti ti-home-filled text-sm text-[#fa233b]" />
                <i className="ti ti-disc text-sm text-neutral-500" />
                <i className="ti ti-antenna text-sm text-neutral-500" />
                <i className="ti ti-library text-sm text-neutral-500" />
                <i className="ti ti-search text-sm text-neutral-500" />
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono text-center mt-3 max-w-[260px]">
              Blurred glass mini-player, gradient covers instead of flat placeholders.
            </div>
          </div>

          {/* Stack 2: Tesla Vehicle Control Panel */}
          <div className="flex flex-col items-center">
            <div className="font-mono text-sm font-bold mb-1 text-white">Tesla Telemetry Deck</div>
            <div className="text-[11px] text-neutral-400 font-mono mb-5 text-center">Stark minimalism · single red accent</div>
            
            <div className="w-full max-w-[300px] aspect-[390/844] bg-white text-[#171a20] rounded-[34px] shadow-2xl border-4 border-[#2c2c2e] overflow-hidden relative font-sans flex flex-col">
              <div className="flex justify-between items-center px-5 pt-3 pb-1 text-[11px] font-semibold text-neutral-500">
                <span>9:41</span>
                <span><i className="ti ti-wifi" /></span>
              </div>

              <div className="px-3.5 py-1 flex-1 overflow-y-auto scrollbar-none">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase text-[#5c5e62]">Model 3 · Long Range</span>
                  <i className="ti ti-settings text-xs text-[#5c5e62]" />
                </div>

                <div className="flex items-center justify-center my-4 h-[70px]">
                  <div className="w-[140px] h-[46px] bg-gradient-to-b from-[#232323] to-[#0d0d0d] rounded-[20px_28px_14px_14px] relative">
                    <div className="absolute -top-3.5 left-7 w-[68px] h-[18px] bg-gradient-to-b from-[#2b2b2b] to-[#151515] rounded-[14px_14px_0_0]" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 bg-[#171a20] text-white py-1 px-3 rounded-2xl text-[9px] font-bold w-fit mx-auto mb-3 shadow">
                  <i className="ti ti-lock text-[9px]" /> Locked
                </div>

                <div className="mb-3">
                  <div className="font-black text-2xl">72%</div>
                  <div className="text-[9px] text-[#5c5e62]">235 mi range</div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  <div className="bg-[#f4f4f4] rounded-lg py-2 text-center">
                    <i className="ti ti-air-conditioning text-xs" />
                    <div className="text-[6.5px] font-bold text-[#5c5e62] uppercase mt-0.5">Climate</div>
                  </div>
                  <div className="bg-[#f4f4f4] rounded-lg py-2 text-center">
                    <i className="ti ti-bolt text-xs" />
                    <div className="text-[6.5px] font-bold text-[#5c5e62] uppercase mt-0.5">Charge</div>
                  </div>
                  <div className="bg-[#f4f4f4] rounded-lg py-2 text-center">
                    <i className="ti ti-briefcase text-xs" />
                    <div className="text-[6.5px] font-bold text-[#5c5e62] uppercase mt-0.5">Frunk</div>
                  </div>
                  <div className="bg-[#f4f4f4] rounded-lg py-2 text-center">
                    <i className="ti ti-steering-wheel text-xs" />
                    <div className="text-[6.5px] font-bold text-[#5c5e62] uppercase mt-0.5">Vent</div>
                  </div>
                </div>

                <div className="bg-[#f4f4f4] rounded-xl p-2.5 mb-12">
                  <div className="text-[8px] font-extrabold text-[#5c5e62] uppercase tracking-wider mb-1.5">Location</div>
                  <div className="w-full h-[45px] bg-gradient-to-br from-[#dcdcdc] to-[#c8c8c8] rounded-lg relative overflow-hidden">
                    <div className="absolute top-[38%] left-[52%] w-2 h-2 bg-[#fa233b] rounded-[50%_50%_50%_0] transform -rotate-45 shadow" />
                  </div>
                </div>
              </div>

              {/* Tesla Tab Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-white/92 backdrop-blur-md border-t border-neutral-200 flex justify-around py-2 px-1">
                <i className="ti ti-car text-sm text-[#fa233b]" />
                <i className="ti ti-map-2 text-sm text-neutral-400" />
                <i className="ti ti-shopping-bag text-sm text-neutral-400" />
                <i className="ti ti-user text-sm text-neutral-400" />
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono text-center mt-3 max-w-[260px]">
              Huge negative space, geometric sans, red used only for state (locked, pin, active tab).
            </div>
          </div>

          {/* Stack 3: Amazon Commercial Grid Panel */}
          <div className="flex flex-col items-center">
            <div className="font-mono text-sm font-bold mb-1 text-white">Amazon Syndicate Grid</div>
            <div className="text-[11px] text-neutral-400 font-mono mb-5 text-center">Warm dense grid · navy + orange</div>
            
            <div className="w-full max-w-[300px] aspect-[390/844] bg-[#eaeded] text-[#0f1111] rounded-[34px] shadow-2xl border-4 border-[#2c2c2e] overflow-hidden relative font-sans flex flex-col">
              <div className="flex justify-between items-center px-5 pt-3 pb-1 text-[11px] font-semibold bg-[#131921] text-white">
                <span>9:41</span>
                <span><i className="ti ti-wifi" /></span>
              </div>

              <div className="bg-[#131921] px-3 pt-1 pb-2">
                <div className="text-white text-xs font-extrabold mb-1.5">amazon<span className="text-[#ff9900]">.</span></div>
                <div className="bg-white rounded-md h-5 flex items-center px-2 text-[8px] text-neutral-400 mb-1.5">
                  Search Amazon
                </div>
                <div className="flex gap-3 text-[8px] text-white/90 overflow-x-auto scrollbar-none font-medium">
                  <span>All</span><span>Deals</span><span>Electronics</span><span>Fashion</span><span>Home</span>
                </div>
              </div>

              <div className="p-2.5 flex-1 overflow-y-auto scrollbar-none pb-12">
                <div className="bg-gradient-to-b from-[#232f3e] to-[#37475a] rounded-md p-2.5 text-white mb-2 shadow">
                  <div className="text-[7px] font-bold text-[#ff9900] uppercase tracking-wider">Limited time</div>
                  <div className="text-[11px] font-extrabold mt-0.5">Save on electronics</div>
                </div>

                <div className="space-y-2">
                  <div className="bg-white rounded-md p-2 shadow-sm">
                    <div className="text-[8px] font-extrabold mb-1.5">Deals in electronics</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <div className="w-full h-8 rounded bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mb-1">
                          <i className="ti ti-device-laptop text-[10px] text-neutral-400" />
                        </div>
                        <div className="text-[6.5px] leading-tight font-medium">Noise-cancelling headphones</div>
                        <div className="text-[7px] font-bold text-[#b12704] mt-0.5">$89.99</div>
                      </div>
                      <div>
                        <div className="w-full h-8 rounded bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mb-1">
                          <i className="ti ti-speakerphone text-[10px] text-neutral-400" />
                        </div>
                        <div className="text-[6.5px] leading-tight font-medium">Smart speaker</div>
                        <div className="text-[7px] font-bold text-[#b12704] mt-0.5">$34.99</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-2 shadow-sm">
                    <div className="text-[8px] font-extrabold mb-1.5">Fashion picks</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <div className="w-full h-8 rounded bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mb-1">
                          <i className="ti ti-shirt text-[10px] text-neutral-400" />
                        </div>
                        <div className="text-[6.5px] leading-tight font-medium">Cotton tee 3-pack</div>
                        <div className="text-[7px] font-bold text-[#b12704] mt-0.5">$21.99</div>
                      </div>
                      <div>
                        <div className="w-full h-8 rounded bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mb-1">
                          <i className="ti ti-shoe text-[10px] text-neutral-400" />
                        </div>
                        <div className="text-[6.5px] leading-tight font-medium">Running shoes</div>
                        <div className="text-[7px] font-bold text-[#b12704] mt-0.5">$58.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono text-center mt-3 max-w-[260px]">
              Dense information grid, navy header, orange reserved for CTAs and price cues.
            </div>
          </div>

        </div>
      </section>

      {/* Live Syndicate Directives & Communication Footer Banner */}
      <section className="glass-panel p-8 rounded-3xl border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-deepSpace to-obsidian">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs font-mono text-marsRed uppercase tracking-widest font-bold">
            Autonomous Empire Uplink
          </div>
          <h4 className="text-lg font-black uppercase tracking-wider text-white">
            Ready to Join the Red Planet Syndicate?
          </h4>
          <p className="text-xs text-neutral-400 font-mono max-w-xl">
            Co-founded by Deblaq and Win. Whether you are an independent artist looking for distribution or an institutional investor backing the future of Mars — connect directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <a
            href="https://wa.me/254794190600"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-obsidian text-xs font-mono uppercase tracking-widest font-bold transition-all text-center shadow-lg"
          >
            WhatsApp (+254 794 190 600)
          </a>
          <Link
            href="/invest"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-marsRed hover:bg-marsRed/80 text-white text-xs font-mono uppercase tracking-widest font-bold transition-all text-center glow-mars shadow-lg"
          >
            Open Investor Dossier
          </Link>
        </div>
      </section>

    </main>
  );
}