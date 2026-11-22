import Link from 'next/link';

export const metadata = {
  title: 'Jobs | Red Planet',
  description: 'Discover remote, hybrid and local opportunities through Red Planet.',
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-obsidian text-white px-5 py-16">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neonCyan">Red Planet Careers</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Find your next opportunity.</h1>
        <p className="mt-5 max-w-2xl text-neutral-300">
          Explore remote, hybrid and in-person work, internships, freelance projects and local opportunities.
          Listings are reviewed before publication.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/jobs/search" className="rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
            Explore jobs
          </Link>
          <Link href="/members" className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white hover:bg-white/5">
            Join Red Planet
          </Link>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ['Remote work', 'Work with teams and employers across borders.'],
            ['Local opportunities', 'Discover in-person roles near your community.'],
            ['Freelance & early careers', 'Find contract work, internships and entry-level roles.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p>
            </article>
          ))}
        </div>
        <p className="mt-12 text-xs text-neutral-500">Employers and external sources are identified on each listing. Always verify an opportunity and never pay to apply.</p>
      </section>
    </main>
  );
}
