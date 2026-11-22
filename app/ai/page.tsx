// app/ai/page.tsx
//
// Enterprise-Grade Red Planet Neural AI Core & Autonomous Command Center
// Founders: Deblaq & Win | Core Builder: Deblaq
// Intelligent layer featuring live news digestion, workflow automations, performance signals,
// and real-time neural chat integration across the Red Planet ecosystem.

'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

type Automation = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused';
};

type Feature = {
  icon: string;
  title: string;
  description: string;
  gradient: string;
};

const FEATURES: Feature[] = [
  {
    icon: 'ti-news',
    title: 'Live news digest',
    description: 'Pulls and summarizes stories relevant to your brand, music rollouts, and algorithmic trading operations, refreshed continuously.',
    gradient: 'gradient-mars',
  },
  {
    icon: 'ti-bolt',
    title: 'Automation workflows',
    description: 'Plan workflow triggers, draft content and route approvals. External actions remain disabled until their integrations are configured.',
    gradient: 'gradient-violet',
  },
  {
    icon: 'ti-message-2',
    title: 'Conversational assistant',
    description: 'Ask questions about your content, schedule, or performance and get direct answers backed by the neural core.',
    gradient: 'gradient-sky',
  },
  {
    icon: 'ti-chart-line',
    title: 'Performance signals',
    description: 'Surfaces what is working across your music and trading channels so you know where to focus next.',
    gradient: 'gradient-amber',
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'assistant',
    content:
      "Welcome to Red Planet AI. I can help with general questions and approved Red Planet knowledge when the backend and provider are configured. I will tell you when a source or integration is unavailable.",
  },
];

// Illustrative workflow examples only. These cards are not persisted or scheduled jobs.\nconst AUTOMATIONS: Automation[] = [
  { id: 'a1', name: 'Daily news digest', trigger: 'Every day at 8:00 AM', action: 'Summarize top stories in your niche', status: 'active' },
  { id: 'a2', name: 'New upload alert', trigger: 'When a track is uploaded', action: 'Notify the team on Telegram', status: 'active' },
  { id: 'a3', name: 'Engagement follow-up', trigger: 'Post reaches 1,000 views', action: 'Draft a follow-up post for review', status: 'paused' },
];

const STEPS = [
  { step: '01', title: 'Connect your sources', description: 'Link your content channels, news feeds, and team tools.' },
  { step: '02', title: 'Set your automations', description: 'Define triggers and the actions that should follow them.' },
  { step: '03', title: 'Run approved workflows', description: 'Once integrations and scheduled workers are configured, jobs can monitor approved sources and act within defined permissions.' },
  { step: '04', title: 'Review and refine', description: 'Check what it did, approve drafts, and adjust automations over time.' },
];

export default function RedPlanetAIPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [allowExternalLLM, setAllowExternalLLM] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading || !allowExternalLLM) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })), allowExternalLLM }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Neural link failure. Check system channels.');
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.reply }]);
    } catch {
      setError('Could not reach the Red Planet neural cluster. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a))
    );
  };

  return (
    <main className="flex-1 flex flex-col px-6 py-8 max-w-5xl mx-auto w-full min-h-screen space-y-16 font-mono">
      
      {/* Header Command Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-neonCyan animate-ping" />
            <h1 className="text-3xl font-black tracking-wider uppercase text-white font-sans">
              Red Planet // <span className="text-neonCyan">Neural AI Core</span>
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            AI workspace preview | Provider and backend status must be configured before live use
          </p>
        </div>
        <div className="flex items-center gap-3 bg-obsidian border border-white/10 px-4 py-2 rounded-xl text-xs">
          <span className="text-marsRed font-bold">NEURAL STATUS:</span>
          <span className="text-amber-300">CONFIGURATION REQUIRED · LIVE STATUS UNVERIFIED</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 text-center overflow-hidden rounded-3xl glass-panel border border-white/15 bg-gradient-to-b from-deepSpace to-obsidian shadow-2xl">
        <div className="absolute inset-0 gradient-violet opacity-10 blur-3xl pointer-events-none" />
        <p className="text-eyebrow mb-3 relative z-10">Red Planet AI</p>
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight max-w-2xl mx-auto mb-4 relative z-10 font-sans text-white">
          Your own intelligent layer, built into Red Planet
        </h2>
        <p className="text-neutral-400 max-w-xl mx-auto mb-8 relative z-10 text-xs sm:text-sm">
          An AI workspace for learning, research and approved Red Planet workflows. Live actions require configured integrations and explicit permissions.
        </p>
        <div className="flex items-center justify-center gap-3 relative z-10">
          <a href="#assistant" className="btn btn-primary text-xs uppercase font-bold">
            <i className="ti ti-sparkles" /> Try the assistant
          </a>
          <a href="#automations" className="btn btn-secondary text-xs uppercase font-bold">See automations</a>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="space-y-6">
        <h3 className="text-2xl font-black uppercase tracking-wider text-center font-sans text-white">What it does</h3>
        <div className="grid sm:grid-cols-2 gap-5 stagger">
          {FEATURES.map((f) => (
            <div key={f.title} className="card animate-fade-in-up glass-panel border border-white/10 p-6 rounded-3xl">
              <div className={`w-11 h-11 rounded-xl ${f.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <i className={`ti ${f.icon} text-lg text-white`} />
              </div>
              <h4 className="text-base font-bold text-white uppercase mb-1 font-sans">{f.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black uppercase tracking-wider text-center font-sans text-white">How it works</h3>
        <div className="grid sm:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div key={s.step} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
              <span className="text-mono-data text-marsRed-bright text-xs font-bold">{s.step}</span>
              <h4 className="text-sm font-bold text-white uppercase font-sans">{s.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Assistant Terminal */}
      <section id="assistant" className="space-y-6">
        <h3 className="text-2xl font-black uppercase tracking-wider text-center font-sans text-white">Ask the assistant</h3>
        <div className="glass-panel-strong rounded-3xl border border-white/15 overflow-hidden flex flex-col shadow-2xl h-[600px]">
          
          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-marsRed text-white shadow-mars'
                      : 'bg-obsidian border border-white/10 text-neutral-200 shadow-glass'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="text-[10px] text-neonCyan mb-1 uppercase tracking-widest font-bold">
                      [RED PLANET INTELLIGENCE NODE]
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-obsidian border border-white/10 rounded-2xl px-5 py-4 text-sm text-neutral-400 flex items-center gap-2">
                  <span className="text-neonCyan">Processing Neural Matrix</span>
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse text-marsRed">●</span>
                    <span className="animate-pulse [animation-delay:150ms] text-marsRed">●</span>
                    <span className="animate-pulse [animation-delay:300ms] text-marsRed">●</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Terminal */}
          <div className="border-t border-white/10 p-4 bg-obsidian/90 backdrop-blur flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query Red Planet neural network (Win, music rollouts, trading bots, media syndication)..."
              rows={2}
              className="flex-1 resize-none bg-deepSpace border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neonCyan/50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim() || !allowExternalLLM}
              className="bg-neonCyan hover:bg-neonCyan/80 disabled:opacity-40 disabled:cursor-not-allowed text-deepSpace font-bold px-6 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-cyan"
            >
              Transmit
            </button>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 text-center">
          Connected to backend endpoint at <code className="text-neutral-300">/api/chat</code> for live intelligence processing.
        </p>
      </section>

      {/* Automations Panel */}
      <section id="automations" className="space-y-6 pb-12">
        <h3 className="text-2xl font-black uppercase tracking-wider text-center font-sans text-white">Automation examples (preview only)</h3>
        <div className="glass-panel divide-y divide-white/10 rounded-3xl border border-white/15 overflow-hidden">
          {automations.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-bold text-white uppercase font-sans truncate">{a.name}</p>
                <p className="text-xs text-neutral-400 truncate">
                  {a.trigger} → {a.action}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleAutomation(a.id)}
                className={`badge flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  a.status === 'active' ? 'badge-live bg-emerald-500/15 text-emerald-400' : 'badge-warning bg-amber-500/15 text-amber-400'
                }`}
              >
                {a.status === 'active' ? 'Active' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
        <button type="button" disabled className="btn btn-secondary w-full py-4 rounded-2xl text-xs uppercase font-bold opacity-50 cursor-not-allowed">
          <i className="ti ti-plus" /> New automation
        </button>
      </section>

    </main>
  );
}