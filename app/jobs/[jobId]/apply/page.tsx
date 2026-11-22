'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ApplyForJobPage(){
  const params=useParams<{jobId:string}>();
  const [coverLetter,setCoverLetter]=useState('');
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setStatus('');
    try{
      const response=await fetch(`/api/jobs/${params.jobId}/apply`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coverLetter})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Application could not be submitted.');
      setStatus('Your application has been submitted successfully.');
    }catch(error){setStatus(error instanceof Error?error.message:'Application could not be submitted.');}
    finally{setBusy(false);}
  }
  return <main className="min-h-screen bg-obsidian px-5 py-14 text-white"><section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
    <p className="text-xs uppercase tracking-[0.25em] text-neonCyan">Red Planet Careers</p><h1 className="mt-3 text-3xl font-semibold">Submit your application</h1>
    <p className="mt-3 text-sm text-neutral-400">Your saved primary CV will be attached as a snapshot. Sign in and complete your CV before submitting.</p>
    <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-xs text-neutral-400">Cover letter (optional)<textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} maxLength={5000} rows={8} placeholder="Tell the employer why you are a good fit." className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <button disabled={busy} className="rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold disabled:opacity-50">{busy?'Submitting…':'Submit application'}</button>
      <p role="status" className="text-sm text-neutral-300">{status}</p>
    </form>
    <a href="/career/profile" className="mt-5 inline-block text-sm text-neonCyan underline">Review or update my CV</a>
  </section></main>;
}
