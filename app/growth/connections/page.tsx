'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Platform = { platform: string; display_name: string; integration_status: string; supports_publishing: boolean; supports_inbox: boolean; notes: string };
type Account = { id: string; platform: string; account_label: string; status: string; connected_at: string | null; scopes: string[] };
type QueueItem = { id: string; caption: string; scheduled_at: string | null; status: string; created_at: string; last_error?: string | null; channel: { platform: string; account_label: string } | null };

const statusLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const field = 'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-neonCyan';

export default function SocialConnectionsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [channelId, setChannelId] = useState('');
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [message, setMessage] = useState('Loading social platform status…');
  const [signedIn, setSignedIn] = useState(false);
  const [saving, setSaving] = useState(false);

  const connectedAccounts = useMemo(() => accounts.filter((account) => account.status === 'connected'), [accounts]);

  async function refresh() {
    const catalogResponse = await fetch('/api/social/platforms', { cache: 'no-store' });
    const catalog = await catalogResponse.json();
    if (!catalogResponse.ok) throw new Error(catalog.error || 'Could not load provider catalog.');
    setPlatforms(Array.isArray(catalog.platforms) ? catalog.platforms : []);

    const session = await fetch('/api/account/session', { cache: 'no-store' }).then((r) => r.json());
    if (!session.authenticated) {
      setSignedIn(false);
      setMessage('Provider availability is visible. Sign in to view your connected accounts and publishing queue.');
      return;
    }
    setSignedIn(true);
    const [connectionResponse, queueResponse] = await Promise.all([
      fetch('/api/social/connections', { cache: 'no-store' }),
      fetch('/api/social/queue', { cache: 'no-store' }),
    ]);
    const connectionData = await connectionResponse.json();
    const queueData = await queueResponse.json();
    if (!connectionResponse.ok) throw new Error(connectionData.error || 'Could not load connected accounts.');
    if (!queueResponse.ok) throw new Error(queueData.error || 'Could not load the publishing queue.');
    setAccounts(Array.isArray(connectionData.accounts) ? connectionData.accounts : []);
    setQueue(Array.isArray(queueData.queue) ? queueData.queue : []);
    setMessage('Social account and publishing status loaded.');
  }

  useEffect(() => {
    let cancelled = false;
    refresh().catch((error: unknown) => { if (!cancelled) setMessage(error instanceof Error ? error.message : 'Social services are unavailable.'); });
    return () => { cancelled = true; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/social/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, caption, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Content could not be submitted.');
      setCaption('');
      setScheduledAt('');
      await refresh();
      setMessage(data.message || 'Content submitted for approval.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Content could not be submitted.'); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-obsidian px-5 py-12 text-white"><section className="mx-auto max-w-7xl">
    <p className="text-xs uppercase tracking-[0.3em] text-neonCyan">Red Planet · Growth Studio</p>
    <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Social command desk.</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">See which official integrations are ready, review connected accounts and submit content into an approval queue. Provider publishing and inbox sync remain disabled until credentials, permissions and verified workers are configured.</p>

    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-2xl font-semibold">{platforms.length}</p><p className="mt-1 text-xs text-neutral-500">Listed providers</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-2xl font-semibold">{connectedAccounts.length}</p><p className="mt-1 text-xs text-neutral-500">Connected accounts</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-2xl font-semibold">{queue.length}</p><p className="mt-1 text-xs text-neutral-500">Items in approval queue</p></div>
    </section>

    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-neonCyan">Provider registry</p><h2 className="mt-1 text-2xl font-semibold">Connection availability</h2></div><span className="text-xs text-neutral-500">Official APIs only · no password collection</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => <article key={platform.platform} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{platform.display_name}</h3><span className="rounded-full border border-amber-400/30 px-2.5 py-1 text-[10px] uppercase tracking-wider text-amber-200">{statusLabel(platform.integration_status)}</span></div>
          <p className="mt-3 text-sm leading-6 text-neutral-400">{platform.notes}</p>
          <div className="mt-4 flex gap-2 text-[10px] text-neutral-500"><span className={platform.supports_publishing ? 'text-emerald-300' : ''}>Publishing {platform.supports_publishing ? 'available' : 'not enabled'}</span><span>·</span><span className={platform.supports_inbox ? 'text-emerald-300' : ''}>Inbox {platform.supports_inbox ? 'available' : 'not enabled'}</span></div>
        </article>)}
        {platforms.length === 0 && <p className="text-sm text-neutral-500">The provider catalog will appear after the unified platform migration is applied.</p>}
      </div>
    </section>

    {!signedIn && <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">Sign in to manage your social accounts and content queue. <a href="/account" className="ml-1 underline">Open account</a></div>}
    {signedIn && <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-semibold">Connected accounts</h2>
        <div className="mt-4 space-y-3">
          {accounts.map((account) => <article key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4"><div><p className="text-sm font-semibold">{account.account_label}</p><p className="mt-1 text-xs text-neutral-500">{statusLabel(account.platform)} · {account.scopes.length} approved scopes</p></div><span className="text-[10px] uppercase tracking-widest text-neutral-400">{statusLabel(account.status)}</span></article>)}
          {accounts.length === 0 && <p className="py-4 text-sm text-neutral-500">No social accounts are connected yet. Complete the provider developer setup and OAuth review before enabling account connections.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-semibold">Submit content for approval</h2>
        <p className="mt-2 text-xs leading-5 text-neutral-500">Only verified connected accounts can receive a content draft. Submitting does not publish it.</p>
        {connectedAccounts.length > 0 ? <form onSubmit={submit} className="mt-4 space-y-4">
          <label className="block text-xs text-neutral-400">Destination account<select required value={channelId} onChange={(e) => setChannelId(e.target.value)} className={field}><option value="">Choose account</option>{connectedAccounts.map((account) => <option key={account.id} value={account.id}>{account.account_label} · {statusLabel(account.platform)}</option>)}</select></label>
          <label className="block text-xs text-neutral-400">Caption / message<textarea required maxLength={5000} rows={5} value={caption} onChange={(e) => setCaption(e.target.value)} className={field} placeholder="Write the approved message or caption…" /></label>
          <label className="block text-xs text-neutral-400">Requested publish time (optional)<input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={field} /></label>
          <button disabled={saving} className="rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold disabled:opacity-50">{saving ? 'Submitting…' : 'Submit for approval'}</button>
        </form> : <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm text-neutral-500">The content approval queue becomes available when an account has completed official provider authorization.</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
        <h2 className="text-xl font-semibold">Publishing approval queue</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {queue.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{item.channel?.account_label || 'Social account'}</p><span className="text-[10px] uppercase tracking-widest text-neonCyan">{statusLabel(item.status)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{item.caption}</p>{item.scheduled_at && <p className="mt-2 text-xs text-neutral-500">Requested: {new Date(item.scheduled_at).toLocaleString()}</p>}{item.last_error && <p className="mt-2 text-xs text-rose-300">{item.last_error}</p>}</article>)}
          {queue.length === 0 && <p className="text-sm text-neutral-500">No content is waiting in your approval queue.</p>}
        </div>
      </section>
    </div>}
    <p role="status" aria-live="polite" className="mt-6 text-xs text-neutral-500">{message}</p>
  </section></main>;
}
