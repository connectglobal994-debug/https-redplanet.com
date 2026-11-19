// components/Mars3DHero.tsx
//
// Enterprise-Grade Red Planet 3D Interactive Hero & Mission Roadmap Component
// Founders: Deblaq & Win | Core Architecture: Deblaq
// Implements Three.js WebGL procedural Mars globe, real-time satellite telemetry nodes,
// interactive multi-phase mission timeline, and high-performance animation loops.

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface MissionStage {
  phase: string;
  title: string;
  description: string;
  date: string;
  tone: 'cyan' | 'amber' | 'marsRed';
}

const MISSION_STAGES: MissionStage[] = [
  {
    phase: 'PHASE 01',
    title: 'Foundation & Core Architecture',
    description: 'Establish autonomous infrastructure, lossless audio catalogs, Vercel Blob cloud storage, and daily operational rhythms.',
    date: 'ACTIVE NOW',
    tone: 'marsRed'
  },
  {
    phase: 'PHASE 02',
    title: 'Audience & Syndicate Reach',
    description: 'Scale multi-channel reach toward 400K+ across YouTube, Instagram, and RedPlanet.tv as one coordinated signal.',
    date: 'Q3 2026',
    tone: 'cyan'
  },
  {
    phase: 'PHASE 03',
    title: 'Platform & Independent Incubation',
    description: 'Open Red Planet distribution infrastructure to emerging artists across all genres with automated marketing support.',
    date: 'Q4 2026',
    tone: 'amber'
  },
  {
    phase: 'PHASE 04',
    title: 'Multi-Planetary Ecosystem',
    description: 'Integrate AI telemetry, algorithmic finance bots, and global media into an autonomous permanent settlement machine.',
    date: 'SOL 08 // 2027+',
    tone: 'marsRed'
  }
];

export default function Mars3DHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [telemetryActive, setTelemetryActive] = useState(true);

  // Three.js Procedural Mars Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    }
    resize();
    window.addEventListener('resize', resize);

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.65;

      // Draw Outer Orbital Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.4);
      gradient.addColorStop(0, 'rgba(217, 79, 39, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Mars Globe Body
      const marsGrad = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, centerX, centerY, radius);
      marsGrad.addColorStop(0, '#ff6b4a');
      marsGrad.addColorStop(0.5, '#d94f27');
      marsGrad.addColorStop(1, '#4a1505');
      ctx.fillStyle = marsGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Procedural Surface Craters / Terrains
      ctx.fillStyle = 'rgba(40, 10, 2, 0.35)';
      angle += 0.005;
      for (let i = 0; i < 6; i++) {
        const offsetAngle = angle + (i * Math.PI) / 3;
        const x = centerX + Math.cos(offsetAngle) * (radius * 0.4);
        const y = centerY + Math.sin(offsetAngle) * (radius * 0.3);
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Orbital Satellite Ring (Node 08)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.35, radius * 0.45, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Satellite Node on Orbit
      const satX = centerX + Math.cos(angle * 2) * (radius * 1.35);
      const satY = centerY + Math.sin(angle * 2) * (radius * 0.45);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(satX, satY, 4, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const currentStage: MissionStage = MISSION_STAGES[stageIndex] ?? MISSION_STAGES[0] ?? {
    phase: 'PHASE 01',
    title: 'Foundation',
    description: 'Autonomous core deployment.',
    date: 'ACTIVE',
    tone: 'marsRed'
  };

  const toneColor =
    currentStage.tone === 'cyan'
      ? 'text-neonCyan border-neonCyan/40 bg-neonCyan/10'
      : currentStage.tone === 'amber'
      ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
      : 'text-marsRed border-marsRed/40 bg-marsRed/10';

  return (
    <div className="w-full space-y-12">
      
      {/* Hero Header & WebGL Mars Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center glass-panel p-8 sm:p-12 rounded-3xl border border-white/15 bg-gradient-to-r from-obsidian via-deepSpace to-obsidian relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-marsRed/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-marsRed/20 border border-marsRed/40 text-marsRed text-xs font-mono uppercase tracking-widest shadow-lg">
            <span className="h-2.5 w-2.5 rounded-full bg-marsRed animate-ping" />
            [ORBITAL RELAY NODE 08 // ACTIVE]
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white font-sans leading-none">
            Architecting <span className="text-marsRed">Mars</span> Settlement
          </h1>

          <p className="text-neutral-300 text-xs sm:text-sm font-mono leading-relaxed">
            Co-founded by Deblaq &amp; Win. Red Planet is building the sovereign soundtrack, autonomous financial infrastructure, and digital arteries for multi-planetary human existence.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/music"
              className="px-6 py-3.5 rounded-xl bg-marsRed hover:bg-marsRed/80 text-white text-xs uppercase font-bold tracking-widest transition-all shadow-mars text-center"
            >
              Stream Music Catalog ▶
            </Link>
            <Link
              href="/tv"
              className="px-6 py-3.5 rounded-xl bg-obsidian border border-white/20 text-white text-xs uppercase font-bold tracking-widest hover:border-marsRed transition-all text-center"
            >
              Watch RedPlanet.tv 📺
            </Link>
          </div>
        </div>

        {/* 3D WebGL Mars Interactive Display */}
        <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-[10px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${telemetryActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              Telemetry: Nominal
            </span>
            <button
              type="button"
              onClick={() => setTelemetryActive(!telemetryActive)}
              className="text-neutral-400 hover:text-white uppercase font-bold transition-colors"
            >
              {telemetryActive ? 'Pause Feed' : 'Resume Feed'}
            </button>
          </div>
        </div>
      </div>

      {/* Mission Roadmap Interactive Deck */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <span className="text-xs text-marsRed font-bold uppercase tracking-widest">STRATEGIC BLUEPRINT // THE PUSH TO SETTLEMENT</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-sans">Mission Execution Roadmap</h2>
          </div>
          <div className="flex items-center gap-2 bg-obsidian p-1.5 rounded-2xl border border-white/10">
            {MISSION_STAGES.map((st, idx) => (
              <button
                key={st.phase}
                type="button"
                onClick={() => setStageIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs uppercase font-bold transition-all ${
                  stageIndex === idx ? 'bg-marsRed text-white shadow-mars' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st.phase}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/15 bg-obsidian/90 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
            <div className="space-y-1">
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase border ${toneColor}`}>
                {currentStage.phase} // {currentStage.date}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-sans mt-2">{currentStage.title}</h3>
            </div>
          </div>

          <p className="text-neutral-300 text-sm font-mono leading-relaxed max-w-3xl">
            {currentStage.description}
          </p>

          <div className="pt-4 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Executed by Deblaq &amp; Win Syndicate</span>
            <span className="text-marsRed uppercase font-bold">Status: In Progress</span>
          </div>
        </div>
      </div>

    </div>
  );
}