'use client';

import { FormEvent, useEffect, useState } from 'react';

type ResumeContent = {
  summary: string;
  experience: { role: string; company: string; dates: string; details: string }[];
  education: { qualification: string; institution: string; dates: string }[];
  certifications: string[];
};

const emptyResume: ResumeContent = { summary: '', experience: [], education: [], certifications: [] };

export default function CareerProfilePage() {
  const [accessToken, setAccessToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [countryCode, setCountryCode] = useState('KE');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [resume, setResume] = useState<ResumeContent>(emptyResume);
  const [status, setStatus] = useState('Connect your Red Planet account to load or save your CV.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // The authenticated application shell should pass a real Supabase access token here.
    // No local/demo identity is fabricated when authentication is not connected.
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      setStatus('Account sign-in is not connected on this page yet. Your CV has not been saved.');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/api/candidate/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          fullName, headline, location, countryCode, phone, bio, linkedinUrl, portfolioUrl,
          skills: skillsText.split(',').map((skill) => skill.trim()).filter(Boolean),
          resumeTitle: 'Primary CV', resume,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'CV save failed.');
      setStatus('CV saved successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'CV save failed.');
    } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-obsidian px-5 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.25em] text-neonCyan">Red Planet Careers</p>
        <h1 className="mt-3 text-4xl font-semibold">Build your professional profile.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Create a reusable CV for remote, local and international opportunities. Your profile is private by default. You choose what to share with employers.</p>
        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">
          Account authentication is not yet connected to this page. The secure CV API is prepared, but saving is disabled until the real Red Planet sign-in session is wired in. No demo account or fake save is used.
        </div>
        <form onSubmit={save} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold">Personal information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ['Full name',fullName,setFullName],['Professional headline',headline,setHeadline],['Location',location,setLocation],['Country code',countryCode,setCountryCode],['Phone',phone,setPhone],['LinkedIn URL',linkedinUrl,setLinkedinUrl],['Portfolio URL',portfolioUrl,setPortfolioUrl],['Skills (comma separated)',skillsText,setSkillsText],
              ].map(([label,value,setter]) => (
                <label key={label as string} className="text-xs text-neutral-400">{label as string}
                  <input value={value as string} onChange={(e) => (setter as (value:string)=>void)(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-xs text-neutral-400">Professional biography
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold">CV summary</h2>
            <textarea value={resume.summary} onChange={(e) => setResume({...resume,summary:e.target.value})} rows={5} placeholder="Summarize your professional experience and strengths." className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Work experience</h2><button type="button" onClick={() => setResume({...resume,experience:[...resume.experience,{role:'',company:'',dates:'',details:''}]})} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Add experience</button></div>
            <div className="mt-4 space-y-4">
              {resume.experience.map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2">
                {(['role','company','dates'] as const).map((key)=><input key={key} aria-label={key} placeholder={key==='role'?'Job title':key==='company'?'Employer':'Dates'} value={item[key]} onChange={(e)=>setResume({...resume,experience:resume.experience.map((v,i)=>i===index?{...v,[key]:e.target.value}:v)})} className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm"/>)}
                <textarea aria-label="Responsibilities" placeholder="Achievements and responsibilities" value={item.details} onChange={(e)=>setResume({...resume,experience:resume.experience.map((v,i)=>i===index?{...v,details:e.target.value}:v)})} className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm md:col-span-2"/>
                <button type="button" onClick={()=>setResume({...resume,experience:resume.experience.filter((_,i)=>i!==index)})} className="text-left text-xs text-red-300">Remove experience</button>
              </div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Education</h2><button type="button" onClick={() => setResume({...resume,education:[...resume.education,{qualification:'',institution:'',dates:''}]})} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Add education</button></div>
            <div className="mt-4 space-y-3">{resume.education.map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-3">
              {(['qualification','institution','dates'] as const).map(key=><input key={key} aria-label={key} placeholder={key==='qualification'?'Qualification':key==='institution'?'Institution':'Dates'} value={item[key]} onChange={e=>setResume({...resume,education:resume.education.map((v,i)=>i===index?{...v,[key]:e.target.value}:v)})} className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm"/>)}
              <button type="button" onClick={()=>setResume({...resume,education:resume.education.filter((_,i)=>i!==index)})} className="text-left text-xs text-red-300">Remove education</button>
            </div>)}</div>
          </section>
          <button disabled={saving} className="rounded-xl bg-marsRed px-6 py-3 text-sm font-semibold disabled:opacity-50">{saving?'Saving…':'Save CV'}</button>
          <p role="status" className="text-sm text-neutral-400">{status}</p>
        </form>
      </section>
    </main>
  );
}
