// Captures a buyer-approved PayPal order after checking that it belongs to the signed-in user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "https://www.redplanet.com",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:corsHeaders});
const base=()=>Deno.env.get("PAYPAL_ENV")==="live"?"https://api-m.paypal.com":"https://api-m.sandbox.paypal.com";
async function tokenFor(url:string,id:string,secret:string){
 const response=await fetch(url+"/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+btoa(id+":"+secret),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials",signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error("PayPal authentication failed");
 const body=await response.json();if(typeof body.access_token!=="string")throw new Error("PayPal token missing");return body.access_token as string;
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 const id=Deno.env.get("PAYPAL_CLIENT_ID"),secret=Deno.env.get("PAYPAL_CLIENT_SECRET");
 if(!url||!anon||!service||!id||!secret)return reply({error:"Checkout is not configured"},503);
 const authorization=req.headers.get("Authorization");if(!authorization?.startsWith("Bearer "))return reply({error:"Sign in required"},401);
 const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
 const {data:{user},error:authError}=await userClient.auth.getUser();if(authError||!user)return reply({error:"Invalid session"},401);
 let body:Record<string,unknown>;try{body=await req.json();}catch{return reply({error:"Invalid JSON"},400);}
 const orderId=typeof body.order_id==="string"?body.order_id.trim():"";
 if(!orderId||orderId.length>128)return reply({error:"Valid PayPal order ID required"},400);
 const db=createClient(url,service);
 const {data:payment,error:lookupError}=await db.from("payment_records").select("id,status").eq("provider","paypal").eq("provider_order_id",orderId).eq("user_id",user.id).maybeSingle();
 if(lookupError||!payment)return reply({error:"Payment order not found for this account"},404);
 if(payment.status==="completed")return reply({captured:true,already_completed:true});
 if(!["pending","created"].includes(payment.status))return reply({error:"This payment order is no longer payable"},409);
 let accessToken:string;try{accessToken=await tokenFor(base(),id,secret);}catch{return reply({error:"Payment provider authentication failed"},502);}
 const response=await fetch(base()+"/v2/checkout/orders/"+encodeURIComponent(orderId)+"/capture",{method:"POST",headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json","PayPal-Request-Id":payment.id},body:"{}",signal:AbortSignal.timeout(30000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok){
  const issue=Array.isArray(result.details)?result.details[0]?.issue:null;
  if(issue==="ORDER_ALREADY_CAPTURED")return reply({captured:true,awaiting_webhook:true});
  return reply({error:"PayPal could not capture this order"},502);
 }
 const captureStatus=result.status==="COMPLETED"?"COMPLETED":String(result.status||"PENDING");
 // Payment state and membership are deliberately changed only by the verified webhook.
 return reply({captured:captureStatus==="COMPLETED",provider_status:captureStatus,awaiting_webhook:true,order_id:orderId});
});
