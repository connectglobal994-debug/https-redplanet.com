import Link from 'next/link';

const paths = [
  { title: 'Red Planet operating standards', detail: 'Mission, communication, team execution and documented procedures.' },
  { title: 'AI literacy and safe use', detail: 'Prompting, verification, privacy, limitations and human review.' },
  { title: 'Platform and product training', detail: 'Music, artist workflows, Growth Studio, TV, collaboration and member services.' },
  { title: 'Security and account protection', detail: 'Individual accounts, MFA, least privilege, phishing and incident reporting.' },
  { title: 'Research and delivery skills', detail: 'Source evaluation, citations, evidence, quality checks and handovers.' },
];

export default function AcademyPage() {
  return <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-6 py-12">
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-marsRed/20 via-obsidian to-deepSpace p-8 sm:p-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-marsRed-bright">Red Planet AI Academy</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-black uppercase sm:text-6xl">Train the people. Improve the intelligence.</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-300">A structured learning and knowledge workspace. Managers publish approved training resources; team members follow learning paths, record progress and ask the AI Teacher questions grounded in approved materials.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href="/team-portal.html" className="rounded-xl bg-marsRed px-5 py-3 text-sm font-bold text-white">Open Team OS & AI Teacher ↗</a>
        <Link href="/ai" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">Open Neural AI</Link>
      </div>
      <p className="mt-4 text-xs text-neutral-400">The original Supabase-backed Team OS and AI Teacher source have been restored. Live use still depends on applying migrations and deploying the Edge Function to the verified Supabase project.</p>
    </section>
    <section className="space-y-5"><div><p className="font-mono text-xs uppercase tracking-widest text-neonCyan">Learning paths</p><h2 className="mt-2 text-2xl font-black uppercase">Build capability step by step</h2></div>
      <div className="grid gap-4 md:grid-cols-2">{paths.map((path,index)=><article key={path.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><p className="font-mono text-xs text-marsRed">PATH {String(index+1).padStart(2,'0')}</p><h3 className="mt-3 font-bold">{path.title}</h3><p className="mt-2 text-sm leading-6 text-neutral-400">{path.detail}</p></article>)}</div>
    </section>
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-xl font-black uppercase">How training works</h2><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-300"><li>Administrators publish and maintain approved learning materials.</li><li>Team members sign in with their own verified accounts.</li><li>Progress is saved against the signed-in member.</li><li>The AI Teacher retrieves approved published resources to ground company-specific answers.</li><li>AI conversations do not silently retrain the underlying model; training materials are curated and versioned.</li></ol></section>
  </main>;
}
