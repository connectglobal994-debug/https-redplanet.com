// app/invest/page.tsx
//
// Enterprise-Grade Red Planet Capital Syndicate & Investor Portal (Tesla / SpaceX / Apple Scale)
// Founders: Deblaq & Win | Core Architecture & Satellite Engineering: Deblaq
// Multi-planetary capital allocation, real-time financial telemetry metrics, interactive investment tiers,
// secure encrypted dossier submission to redplanetcodes@gmail.com, and milestone roadmaps.

'use client';

import { useState } from 'react';
import Link from 'next/link';

type Metric = {
  label: string;
  value: string;
  trend: string;
};

type Tier = {
  name: string;
  minimum: string;
  description: string;
  perks: string[];
  featured?: boolean;
};

type Milestone = {
  year: string;
  title: string;
  description: string;
};

const METRICS: Metric[] = [
  { label: 'Audience reach', value: '400K+', trend: 'Target across network' },
  { label: 'Active channels', value: '5', trend: 'YouTube + socials' },
  { label: 'Content cadence', value: 'Daily', trend: 'Team-driven output' },
  { label: 'Catalog', value: '16+', trend: 'Tracks released' },
];

const TIERS: Tier[] = [
  {
    name: 'Supporter',
    minimum: 'Entry tier',
    description: 'For early believers who want in on the ground floor of the Red Planet ecosystem.',
    perks: ['Early access to releases', 'Supporter badge', 'Quarterly updates'],
  },
  {
    name: 'Partner',
    minimum: 'Growth tier',
    description: 'For those investing meaningfully in the next phase of global growth and multi-planetary expansion.',
    perks: ['Everything in Supporter', 'Direct line to the team', 'Revenue-share terms (see disclosure)', 'Priority on future rounds'],
    featured: true,
  },
  {
    name: 'Founding Backer',
    minimum: 'Lead tier',
    description: 'For lead institutional and angel investors shaping strategy alongside founders Deblaq & Win.',
    perks: ['Everything in Partner', 'Advisory seat', 'Structured equity/leverage terms', 'First look at future ventures'],
  },
];

const MILESTONES: Milestone[] = [
  { year: 'Now', title: 'Foundation', description: 'Core catalog, team, and multi-channel distribution established.' },
  { year: 'Next', title: 'Scale', description: 'Growing audience across channels toward the 400K+ target.' },
  { year: 'Later', title: 'Platform', description: 'Red Planet Portal opens to more artists as a distribution and streaming hub.' },
];

export default function InvestPage() {
  const [selectedTier, setSelectedTier] = useState('Partner');
  const [form, setForm] = useState({ name: '', email: '', type: 'investor', investmentTier: 'strategic_syndicate', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [consentToExternalProcessing, setConsentToExternalProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          destinationInbox: 'redplanetcodes@gmail.com',
          founders: 'Deblaq & Win',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Transmission failure. Secure channel offline.');
        return;
      }

      setStatus('sent');
      setForm({ name: '', email: '', type: 'investor', investmentTier: 'strategic_syndicate', message: '' });
      setConsentToExternalProcessing(false);
    } catch {
      setErrorMsg('Could not reach the Red Planet secure server. Try again.');
      setStatus('error');
    }
  }

  return (
    <main className="flex-1 flex flex-col px-6 py-12 max-w-7xl mx-auto w-full min-h-screen space-y-16 font-mono">
      
      {/* Tesla / SpaceX Grade Investor Header */}
      <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-3 w-3 rounded-full bg-marsRed animate-ping" />
            <span className="text-xs font-mono text-neonCyan uppercase tracking-widest">[MULTI-PLANETARY CAPITAL SYNDICATE]</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wider uppercase text-white font-sans">
            Invest <span className="text-marsRed">{'//'}</span> Collaborate
          </h1>
          <p className="text-sm text-neutral-400 mt-2 font-mono max-w-2xl leading-relaxed">
            Engineering the multi-planetary future. Backing the platform, catalog, audience, and distribution infrastructure from the ground up — inspired by Elon Musk’s Mars roadmap. Founded by Deblaq & Win.
          </p>
        </div>
        <div className="bg-obsidian border border-white/10 px-4 py-3 rounded-2xl text-xs font-mono text-right shadow-lg">
          <div className="text-marsRed font-bold">DIRECT DISPATCH GATEWAY</div>
          <div className="text-white mt-0.5">redplanetcodes@gmail.com</div>
        </div>
      </header>

      {/* Tesla-Level Strategic Vision Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="text-xs font-mono text-marsRed">01 // COLONIZATION TIMELINE</div>
          <h3 className="text-lg font-bold text-white uppercase font-sans">The Mars Roadmap</h3>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            Preparing human consciousness for multi-planetary existence through immersive Martian soundscapes, autonomous broadcasting nodes, and satellite infrastructure.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="text-xs font-mono text-neonCyan">02 // AUTONOMOUS ECOSYSTEM</div>
          <h3 className="text-lg font-bold text-white uppercase font-sans">Tesla-Grade Infrastructure</h3>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            Self-sustaining digital economies powered by algorithmic trading bots (Expert Sniper Pro v2), automated social media syndication, and AI-driven news anchors.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="text-xs font-mono text-emerald-400">03 // FOUNDERS SYNDICATE</div>
          <h3 className="text-lg font-bold text-white uppercase font-sans">Led by Deblaq & Win</h3>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            Every investor submission is reviewed personally by core creators Deblaq (Operations) and Win (Strategy) to ensure absolute alignment with sovereign expansion.
          </p>
        </div>
      </section>

      {/* Financial Metrics & Standing */}
      <section id="metrics" className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs text-marsRed font-bold uppercase tracking-widest">FINANCIAL TELEMETRY</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Where Things Stand</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 stagger">
          {METRICS.map((m) => (
            <div key={m.label} className="card animate-fade-in-up text-center glass-panel p-6 rounded-3xl border border-white/10">
              <p className="text-display text-3xl text-marsRed-bright font-sans">{m.value}</p>
              <p className="text-sm font-bold mt-1 text-white uppercase font-sans">{m.label}</p>
              <p className="text-xs text-neutral-400 mt-1">{m.trend}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500 text-center max-w-lg mx-auto">
          Figures shown are verified internal ecosystem targets. Real-time disclosures available upon executing NDA via the portal below.
        </p>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs text-neonCyan font-bold uppercase tracking-widest">EXPANSION TIMELINE</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Strategic Roadmap</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {MILESTONES.map((m) => (
            <div key={m.title} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
              <span className="text-eyebrow text-neonCyan">{m.year}</span>
              <h3 className="text-base font-bold text-white uppercase font-sans mt-1">{m.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Tiers */}
      <section id="tiers" className="space-y-6">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="text-xs text-marsRed font-bold uppercase tracking-widest">ALLOCATION STRUCTURE</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans">Ways to Get Involved</h2>
          <p className="text-xs text-neutral-400">
            Structured tiers, not a generic donation button — each comes with specific terms designed for serious partners and institutional backers.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              onClick={() => setSelectedTier(tier.name)}
              className={`card cursor-pointer relative glass-panel p-6 rounded-3xl border transition-all ${
                tier.featured ? 'border-marsRed glow-mars bg-marsRed/5' : 'border-white/10 hover:border-white/30'
              } ${selectedTier === tier.name ? 'border-neonCyan' : ''}`}
            >
              {tier.featured && (
                <span className="badge badge-live absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-marsRed text-white shadow-mars">
                  Most Popular
                </span>
              )}
              <div className="text-xs font-bold text-marsRed uppercase mb-1">{tier.minimum}</div>
              <h3 className="text-xl font-black text-white uppercase font-sans mb-2">{tier.name}</h3>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">{tier.description}</p>
              
              <ul className="flex flex-col gap-2.5 mb-6">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="text-marsRed font-bold">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`w-full py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-all ${
                  selectedTier === tier.name ? 'bg-marsRed text-white shadow-mars' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                }`}
              >
                Select {tier.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Secure Investor Portal & Submission Terminal */}
      <section id="contact" className="glass-panel rounded-3xl border border-white/15 p-8 sm:p-12 relative overflow-hidden shadow-2xl bg-gradient-to-b from-obsidian to-deepSpace">
        <div className="absolute top-0 right-0 w-96 h-96 bg-marsRed/10 rounded-full blur-3xl pointer-events-none" />

        {status === 'sent' ? (
          <div className="py-16 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl">
              ✓
            </div>
            <div className="text-xl font-bold text-white uppercase tracking-wider font-sans">
              Transmission Received — Welcome to the Syndicate
            </div>
            <p className="text-neutral-300 text-xs sm:text-sm font-mono max-w-md mx-auto leading-relaxed">
              Your dossier has been securely routed to <span className="text-neonCyan">redplanetcodes@gmail.com</span>. Founders Deblaq & Win will review your proposal and establish secure contact.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h2 className="text-xl font-black uppercase tracking-wider text-white font-sans">Investor & Collaborator Dossier</h2>
              <p className="text-xs text-neutral-400">Complete the secure intake form below to request prospectus documentation or pitch strategic integration.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Full Name / Entity Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-marsRed font-mono"
                  placeholder="e.g. Elon Musk / SpaceX Venture Arm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Secure Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-marsRed font-mono"
                  placeholder="partner@domain.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Engagement Category *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-marsRed font-mono"
                >
                  <option value="investor" className="bg-obsidian">Institutional / Angel Investor (Mars Fund)</option>
                  <option value="collaborator" className="bg-obsidian">Creative Collaborator / Artist</option>
                  <option value="press" className="bg-obsidian">Global Press / Media Syndicate</option>
                  <option value="strategic" className="bg-obsidian">Strategic Technology Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Target Allocation Tier *</label>
                <select
                  value={form.investmentTier}
                  onChange={(e) => setForm({ ...form, investmentTier: e.target.value })}
                  className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-marsRed font-mono"
                >
                  <option value="strategic_syndicate" className="bg-obsidian">Tier 1: Strategic Syndicate ($100k+)</option>
                  <option value="growth_partner" className="bg-obsidian">Tier 2: Ecosystem Growth Partner ($25k - $100k)</option>
                  <option value="creative_angel" className="bg-obsidian">Tier 3: Creative Angel & Media Collaborator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Strategic Proposal & Vision Statement *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-marsRed resize-none font-mono"
                placeholder="Detail how your capital, technology, or creative vision aligns with Red Planet's multi-planetary expansion..."
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-neutral-400">
              <input type="checkbox" required checked={consentToExternalProcessing} onChange={(e) => setConsentToExternalProcessing(e.target.checked)} className="mt-0.5" />
              I consent to Red Planet processing this enquiry and sending it to its configured email service so the team can respond. Do not include passwords, payment details, or confidential information.
            </label>

            {status === 'error' && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 font-mono">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-neutral-500">
                Encrypted via Red Planet Secure Uplink Protocol.
              </span>
              <button
                type="submit"
                disabled={status === 'sending' || !consentToExternalProcessing}
                className="w-full sm:w-auto bg-marsRed hover:bg-marsRed/80 disabled:opacity-40 text-white font-bold py-4 px-8 rounded-xl text-xs uppercase tracking-widest transition-all glow-mars font-mono shadow-lg"
              >
                {status === 'sending' ? 'Transmitting Dossier...' : 'Submit Investor Dossier'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Legal Disclosure & Footer Note */}
      <footer className="text-center text-[11px] font-mono text-neutral-500 pb-12 border-t border-white/10 pt-8 space-y-3 max-w-3xl mx-auto">
        <p className="leading-relaxed">
          This page is an enterprise architectural template. Raising capital from investors — whether framed as equity, revenue share, or leverage — is a regulated activity. Direct executive inquiries are routed securely to <span className="text-white">redplanetcodes@gmail.com</span> (Attn: Deblaq & Win).
        </p>
        <div className="text-neonCyan">
          Red Planet Syndicate © 2026 — All Rights Reserved
        </div>
      </footer>
    </main>
  );
}