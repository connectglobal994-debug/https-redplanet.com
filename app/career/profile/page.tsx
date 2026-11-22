'use client';

import { FormEvent, useEffect, useState } from 'react';

type Experience = { role: string; company: string; dates: string; details: string };
type Education = { qualification: string; institution: string; dates: string };
type ResumeContent = { summary: string; experience: Experience[]; education: Education[]; certifications: string[] };
type Profile = { full_name?: string; headline?: string; location_text?: string; country_code?: string; phone?: string; bio?: string; linkedin_url?: string; portfolio_url?: string; skills?: string[] };
const emptyResume: ResumeContent = { summary: '', experience: [], education: [], certifications: [] };

export default function CareerProfilePage() {
  const [fullName,setFullName]=useState(''),[headline,setHeadline]=useState(''),[location,setLocation]=useState(''),[countryCode,setCountryCode]=useState('KE'),[phone,setPhone]=useState(''),[bio,setBio]=useState(''),[linkedinUrl,setLinkedinUrl]=useState(''),[portfolioUrl,setPortfolioUrl]=useState(''),[skillsText,setSkillsText]=useState('');
  const [resume,setResume]=useState<ResumeContent>(emptyResume);
  const [status,setStatus]=useState('Loading your account…'),[saving,setSaving]=useState(false),[authenticated,setAuthenticated]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    fetch('/api/account/session').then(r=>r.json()).then(async session=>{
      if(cancelled)return;
      if(!session.authenticated){setStatus('Sign in to your Red Planet account to create and save your CV.');return;}
      setAuthenticated(true);
      const response=await fetch('/api/candidate/resume');
      const data=await response.json();
      if(cancelled)return;
      if(response.ok&&data.profile){
        const p=data.profile as Profile;
        setFullName(p.full_name||'');setHeadline(p.headline||'');setLocation(p.location_text||'');setCountryCode(p.country_code||'KE');setPhone(p.phone||'');setBio(p.bio||'');setLinkedinUrl(p.linkedin_url||'');setPortfolioUrl(p.portfolio_url||'');setSkillsText((p.skills||[]).join(', '));
        setResume({...emptyResume,...(data.resume?.content||{})});
        setStatus('Your saved CV is ready to edit.');
      }else if(response.ok){setStatus('Your profile is ready to create.');}
      else setStatus(data.error||'Could not load your CV.');
    }).catch(()=>{if(!cancelled)setStatus('Could not check your account. Try again.');});
    return()=>{cancelled=true;};
  },[]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!authenticated){setStatus('Please sign in before saving your CV.');return;}
    setSaving(true);setStatus('');
    try{
      const response=await fetch('/api/candidate/resume',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        fullName,headline,location,countryCode,phone,bio,linkedinUrl,portfolioUrl,
        skills:skillsText.split(',').map(v=>v.trim()).filter(Boolean),resumeTitle:'Primary CV',resume
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'CV save failed.');
      setStatus('Your CV has been saved securely.');
    }catch(error){setStatus(error instanceof Error?error.message:'CV save failed.');}
    finally{setSaving(false);}
  }

  return <main className="min-h-screen bg-obsidian px-5 py-12 text-white"><section className="mx-auto max-w-4xl">
    <p className="text-xs uppercase tracking-[0.25em] text-neonCyan">Red Planet Careers</p>
    <h1 className="mt-3 text-4xl font-semibold">Build your professional profile.</h1>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Create a reusable CV for remote, local and international opportunities. Your profile remains private by default.</p>
    {!authenticated&&<div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">{status} <a href="/account" className="ml-1 underline">Open account sign-in</a></div>}
    <form onSubmit={save} className="mt-8 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-semibold">Personal information</h2><div className="mt-4 grid gap-4 md:grid-cols-2">
        {([['Full name',fullName,setFullName],['Professional headline',headline,setHeadline],['Location',location,setLocation],['Country code',countryCode,setCountryCode],['Phone',phone,setPhone],['LinkedIn URL',linkedinUrl,setLinkedinUrl],['Portfolio URL',portfolioUrl,setPortfolioUrl],['Skills (comma separated)',skillsText,setSkillsText]] as const).map(([label,value,setter])=><label key={label} className="text-xs text-neutral-400">{label}<input value={value} onChange={e=>setter(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>)}
      </div><label className="mt-4 block text-xs text-neutral-400">Professional biography<textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label></section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-semibold">CV summary</h2><textarea value={resume.summary} onChange={e=>setResume({...resume,summary:e.target.value})} rows={5} placeholder="Summarize your professional experience and strengths." className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Work experience</h2><button type="button" onClick={()=>setResume({...resume,experience:[...resume.experience,{role:'',company:'',dates:'',details:''}]})} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Add experience</button></div><div className="mt-4 space-y-4">{resume.experience.map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-2">{(['role','company','dates'] as const).map(key=><input key={key} aria-label={key} placeholder={key==='role'?'Job title':key==='company'?'Employer':'Dates'} value={item[key]} onChange={e=>setResume({...resume,experience:resume.experience.map((v,i)=>i===index?{...v,[key]:e.target.value}:v)})} className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm"/>)}<textarea aria-label="Responsibilities" placeholder="Achievements and responsibilities" value={item.details} onChange={e=>setResume({...resume,experience:resume.experience.map((v,i)=>i===index?{...v,details:e.target.value}:v)})} className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm md:col-span-2"/><button type="button" onClick={()=>setResume({...resume,experience:resume.experience.filter((_,i)=>i!==index)})} className="text-left text-xs text-red-300">Remove experience</button></div>)}</div></section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Education</h2><button type="button" onClick={()=>setResume({...resume,education:[...resume.education,{qualification:'',institution:'',dates:''}]})} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Add education</button></div><div className="mt-4 space-y-3">{resume.education.map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-3">{(['qualification','institution','dates'] as const).map(key=><input key={key} aria-label={key} placeholder={key==='qualification'?'Qualification':key==='institution'?'Institution':'Dates'} value={item[key]} onChange={e=>setResume({...resume,education:resume.education.map((v,i)=>i===index?{...v,[key]:e.target.value}:v)})} className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm"/>)}<button type="button" onClick={()=>setResume({...resume,education:resume.education.filter((_,i)=>i!==index)})} className="text-left text-xs text-red-300">Remove education</button></div>)}</div></section>
      <button disabled={saving||!authenticated} className="rounded-xl bg-marsRed px-6 py-3 text-sm font-semibold disabled:opacity-50">{saving?'Saving…':'Save CV'}</button><p role="status" className="text-sm text-neutral-400">{status}</p>
    </form>
  </section></main>;
}
