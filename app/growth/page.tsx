import Link from 'next/link';

const services = [
  { number: '01', title: 'Social media growth', description: 'Strategy, content planning, publishing workflows and audience analytics for Red Planet and client-owned accounts.' },
  { number: '02', title: 'Content studio', description: 'Short-form video, campaign creative, captions, brand storytelling and platform-ready assets.' },
  { number: '03', title: 'Community & customer care', description: 'A shared inbox concept for WhatsApp and social enquiries, with AI-assisted replies and human handoff.' },
  { number: '04', title: 'Lead generation & partnerships', description: 'Transparent outreach, opt-in lead capture, follow-up pipelines and collaboration management.' },
];
const channels = [
  ['WhatsApp', 'Direct chat and, after provider setup, an approved business messaging inbox.'],
  ['Instagram', 'Professional account insights, content publishing and message workflows where Meta permissions allow.'],
  ['Facebook', 'Page publishing, comments and campaign reporting through Meta integrations.'],
  ['TikTok', 'Creator/business account workflows subject to TikTok API access and review.'],
  ['YouTube', 'Channel publishing, video metadata and analytics through Google OAuth.'],
  ['LinkedIn', 'Company-page content and lead workflows where API permissions are granted.'],
  ['X', 'Publishing and account analytics subject to an approved developer app.'],
  ['Telegram', 'Bot-based support and community notifications after bot setup.'],
];
export default function GrowthPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '254794190600';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Red Planet, I would like to discuss social media growth and marketing services.')}`;
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-6 py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-marsRed/20 via-obsidian to-deepSpace p-8 sm:p-14">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-marsRed-bright">Red Planet Growth Studio</p>
        <h1 className="max-w-4xl text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">Build an audience. Grow a brand. Turn attention into opportunity.</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">A digital growth and marketing service for creators, businesses and organisations. We help plan content, manage channels, respond to enquiries and measure real results — alongside Red Planet Music, TV and creator services.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-emerald-400">Chat with us on WhatsApp ↗</a>
          <a href="mailto:redplanetcodes@gmail.com?subject=Red%20Planet%20Growth%20Studio" className="rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">Email the team</a>
          <Link href="/members" className="rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">Join Red Planet</Link>
        </div>
        <p className="mt-5 text-xs text-neutral-400">WhatsApp contact can be changed with NEXT_PUBLIC_WHATSAPP_NUMBER in the deployment environment.</p>
      </section>
      <section className="space-y-5">
        <div><p className="font-mono text-xs uppercase tracking-widest text-neonCyan">What we do</p><h2 className="mt-2 text-2xl font-black uppercase">Growth services</h2></div>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => <article key={service.number} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><p className="font-mono text-xs text-marsRed">{service.number} / SERVICE</p><h3 className="mt-3 text-lg font-bold">{service.title}</h3><p className="mt-2 text-sm leading-6 text-neutral-400">{service.description}</p></article>)}
        </div>
      </section>
      <section className="space-y-5">
        <div><p className="font-mono text-xs uppercase tracking-widest text-neonCyan">One connected workspace</p><h2 className="mt-2 text-2xl font-black uppercase">Channels we plan to support</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">Connect your own accounts securely. Each platform requires its own official authorization; connecting one account never gives Red Planet access to another client’s account.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(([name, description]) => <article key={name} className="rounded-xl border border-white/10 bg-deepSpace/70 p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-bold">{name}</h3><span className="rounded-full border border-amber-400/30 px-2 py-1 font-mono text-[9px] uppercase text-amber-300">Setup required</span></div><p className="mt-3 text-xs leading-5 text-neutral-400">{description}</p></article>)}
        </div>
      </section>

      <section className="space-y-5">
        <div><p className="font-mono text-xs uppercase tracking-widest text-neonCyan">Pilot offers · USD</p><h2 className="mt-2 text-2xl font-black uppercase">Simple starting plans</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">These are proposed pilot prices carried forward from the existing Red Planet implementation roadmap. They are not active checkout prices until the included services, taxes, provider fees, cancellation and refund terms are confirmed.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Community', price: 'Free', detail: 'Account access, public catalogue and community updates.' },
            { name: 'Creator', price: '$5 / month', detail: 'Creator profile, limited project tools and submission tracking.' },
            { name: 'Artist Plus', price: '$15 / month', detail: 'Expanded artist workspace, release planning and defined support allowance.' },
            { name: 'Label / Studio', price: 'From $49 / month', detail: 'Multi-member workspace and catalogue administration, scoped by agreement.' },
            { name: 'Music submission review', price: '$10 one-time', detail: 'One defined review and written feedback; no guarantee of acceptance or promotion.' },
            { name: 'AI usage', price: 'Usage-based', detail: 'Small included allowance with disclosed top-ups and usage limits.' },
          ].map((plan) => <article key={plan.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h3 className="font-bold">{plan.name}</h3><p className="mt-3 text-2xl font-black text-white">{plan.price}</p><p className="mt-2 text-xs leading-5 text-neutral-400">{plan.detail}</p></article>)}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <p className="font-mono text-xs uppercase tracking-widest text-neonCyan">Client growth portal</p><h2 className="mt-2 text-2xl font-black uppercase">Your accounts. Your data. Your results.</h2>
          <ul className="mt-5 space-y-3 text-sm text-neutral-300">
            <li>• Connect and disconnect client-owned social accounts with OAuth.</li>
            <li>• Plan and approve posts using a shared content calendar.</li>
            <li>• Use AI to draft captions and suggest replies, with a human review option.</li>
            <li>• Route new enquiries into a CRM and assign follow-ups.</li>
            <li>• Review real reach, engagement, leads and campaign performance.</li>
          </ul>
          <p className="mt-5 text-xs leading-5 text-neutral-500">The public service page is available now. Account authorization, publishing, inbox sync, CRM persistence and analytics become active only after their provider apps, permissions, backend jobs and database are configured and tested.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-deepSpace to-black p-7">
          <p className="font-mono text-xs uppercase tracking-widest text-marsRed">Our standard</p><h2 className="mt-2 text-2xl font-black uppercase">Real growth, built on trust.</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-300">We use authentic content, permission-based messaging and transparent reporting. We do not sell fake followers, impersonate customers, manufacture testimonials or coordinate fake engagement. Automated replies identify themselves appropriately and hand sensitive or uncertain conversations to a person.</p>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400">Start a conversation ↗</a>
        </article>
      </section>
    </main>
  );
}
