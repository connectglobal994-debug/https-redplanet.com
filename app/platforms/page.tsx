import Link from 'next/link';

const externalPlatforms = [
  ['WhatsApp Business','Messaging and customer support','Developer setup required'],
  ['Instagram','Publishing and audience management','Developer setup required'],
  ['Facebook Pages','Publishing and community management','Developer setup required'],
  ['TikTok','Short-form video publishing','Developer setup required'],
  ['YouTube','Video publishing and channel analytics','Developer setup required'],
  ['X','Posts and account workflows','Developer setup required'],
  ['LinkedIn','Professional and organization publishing','Developer setup required'],
  ['Snapchat','Public profile and media workflows','API eligibility to confirm'],
  ['Pinterest','Pins and content discovery','Developer setup required'],
  ['Telegram','Bot-based messaging and communities','Developer setup required'],
  ['Discord','Community servers and bot workflows','Developer setup required'],
  ['Reddit','Community publishing and moderation','API access to confirm'],
  ['Threads','Text and media publishing','Developer setup required'],
  ['Mastodon','Federated social publishing','Instance setup required'],
  ['Bluesky','Social publishing and account workflows','Integration approach to confirm'],
];

const nativePlatforms = [
  ['Red Planet Music','Music catalogue, artist submissions, studio and releases','/music'],
  ['Red Planet TV','Editorial, video and broadcast programming','/tv'],
  ['Red Planet AI Studio','AI assistance and approved creative workflows','/ai'],
  ['Growth Studio','Marketing services, content and customer-care workflows','/growth'],
  ['AI Academy','Team learning and approved training resources','/academy'],
  ['Research Portal','Saved research projects, sources and evidence','/platforms'],
  ['Jobs Portal','Employer profiles, listings and applications','/platforms'],
] as const;

export default function PlatformsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-5 py-12 sm:px-8">
      <header className="max-w-4xl">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-marsRed">Red Planet Connect</p>
        <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">One workspace. Every channel.</h1>
        <p className="mt-5 text-sm leading-7 text-neutral-300 sm:text-base">Connect approved external accounts and operate Red Planet’s own services from one platform. Account connections must use official provider authorization, approved permissions and secure server-side credentials. We will never ask users to hand over social passwords.</p>
      </header>

      <section className="space-y-5">
        <div><p className="font-mono text-xs uppercase tracking-widest text-neonCyan">External networks</p><h2 className="mt-2 text-2xl font-black uppercase">Social and messaging platforms</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {externalPlatforms.map(([name,detail,status]) => (
            <article key={name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3"><h3 className="font-bold">{name}</h3><span className="rounded-full border border-amber-400/30 px-2 py-1 text-[10px] text-amber-300">{status}</span></div>
              <p className="mt-3 text-sm leading-6 text-neutral-400">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div><p className="font-mono text-xs uppercase tracking-widest text-neonCyan">Red Planet native services</p><h2 className="mt-2 text-2xl font-black uppercase">Our own platforms</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">These are Red Planet products, not third-party social accounts. They share the same product identity and are being connected through common authentication, permissions, storage and service APIs.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nativePlatforms.map(([name,detail,href]) => (
            <article key={name} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5">
              <h3 className="font-bold">{name}</h3><p className="mt-3 text-sm leading-6 text-neutral-400">{detail}</p>
              <Link href={href} className="mt-4 inline-flex text-sm font-bold text-neonCyan hover:underline">Open workspace →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-black uppercase">Connection and automation rules</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-300">
          <li>Each account owner authorizes the connection; client accounts remain isolated by tenant.</li>
          <li>Tokens and refresh credentials stay server-side and can be revoked.</li>
          <li>Content is drafted first; publishing and automated replies follow approval, provider rules and opt-out preferences.</li>
          <li>Analytics are shown only when the provider API actually returns them.</li>
          <li>WhatsApp automation uses the WhatsApp Business Platform, not personal-account password access.</li>
        </ul>
        <p className="mt-5 text-xs leading-5 text-neutral-500">Backend registry and data structures have been added to the migration branch. OAuth applications, provider approvals, webhook endpoints, scheduled workers and live account connections still need credentials and end-to-end tests.</p>
      </section>
    </main>
  );
}
