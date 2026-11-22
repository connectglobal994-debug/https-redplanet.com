// Exposes only the approved public plan fields from a server-side catalog.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":Deno.env.get("ALLOWED_ORIGIN")??"","Access-Control-Allow-Headers":"authorization, apikey, x-client-info, content-type","Access-Control-Allow-Methods":"GET, OPTIONS"};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
type Plan={amount_minor:number;currency:string;period_days:number};
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="GET")return reply({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),catalogSecret=Deno.env.get("FLW_PLAN_CATALOG");
 if(!url||!anon||!catalogSecret||!Deno.env.get("ALLOWED_ORIGIN"))return reply({error:"Plans are not configured"},503);
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return reply({error:"Sign in required"},401);
 const client=createClient(url,anon,{global:{headers:{Authorization:auth}}});
 const {data:{user},error}=await client.auth.getUser();if(error||!user)return reply({error:"Invalid session"},401);
 let catalog:Record<string,Plan>;try{catalog=JSON.parse(catalogSecret);}catch{return reply({error:"Plan catalog is invalid"},503);}
 const plans=Object.entries(catalog).filter(([code,p])=>/^[a-z0-9_-]{2,40}$/i.test(code)&&Number.isSafeInteger(p?.amount_minor)&&p.amount_minor>0&&Number.isInteger(p.period_days)&&p.period_days>=1&&p.period_days<=3660&&/^[A-Z]{3}$/.test(p.currency)).map(([code,p])=>({code,amount_minor:p.amount_minor,currency:p.currency,period_days:p.period_days}));
 return reply({plans});
});
