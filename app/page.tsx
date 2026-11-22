import Link from 'next/link';
import Mars3DHero from '@/components/Mars3DHero';

const portals = [
  { number: '01', title: 'Red Planet Music', detail: 'Original releases, listening, artist submissions and studio services.', href: '/music', label: 'Explore music' },
  { number: '02', title: 'Listen', detail: 'Discover the Red Planet catalogue and music delivery experience.', href: '/listen.html', label: 'Open listening' },
  { number: '03', title: 'Red Planet TV', detail: 'Editorial, artist stories, culture, technology and broadcast programming.', href: '/tv', label: 'Explore TV' },
  { number: '04', title: 'AI Studio', detail: 'AI assistance and creative tools with clear human review and configuration boundaries.', href: '/ai', label: 'Open AI Studio' },
  { number: '05', title: 'Growth Studio', detail: 'Marketing services, content planning, social account connections and customer-care workflows.', href: '/growth', label: 'Explore growth' },
  { number: '06', title: 'Artists & Collaborations', detail: 'Connect artists, producers, labels, brands and creative partners.', href: '/collaborations.html', label: 'Collaborate' },
  { number: '07', title: 'AI Academy & Team OS', detail: 'Team learning, approved training resources, tasks and operating workflows.', href: '/academy', label: 'Open Academy' },
  { number: '08', title: 'Research & Jobs', detail: 'Research projects, source-backed work, employer profiles and applications are being added to the shared backend.', href: '/platforms', label: 'Explore platform build' },
  { number: '09', title: 'Membership & Account', detail: 'Account access, memberships and payment options as provider configuration is completed.', href: '/account.html', label: 'Open account' },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-5 py-8 sm:px-8 sm:py-12">
      <Mars3DHero />

      <section id="universe" className="space-y-7">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-marsRed">The Red Planet universe</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">One connected platform for creative work.</h2>
          <p className="mt-4 text-sm leading-7 text-neutral-300 sm:text-base">Red Planet brings together the original music and media website with the newer portal architecture. Artists, teams, partners and members should be able to move between services through one consistent experience and secure account foundation.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => (
            <article key={portal.number} className="flex min-h-56 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-marsRed/50 hover:bg-white/[0.055]">
              <span className="font-mono text-xs font-bold tracking-widest text-marsRed">{portal.number} / RED PLANET PORTAL</span>
              <h3 className="mt-4 text-xl font-black uppercase">{portal.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-neutral-400">{portal.detail}</p>
              <Link href={portal.href} className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-neonCyan hover:underline">{portal.label} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-marsRed/15 via-obsidian to-deepSpace p-7 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-marsRed">Connected marketing</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">Bring every approved channel into one workspace.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300">The platform foundation is being prepared for Instagram, Facebook, WhatsApp Business, TikTok, YouTube, X, LinkedIn, Snapchat, Pinterest, Telegram, Discord, Reddit, Threads, Mastodon and Bluesky. Each connection must use its official API, account-owner consent and provider approval where required.</p>
          <Link href="/platforms" className="mt-6 inline-flex rounded-xl bg-marsRed px-5 py-3 text-sm font-bold text-white hover:bg-marsRed/80">Explore platform connections</Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">Build status</p>
          <ul className="mt-4 space-y-3 text-sm text-neutral-200">
            <li>• Original portal pages and admin desks restored into the unified app assets</li>
            <li>• Shared Supabase schema extended for research, jobs and social workflows</li>
            <li>• Provider OAuth, webhooks, inbox sync and scheduled publishing still require setup and testing</li>
            <li>• No social account is shown as connected until authorization succeeds</li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-marsRed">Artists, labels and partners</p>
          <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Create with Red Planet.</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">Explore the music catalogue, submit a collaboration enquiry, or create an account. Backend features remain clearly labelled where provider setup or review is still required.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/music" className="rounded-xl bg-marsRed px-5 py-3 text-sm font-bold text-white">Explore music</Link>
          <Link href="/collaborations.html" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Collaborate</Link>
          <Link href="/account.html" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Account</Link>
        </div>
      </section>
    </main>
  );
}
