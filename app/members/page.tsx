// app/members/page.tsx
//
// Enterprise-Grade Red Planet Syndicate Membership Portal (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Architecture & Engineering: Deblaq
// Implements secure member intake, encrypted client-server submission telemetry, direct
// routing to backend members endpoint, live feedback state management, and multi-planetary styling.

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MembersPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), privacyConsent }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Transmission failure. Syndicate network offline.');
        return;
      }

      setStatus('done');
      setName('');
      setEmail('');
      setPrivacyConsent(false);
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the Red Planet secure server. Try again.');
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-2xl mx-auto w-full min-h-screen font-mono">
      <div className="glass-panel-strong rounded-3xl border border-white/15 p-8 sm:p-12 w-full shadow-2xl space-y-8 bg-gradient-to-b from-obsidian to-deepSpace relative overflow-hidden">
        
        {/* Glow Background Asset */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-marsRed/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marsRed/20 border border-marsRed/40 text-marsRed text-xs font-mono uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-marsRed animate-ping" />
            [SYNDICATE MEMBERSHIP PORTAL]
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase text-white font-sans">
            Become a <span className="text-marsRed">Red Planet</span> Member
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm font-mono max-w-md mx-auto leading-relaxed">
            Early access to lossless releases, first word on drops, and a direct line into what founders Deblaq &amp; Win are building next.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-2 font-mono">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elon Musk"
                className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-marsRed font-mono transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-2 font-mono">Secure Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@domain.com"
                className="w-full bg-deepSpace border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-marsRed font-mono transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || !privacyConsent}
            className="w-full bg-marsRed hover:bg-marsRed/80 disabled:opacity-40 text-white font-bold py-4 px-6 rounded-xl text-xs uppercase tracking-widest transition-all glow-mars font-mono shadow-lg"
          >
            {status === 'submitting' ? 'Transmitting Credentials...' : 'Join the Syndicate'}
          </button>

          {status === 'done' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-400 font-mono text-center space-y-1">
              <div className="font-bold">✓ Transmission Received — Welcome to the Syndicate</div>
              <p className="text-[11px] text-neutral-300">You are officially on the list. Check your inbox for upcoming drops.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-400 font-mono text-center">
              {errorMsg || 'Transmission failed. Ensure the /api/members route is active.'}
            </div>
          )}
        </form>

        <div className="pt-6 border-t border-white/10 text-center text-[11px] font-mono text-neutral-500 space-y-2 relative z-10">
          <div>Direct executive inquiries: <span className="text-white">redplanetcodes@gmail.com</span></div>
          <div>Red Planet Syndicate © 2026 — Engineered by Deblaq &amp; Win</div>
        </div>

      </div>
    </main>
  );
}