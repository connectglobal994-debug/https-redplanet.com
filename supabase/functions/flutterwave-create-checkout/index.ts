// Creates a Flutterwave hosted checkout. The server-side plan catalog controls all prices.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origin=Deno.env.get("ALLOWED_ORIGIN")??"";
const cors={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, apikey, x-client-info, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
type Plan={amount_minor:number;currency:string;period_days:number};
function minorToMajor(minor:number,currency:string){
 const digits=new Intl.NumberFormat("en",{style:"currency",currency}).resolvedOptions().maximumFractionDigits;
 const value=BigInt(minor),scale=10n**BigInt(digits),whole=value/scale;
 return digits===0?whole.toString():whole.toString()+"."+(value%scale).toString().padStart(digits,"0");
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 const secret=Deno.env.get("FLW_SECRET_KEY"),catalogSecret=Deno.env.get("FLW_PLAN_CATALOG"),site=Deno.env.get("RP_SITE_URL");
 if(!origin||!url||!anon||!service||!secret||!catalogSecret||!site)return reply({error:"Flutterwave checkout is not configured"},503);
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return reply({error:"Sign in required"},401);
 const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}});
 const {data:{user},error:authError}=await userClient.auth.getUser();
 if(authError||!user)return reply({error:"Invalid session"},401);
 if(!user.email)return reply({error:"A verified account email is required for checkout"},400);
 let body:Record<string,unknown>;try{body=await req.json();}catch{return reply({error:"Invalid JSON"},400);}
 const planCode=typeof body.plan_code==="string"?body.plan_code.trim():"";
 let catalog:Record<string,Plan>;try{catalog=JSON.parse(catalogSecret);}catch{return reply({error:"Plan catalog is invalid"},503);}
 const plan=catalog[planCode];
 if(!plan||!Number.isSafeInteger(plan.amount_minor)||plan.amount_minor<=0||!Number.isInteger(plan.period_days)||plan.period_days<1||plan.period_days>3660||typeof plan.currency!=="string"||!/^[A-Z]{3}$/.test(plan.currency))return reply({error:"Selected plan is unavailable"},400);
 let amount:string;try{amount=minorToMajor(plan.amount_minor,plan.currency);}catch{return reply({error:"Plan currency is unsupported"},503);}
 const db=createClient(url,service);
 const {data:payment,error:insertError}=await db.from("payment_records").insert({
  user_id:user.id,provider:"flutterwave",currency:plan.currency,amount_minor:plan.amount_minor,
  plan_code:planCode,membership_period_days:plan.period_days,status:"pending"
 }).select("id").single();
 if(insertError||!payment)return reply({error:"Could not create payment record"},500);
 const txRef=payment.id;
 let response:Response;
 try{
  response=await fetch("https://api.flutterwave.com/v3/payments",{method:"POST",headers:{
   Authorization:"Bearer "+secret,"Content-Type":"application/json","Accept":"application/json"
  },body:JSON.stringify({
   tx_ref:txRef,amount,currency:plan.currency,redirect_url:site.replace(/\/$/,"")+"/payments.html?flutterwave=return",
   customer:{email:user.email,name:user.user_metadata?.full_name||user.user_metadata?.name||user.email},
   customizations:{title:"Red Planet Membership",description:"Membership plan "+planCode}
  }),signal:AbortSignal.timeout(30000)});
 }catch{
  await db.from("payment_records").update({status:"failed"}).eq("id",payment.id);
  return reply({error:"Could not reach the hosted payment provider"},502);
 }
 const result=await response.json().catch(()=>({}));
 const link=result?.data?.link;
 if(!response.ok||result?.status!=="success"||typeof link!=="string"||!link.startsWith("https://checkout.flutterwave.com/")){
  await db.from("payment_records").update({status:"failed"}).eq("id",payment.id);
  return reply({error:"Flutterwave could not create a secure checkout link"},502);
 }
 const {error:saveError}=await db.from("payment_records").update({provider_order_id:txRef}).eq("id",payment.id);
 if(saveError)return reply({error:"Checkout link could not be linked to its payment record"},500);
 return reply({checkout_url:link,tx_ref:txRef});
});
