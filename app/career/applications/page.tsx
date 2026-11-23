'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: string; status: string; submitted_at: string; updated_at: string;
  job: null | { title: string; company_name: string; location_text: string; work_mode: string; employment_type: string; application_url: string };
};

const pretty = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [message, setMessage] = useState('Loading your applications…');
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/session', { cache: 'no-store' }).then((r) => r.json()).then(async (session) => {
      if (cancelled) return;
      if (!session.authenticated) { setMessage('Sign in to view applications submitted from your Red Planet account.'); return; }
      setSignedIn(true);
      const response = await fetch('/api/candidate/applications', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load applications.');
      if (cancelled) return;
      setApplications(Array.isArray(data.applications) ? data.applications : []);
      setMessage('Your application history is up to date.');
    }).catch((error: unknown) => { if (!cancelled) setMessage(error instanceof Error ? error.message : 'Could not load applications.'); });
    return () => { cancelled = true; };
  }, []);

  return <main className="min-h-screen bg-obsidian px-5 py-12 text-white"><section className="mx-auto max-w-5xl">
    <p className="text-xs uppercase tracking-[0.3em] text-neonCyan">Red Planet Careers</p>
    <h1 className="mt-3 text-4xl font-semibold">My applications.</h1>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Review the roles you have applied for and the latest status recorded by Red Planet.</p>
    {!signedIn && <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">{message} <a href="/account" className="ml-1 underline">Sign in</a></div>}
    {signedIn && <div className="mt-8 space-y-3">
      {applications.map((application) => <article key={application.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{application.job?.title || 'Job listing no longer available'}</h2><p className="mt-1 text-sm text-neutral-400">{application.job?.company_name || 'Employer unavailable'}</p></div><span className="rounded-full border border-neonCyan/30 px-3 py-1 text-[10px] uppercase tracking-widest text-neonCyan">{pretty(application.status)}</span></div>
        {application.job && <p className="mt-3 text-xs text-neutral-500">{application.job.location_text} · {pretty(application.job.work_mode)} · {pretty(application.job.employment_type)}</p>}
        <p className="mt-3 text-xs text-neutral-500">Submitted {dateLabel(application.submitted_at)}</p>
        {application.job?.application_url && <a href={application.job.application_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-neonCyan underline">Open original application listing</a>}
      </article>)}
      {applications.length === 0 && <div className="rounded-2xl border border-white/10 p-8 text-sm text-neutral-400">You have not submitted any applications yet. <a href="/jobs" className="ml-1 text-neonCyan underline">Browse jobs</a></div>}
    </div>}
    <p role="status" className="mt-5 text-xs text-neutral-500">{message}</p>
  </section></main>;
}
