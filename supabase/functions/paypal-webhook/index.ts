// PayPal webhook receiver. Verifies the signature with PayPal before processing any event.
// Required Edge Function secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_ENV (sandbox|live).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Content-Type":"application/json"}});
function paypalBase(){return Deno.env.get("PAYPAL_ENV")==="live"?"https://api-m.paypal.com":"https://api-m.sandbox.paypal.com";}
async function getAccessToken(base:string,clientId:string,secret:string){
 const response=await fetch(base+"/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+btoa(clientId+":"+secret),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
 if(!response.ok)throw new Error("PayPal authentication failed");
 const body=await response.json();if(typeof body.access_token!=="string")throw new Error("PayPal access token missing");return body.access_token as string;
}
Deno.serve(async req=>{
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const supabaseUrl=Deno.env.get("SUPABASE_URL"),serviceRole=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 const clientId=Deno.env.get("PAYPAL_CLIENT_ID"),secret=Deno.env.get("PAYPAL_CLIENT_SECRET"),webhookId=Deno.env.get("PAYPAL_WEBHOOK_ID");
 if(!supabaseUrl||!serviceRole||!clientId||!secret||!webhookId)return json({error:"Payment webhook is not configured"},503);
 const requiredHeaders=["paypal-auth-algo","paypal-cert-url","paypal-transmission-id","paypal-transmission-sig","paypal-transmission-time"];
 const headerValues:Record<string,string>={};
 for(const name of requiredHeaders){const value=req.headers.get(name);if(!value)return json({error:"Missing PayPal signature headers"},400);headerValues[name]=value;}
 let event:Record<string,any>;
 try{event=await req.json();}catch{return json({error:"Invalid JSON event"},400);}
 if(typeof event.id!=="string"||typeof event.event_type!=="string")return json({error:"Malformed PayPal event"},400);
 const base=paypalBase();
 let token:string;
 try{token=await getAccessToken(base,clientId,secret);}catch{return json({error:"Could not authenticate with payment provider"},502);}
 const verification=await fetch(base+"/v1/notifications/verify-webhook-signature",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({
  auth_algo:headerValues["paypal-auth-algo"],cert_url:headerValues["paypal-cert-url"],transmission_id:headerValues["paypal-transmission-id"],transmission_sig:headerValues["paypal-transmission-sig"],transmission_time:headerValues["paypal-transmission-time"],webhook_id:webhookId,webhook_event:event
 })});
 if(!verification.ok)return json({error:"Could not verify payment notification"},502);
 const verificationBody=await verification.json();
 if(verificationBody.verification_status!=="SUCCESS")return json({error:"Invalid payment notification signature"},401);
 const db=createClient(supabaseUrl,serviceRole);
 const resource=event.resource||{};
 const related=resource.supplementary_data?.related_ids||{};
 const orderId=typeof related.order_id==="string"?related.order_id:null;
 const captureId=typeof resource.id==="string"?resource.id:null;
 const type=event.event_type as string;
 const mapping:Record<string,string>={"PAYMENT.CAPTURE.COMPLETED":"completed","PAYMENT.CAPTURE.DENIED":"failed","PAYMENT.CAPTURE.REFUNDED":"refunded","PAYMENT.CAPTURE.REVERSED":"reversed"};
 const nextStatus=mapping[type];
 let deliveryId:string|number;
 const {data:delivery,error:deliveryError}=await db.from("payment_webhook_events").insert({
  provider:"paypal",provider_event_id:event.id,event_type:type,related_order_id:orderId,processing_status:nextStatus?"received":"ignored",processed_at:nextStatus?null:new Date().toISOString()
 }).select("id").single();
 if(deliveryError){
  if(deliveryError.code!=="23505")return json({error:"Could not record verified notification"},500);
  const {data:existing,error:existingError}=await db.from("payment_webhook_events").select("id,processing_status").eq("provider","paypal").eq("provider_event_id",event.id).maybeSingle();
  if(existingError||!existing)return json({error:"Could not load previous notification"},500);
  if(["processed","ignored"].includes(existing.processing_status))return json({received:true,duplicate:true});
  deliveryId=existing.id;
  await db.from("payment_webhook_events").update({processing_status:"received",error_message:null}).eq("id",deliveryId);
 }else deliveryId=delivery.id;
 if(!nextStatus)return json({received:true,ignored:true});
 if(!orderId){
  await db.from("payment_webhook_events").update({processing_status:"failed",error_message:"Verified event did not contain a related order ID"}).eq("id",deliveryId);
  return json({received:true,processed:false,reason:"order_id_missing"},202);
 }
 const updates:Record<string,unknown>={status:nextStatus,verified_at:new Date().toISOString()};
 if(captureId)updates.provider_capture_id=captureId;
 const {data:updated,error:updateError}=await db.from("payment_records").update(updates).eq("provider","paypal").eq("provider_order_id",orderId).select("id").maybeSingle();
 if(updateError||!updated){
  const message=updateError?.message||"No matching payment order was found";
  await db.from("payment_webhook_events").update({processing_status:"failed",error_message:message.slice(0,500)}).eq("id",deliveryId);
  return json({received:true,processed:false,reason:"payment_record_not_updated"},202);
 }
 await db.from("payment_webhook_events").update({processing_status:"processed",processed_at:new Date().toISOString()}).eq("id",deliveryId);
 return json({received:true,processed:true});
});
