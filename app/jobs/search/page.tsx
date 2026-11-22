'use client';

import { useEffect, useState } from 'react';

type Job = {
  id: string; title: string; company_name: string; description: string; category: string;
  employment_type: string; work_mode: string; location_text: string; country_code: string | null;
  salary_min: number | null; salary_max: number | null; salary_currency: string | null;
  application_url: string; source_name: string; published_at: string | null;
};

const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (location.trim()) params.set('location', location.trim());
    if (workMode) params.set('workMode', workMode);
    if (employmentType) params.set('employmentType', employmentType);
    setStatus('loading');
    fetch('/api/jobs?' + params.toString(), { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error('Jobs are temporarily unavailable.');
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setStatus('unavailable');
      });
    return () => controller.abort();
  }, [q, location, workMode, employmentType]);

  return (
    <main className="min-h-screen bg-obsidian px-5 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neonCyan">Red Planet Careers</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Discover opportunities.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Search remote, hybrid and in-person roles. Listings are sourced or submitted by administrators and should be verified with the employer before applying.</p>
        <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4">
          <label className="text-xs text-neutral-400">Role, skill or company
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. designer, accountant" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-neonCyan" />
          </label>
          <label className="text-xs text-neutral-400">Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or country" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-neonCyan" />
          </label>
          <label className="text-xs text-neutral-400">Work arrangement
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none">
              <option value="">All arrangements</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
            </select>
          </label>
          <label className="text-xs text-neutral-400">Employment
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none">
              <option value="">All types</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option><option value="freelance">Freelance</option><option value="temporary">Temporary</option>
            </select>
          </label>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available opportunities</h2>
          <span className="text-xs text-neutral-500">{jobs.length} listed</span>
        </div>
        {status === 'loading' && <p className="py-12 text-sm text-neutral-400">Loading opportunities…</p>}
        {status === 'unavailable' && <p className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-100">The jobs service is not configured or is temporarily unavailable. Please try again later.</p>}
        {status === 'ready' && jobs.length === 0 && <p className="mt-5 rounded-xl border border-white/10 p-8 text-sm text-neutral-400">No published jobs match those filters yet. Please check back as new listings are reviewed.</p>}
        <div className="mt-4 grid gap-4">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="text-lg font-semibold">{job.title}</h3><p className="mt-1 text-sm text-neutral-300">{job.company_name} · {job.location_text}</p></div>
                <span className="rounded-full border border-neonCyan/30 px-3 py-1 text-[10px] uppercase tracking-wider text-neonCyan">{label(job.work_mode)}</span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-400">{job.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                <span className="rounded-lg bg-white/5 px-2.5 py-1">{label(job.employment_type)}</span>
                <span className="rounded-lg bg-white/5 px-2.5 py-1">{job.category}</span>
                <span className="rounded-lg bg-white/5 px-2.5 py-1">Source: {job.source_name}</span>
                {job.salary_min !== null && <span className="rounded-lg bg-white/5 px-2.5 py-1">{job.salary_currency || ''} {job.salary_min.toLocaleString()} {job.salary_max !== null ? '– ' + job.salary_max.toLocaleString() : '+'}</span>}
              </div>
              <div className="mt-5 flex flex-wrap gap-3"><a href={job.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/5">Original listing ↗</a><a href={`/jobs/${job.id}/apply`} className="inline-flex rounded-xl bg-marsRed px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90">Apply through Red Planet</a></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
