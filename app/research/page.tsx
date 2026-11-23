'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Project = { id: string; title: string; research_question: string; status: string; access_role: string; updated_at: string };
type Source = { id: string; title: string; source_url: string; publisher?: string | null; notes?: string | null; source_type: string; created_at: string };
type Finding = { id: string; title: string; body: string; confidence: string; created_at: string };
type Detail = { project: Project; canEdit: boolean; sources: Source[]; findings: Finding[] };

const inputClass = 'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-neonCyan';
const panelClass = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5';

export default function ResearchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Detail | null>(null);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');
  const [findingTitle, setFindingTitle] = useState('');
  const [findingBody, setFindingBody] = useState('');
  const [message, setMessage] = useState('Loading your research workspace…');
  const [busy, setBusy] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const loadProjects = useCallback(async () => {
    const session = await fetch('/api/account/session', { cache: 'no-store' }).then((r) => r.json());
    if (!session.authenticated) {
      setAuthenticated(false);
      setMessage('Sign in to create private research projects and manage your evidence.');
      return;
    }
    setAuthenticated(true);
    const response = await fetch('/api/research', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load your research workspace.');
    setProjects(Array.isArray(data.projects) ? data.projects : []);
    setMessage('Your private research workspace is ready.');
  }, []);

  const openProject = useCallback(async (id: string) => {
    setMessage('Loading project…');
    const response = await fetch('/api/research/' + id, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not open project.');
    setActive(data as Detail);
    setMessage('Project loaded.');
  }, []);

  useEffect(() => {
    loadProjects().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Research service unavailable.'));
  }, [loadProjects]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/research', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, researchQuestion: question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Project could not be created.');
      setTitle(''); setQuestion('');
      await loadProjects();
      if (data.project?.id) await openProject(data.project.id);
      setMessage('Research project created.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Project could not be created.'); }
    finally { setBusy(false); }
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    setBusy(true);
    try {
      const response = await fetch('/api/research/' + active.project.id + '/sources', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sourceTitle, sourceUrl, notes: sourceNotes, sourceType: 'web' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Source could not be saved.');
      setSourceTitle(''); setSourceUrl(''); setSourceNotes('');
      await openProject(active.project.id);
      setMessage('Source added to the project.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Source could not be saved.'); }
    finally { setBusy(false); }
  }

  async function addFinding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    setBusy(true);
    try {
      const response = await fetch('/api/research/' + active.project.id + '/findings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: findingTitle, body: findingBody, confidence: 'unrated' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Finding could not be saved.');
      setFindingTitle(''); setFindingBody('');
      await openProject(active.project.id);
      setMessage('Finding saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Finding could not be saved.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-obsidian px-5 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neonCyan">Red Planet · Research OS</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl font-semibold md:text-5xl">Research with evidence.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Create private research projects, collect source material and turn evidence into traceable findings. Projects are private unless collaborators are explicitly added.</p>
          </div>
          <span className="rounded-full border border-neonCyan/30 px-3 py-1.5 text-[10px] uppercase tracking-widest text-neonCyan">Authenticated workspace</span>
        </div>

        {!authenticated && <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">{message} <a href="/account" className="ml-1 underline">Sign in</a></div>}
        {authenticated && <div className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <form onSubmit={createProject} className={panelClass}>
              <h2 className="text-lg font-semibold">New research project</h2>
              <label className="mt-4 block text-xs text-neutral-400">Project title<input required minLength={3} maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. East Africa creator economy" /></label>
              <label className="mt-4 block text-xs text-neutral-400">Research question<textarea required minLength={10} maxLength={5000} rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} className={inputClass} placeholder="What do you want to understand or verify?" /></label>
              <button disabled={busy} className="mt-4 w-full rounded-xl bg-marsRed px-4 py-3 text-sm font-semibold disabled:opacity-50">{busy ? 'Working…' : 'Create project'}</button>
            </form>
            <div className={panelClass}>
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Your projects</h2><span className="text-xs text-neutral-500">{projects.length}</span></div>
              <div className="mt-4 space-y-2">
                {projects.map((project) => <button key={project.id} onClick={() => openProject(project.id).catch((e: unknown) => setMessage(e instanceof Error ? e.message : 'Could not open project.'))} className={'w-full rounded-xl border p-3 text-left transition ' + (active?.project.id === project.id ? 'border-neonCyan/50 bg-neonCyan/10' : 'border-white/10 bg-black/20 hover:bg-white/5')}>
                  <span className="block text-sm font-semibold">{project.title}</span>
                  <span className="mt-1 block text-xs text-neutral-400 line-clamp-2">{project.research_question}</span>
                  <span className="mt-2 block text-[10px] uppercase tracking-widest text-neonCyan">{project.access_role} · {project.status}</span>
                </button>)}
                {projects.length === 0 && <p className="py-5 text-sm text-neutral-500">No projects yet. Create your first one above.</p>}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {!active && <div className={panelClass + ' min-h-72 flex items-center justify-center text-center'}><div><p className="text-xl font-semibold">Select a research project</p><p className="mt-2 text-sm text-neutral-400">Your sources and findings will appear here.</p></div></div>}
            {active && <>
              <section className={panelClass}>
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-neonCyan">{active.project.status} project</p><h2 className="mt-2 text-2xl font-semibold">{active.project.title}</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">{active.canEdit ? 'Editor access' : 'View only'}</span></div>
                <p className="mt-3 text-sm leading-6 text-neutral-300">{active.project.research_question}</p>
                <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-black/20 p-4"><p className="text-2xl font-semibold">{active.sources.length}</p><p className="text-xs text-neutral-500">Sources</p></div><div className="rounded-xl bg-black/20 p-4"><p className="text-2xl font-semibold">{active.findings.length}</p><p className="text-xs text-neutral-500">Findings</p></div></div>
              </section>

              {active.canEdit && <div className="grid gap-5 xl:grid-cols-2">
                <form onSubmit={addSource} className={panelClass}>
                  <h3 className="text-lg font-semibold">Add a source</h3>
                  <label className="mt-3 block text-xs text-neutral-400">Source title<input required value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} className={inputClass} placeholder="Report, article or dataset title" /></label>
                  <label className="mt-3 block text-xs text-neutral-400">Source URL<input required type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className={inputClass} placeholder="https://" /></label>
                  <label className="mt-3 block text-xs text-neutral-400">Research notes<textarea rows={3} value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} className={inputClass} placeholder="Why is this source relevant?" /></label>
                  <button disabled={busy} className="mt-4 rounded-xl border border-neonCyan/40 px-4 py-2.5 text-sm text-neonCyan disabled:opacity-50">Save source</button>
                </form>
                <form onSubmit={addFinding} className={panelClass}>
                  <h3 className="text-lg font-semibold">Capture a finding</h3>
                  <label className="mt-3 block text-xs text-neutral-400">Finding title<input required minLength={3} value={findingTitle} onChange={(e) => setFindingTitle(e.target.value)} className={inputClass} placeholder="What did the evidence show?" /></label>
                  <label className="mt-3 block text-xs text-neutral-400">Evidence-based note<textarea required rows={6} value={findingBody} onChange={(e) => setFindingBody(e.target.value)} className={inputClass} placeholder="Record the finding, context and limitations…" /></label>
                  <button disabled={busy} className="mt-4 rounded-xl border border-neonCyan/40 px-4 py-2.5 text-sm text-neonCyan disabled:opacity-50">Save finding</button>
                </form>
              </div>}

              <div className="grid gap-5 xl:grid-cols-2">
                <section className={panelClass}><h3 className="text-lg font-semibold">Evidence library</h3><div className="mt-4 space-y-3">
                  {active.sources.map((source) => <article key={source.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><a href={source.source_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-neonCyan hover:underline">{source.title}</a><p className="mt-1 break-all text-xs text-neutral-500">{source.source_url}</p>{source.notes && <p className="mt-2 text-sm text-neutral-300">{source.notes}</p>}</article>)}
                  {active.sources.length === 0 && <p className="text-sm text-neutral-500">No sources have been added.</p>}
                </div></section>
                <section className={panelClass}><h3 className="text-lg font-semibold">Research findings</h3><div className="mt-4 space-y-3">
                  {active.findings.map((finding) => <article key={finding.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-2"><h4 className="text-sm font-semibold">{finding.title}</h4><span className="text-[10px] uppercase tracking-wider text-neutral-500">{finding.confidence}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{finding.body}</p></article>)}
                  {active.findings.length === 0 && <p className="text-sm text-neutral-500">No findings recorded yet.</p>}
                </div></section>
              </div>
            </>}
          </div>
        </div>}
        <p role="status" aria-live="polite" className="mt-5 text-xs text-neutral-500">{message}</p>
      </section>
    </main>
  );
}
