import Link from 'next/link';

export const metadata = {
  title: 'Red Planet Living | Real Estate Development',
  description: 'Red Planet Living development vision, beginning in Kenya and expanding to Texas.',
};

const phases = [
  ['01', 'Research & site selection', 'Assess land title, zoning, infrastructure, demand, environmental conditions and access to services.'],
  ['02', 'Feasibility & design', 'Develop cost plans, concept designs, unit mix, construction approach and independent feasibility reviews.'],
  ['03', 'Approvals & financing', 'Complete legal due diligence, permits, professional reviews and properly documented funding arrangements.'],
  ['04', 'Construction & quality', 'Appoint qualified contractors, monitor milestones, verify materials and maintain independent quality controls.'],
  ['05', 'Property operations', 'Plan leasing, maintenance, resident support, safety and transparent long-term management.'],
];

export default function RealEstatePage() {
  return (
    <main className="min-h-screen bg-obsidian px-5 py-14 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neonCyan">Red Planet · Built Environment</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">A place to build what comes next.</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-300">
          Red Planet Living is the planned real-estate and residential development initiative within the wider Red Planet ecosystem. The initial focus is Kenya, with Texas as the intended United States base.
        </p>
        <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">Planning stage · No active property offering</p>
          <p className="mt-2 text-sm leading-6 text-neutral-300">No apartment units, land opportunities, prices, investment returns or funding offers are currently being advertised here. Project details will be published only after ownership, legal structure, due diligence, permits and feasibility have been verified.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-widest text-neonCyan">Africa headquarters</p>
            <h2 className="mt-3 text-2xl font-semibold">Kenya</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">The first market for Red Planet apartment development. Initial work should focus on local demand, land title verification, county planning requirements, infrastructure and construction feasibility.</p>
            <p className="mt-5 text-xs text-neutral-500">Target market · Initial research and feasibility</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-widest text-neonCyan">United States base</p>
            <h2 className="mt-3 text-2xl font-semibold">Texas, USA</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">The intended United States base for future expansion, subject to a separate review of local zoning, licensing, property law, taxes, financing and market conditions.</p>
            <p className="mt-5 text-xs text-neutral-500">Target market · Future expansion</p>
          </article>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Development framework</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-400">A disciplined path from an idea to professionally managed residential property.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-5">
            {phases.map(([number, title, description]) => (
              <article key={number} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <span className="text-xs font-bold text-neonCyan">{number}</span>
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-neutral-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Partnership and project enquiries</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">For early conversations with architects, engineers, land professionals, construction firms and potential collaborators, contact the existing Red Planet team. We will add a dedicated real-estate contact and verified company details when the business structure is confirmed.</p>
          <a href="mailto:redplanetcodes@gmail.com?subject=Red%20Planet%20Living%20Enquiry" className="mt-6 inline-flex rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold text-white hover:opacity-90">Contact Red Planet</a>
          <p className="mt-4 text-xs text-neutral-500">This contact is the existing website contact, not a dedicated property or investment office.</p>
        </section>
      </section>
    </main>
  );
}
