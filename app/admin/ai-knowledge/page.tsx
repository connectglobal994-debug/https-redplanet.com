'use client';

import { FormEvent, useEffect, useState } from 'react';

type Item={id:string;title:string;category:string;status:string;source_name?:string|null;updated_at:string};

export default function AIKnowledgeAdminPage(){
  const [items,setItems]=useState<Item[]>([]);
  const [title,setTitle]=useState(''),[category,setCategory]=useState('General'),[body,setBody]=useState(''),[tags,setTags]=useState(''),[sourceName,setSourceName]=useState(''),[sourceUrl,setSourceUrl]=useState(''),[rightsBasis,setRightsBasis]=useState('');
  const [rightsConfirmed,setRightsConfirmed]=useState(false),[publish,setPublish]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  async function load(){
    const response=await fetch('/api/ai/knowledge');
    const data=await response.json();
    if(response.ok)setItems(Array.isArray(data.items)?data.items:[]);
    else setStatus(data.error||'Could not load the knowledge library.');
  }
  useEffect(()=>{void load();},[]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setStatus('');
    try{
      const response=await fetch('/api/ai/knowledge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        title,category,body,tags:tags.split(',').map(v=>v.trim()).filter(Boolean),sourceName,sourceUrl,rightsBasis,rightsConfirmed,status:publish?'published':'draft',sourceType:sourceUrl?'approved_source':'manual'
      })});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not save.');
      setTitle('');setBody('');setTags('');setSourceName('');setSourceUrl('');setRightsBasis('');setRightsConfirmed(false);setPublish(false);
      setStatus('Knowledge item saved. Published items can be retrieved by Red Planet AI.');await load();
    }catch(error){setStatus(error instanceof Error?error.message:'Could not save.');}
    finally{setBusy(false);}
  }
  return <main className="min-h-screen bg-obsidian px-5 py-12 text-white"><section className="mx-auto max-w-5xl">
    <p className="text-xs uppercase tracking-[0.25em] text-neonCyan">Red Planet AI · Admin</p><h1 className="mt-3 text-4xl font-semibold">Knowledge & training library</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">Add approved company knowledge, operating procedures, training material and licensed reference content. Published material is retrieved as context when people ask relevant questions.</p>
    <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">This is retrieval-based knowledge grounding, not automatic model-weight training. The AI can use published material in answers; it does not silently retrain itself or treat uploaded text as system instructions.</div>
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
      <label className="text-xs text-neutral-400">Document title<input required minLength={3} value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="text-xs text-neutral-400">Category<input value={category} onChange={e=>setCategory(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="text-xs text-neutral-400 md:col-span-2">Knowledge content<textarea required minLength={30} maxLength={30000} rows={9} value={body} onChange={e=>setBody(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="text-xs text-neutral-400">Tags (comma separated)<input value={tags} onChange={e=>setTags(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="text-xs text-neutral-400">Source / publisher<input value={sourceName} onChange={e=>setSourceName(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="text-xs text-neutral-400 md:col-span-2">Source URL (optional, HTTPS)<input type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="text-xs text-neutral-400 md:col-span-2">Rights / permission basis<textarea required value={rightsBasis} onChange={e=>setRightsBasis(e.target.value)} rows={2} placeholder="For example: original Red Planet material; licensed documentation; public-domain source." className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"/></label>
      <label className="flex items-start gap-2 text-xs text-neutral-300 md:col-span-2"><input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)} className="mt-0.5"/> I confirm Red Planet has permission to store and use this material.</label>
      <label className="flex items-center gap-2 text-xs text-neutral-300"><input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)}/> Publish for AI retrieval</label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-4"><button disabled={busy} className="rounded-xl bg-marsRed px-5 py-3 text-sm font-semibold disabled:opacity-50">{busy?'Saving…':'Save knowledge item'}</button><p role="status" className="text-sm text-neutral-400">{status}</p></div>
    </form>
    <section className="mt-10"><h2 className="text-xl font-semibold">Saved knowledge</h2><div className="mt-4 space-y-3">{items.map(item=><article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4"><div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs text-neutral-500">{item.category} · {item.source_name||'Red Planet'} · {new Date(item.updated_at).toLocaleDateString()}</p></div><span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase">{item.status}</span></article>)}{items.length===0&&<p className="text-sm text-neutral-500">No knowledge items found, or administrator access is not configured.</p>}</div></section>
  </section></main>;
}
