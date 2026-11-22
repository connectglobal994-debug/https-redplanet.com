'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function AccountPage(){
  const [mode,setMode]=useState<'signin'|'signup'>('signin');
  const [fullName,setFullName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[signedIn,setSignedIn]=useState(false);
  useEffect(()=>{fetch('/api/account/session').then(r=>r.json()).then(d=>setSignedIn(Boolean(d.authenticated))).catch(()=>undefined);},[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setStatus('');
    try{
      const response=await fetch(mode==='signin'?'/api/account/session':'/api/account/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,fullName})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Account request failed.');
      if(mode==='signup'&&data.confirmationRequired){setStatus(data.message);return;}
      setSignedIn(true);setStatus(mode==='signin'?'You are signed in.':'Your account is ready.');
    }catch(error){setStatus(error instanceof Error?error.message:'Account request failed.');}
    finally{setBusy(false);}
  }
  async function logout(){await fetch('/api/account/session',{method:'DELETE'});setSignedIn(false);setStatus('You have signed out.');}
  return <main className="min-h-screen bg-obsidian px-5 py-16 text-white"><section className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-7">
    <p className="text-xs uppercase tracking-[0.25em] text-neonCyan">Red Planet Account</p><h1 className="mt-3 text-3xl font-semibold">{signedIn?'Account connected':mode==='signin'?'Welcome back':'Create your account'}</h1>
    {signedIn?<div className="mt-6 space-y-4"><p className="text-sm text-neutral-300">Your secure account session is active.</p><a href="/career/profile" className="block rounded-xl bg-marsRed px-5 py-3 text-center text-sm font-semibold">Open CV builder</a><button onClick={logout} className="w-full rounded-xl border border-white/15 px-5 py-3 text-sm">Sign out</button></div>:<form onSubmit={submit} className="mt-6 space-y-4">
      {mode==='signup'&&<label className="block text-xs text-neutral-400">Full name<input required minLength={2} value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>}
      <label className="block text-xs text-neutral-400">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="block text-xs text-neutral-400">Password<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <button disabled={busy} className="w-full rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold disabled:opacity-50">{busy?'Please wait…':mode==='signin'?'Sign in':'Create account'}</button>
      <button type="button" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setStatus('');}} className="w-full text-sm text-neonCyan">{mode==='signin'?'New to Red Planet? Create an account':'Already registered? Sign in'}</button>
      <p role="status" className="text-sm text-neutral-400">{status}</p>
    </form>}
  </section></main>;
}
