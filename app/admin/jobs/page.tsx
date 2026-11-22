'use client';

import { FormEvent, useState } from 'react';

export default function AdminJobsPage() {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Job could not be saved.');
      event.currentTarget.reset();
      setMessage('Job saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Job could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-obsidian px-5 py-12 text-white">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-neonCyan">Administrator workspace</p>
        <h1 className="mt-3 text-3xl font-semibold">Publish a job</h1>
        <p className="mt-3 text-sm text-neutral-400">Only an authenticated Red Planet administrator can submit a listing. All fields are validated by the server.</p>
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
          {[
            ['title','Job title','text'],['companyName','Company / employer','text'],['category','Category','text'],['location','Location','text'],['countryCode','Country code (optional)','text'],['applicationUrl','Application URL','url'],['sourceName','Source name','text'],['sourceUrl','Original source URL (optional)','url'],['salaryMin','Minimum salary','number'],['salaryMax','Maximum salary','number'],['salaryCurrency','Currency (e.g. USD)','text'],['salaryPeriod','Salary period (e.g. monthly)','text'],['expiresAt','Expiry date (optional)','date'],
          ].map(([name, label, type]) => (
            <label key={name} className="text-xs text-neutral-400">{label}
              <input name={name} type={type} required={['title','companyName','applicationUrl'].includes(name)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-neonCyan" />
            </label>
          ))}
          <label className="text-xs text-neutral-400">Employment type
            <select name="employmentType" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="internship">Internship</option><option value="freelance">Freelance</option><option value="volunteer">Volunteer</option></select>
          </label>
          <label className="text-xs text-neutral-400">Work arrangement
            <select name="workMode" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select>
          </label>
          <label className="text-xs text-neutral-400">Publication status
            <select name="status" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"><option value="published">Publish now</option><option value="draft">Save draft</option></select>
          </label>
          <label className="md:col-span-2 text-xs text-neutral-400">Job description
            <textarea name="description" required minLength={30} rows={7} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-neonCyan" />
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-4">
            <button disabled={saving} className="rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Save job listing'}</button>
            {message && <p role="status" className="text-sm text-neutral-300">{message}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
