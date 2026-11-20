// Flutterwave webhook: validate shared secret hash, then re-query the transaction
// with the private API key before updating payment or membership records.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Content-Type":"application/json"}});
function toMinor(value:unknown,currency:string):bigint|null{
 if(typeof value!=="string"&&typeof value!=="number")return null;
 const raw=String(value);
 const match=raw.match(/^(\d+)(?:\.(\d+))?$/);if(!match)return null;
 try{
  const digits=new Intl.NumberFormat("en",{style:"currency",currency}).resolvedOptions().maximumFractionDigits;
  if((match[2]||"").length>digits)return null;
  return BigInt(match[1])*10n**BigInt(digits)+BigInt((match[2]||"").padEnd(digits,"0")||"0");
 }catch{return null;}
}
Deno.serve(async req=>{
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 const secret=Deno.env.get("FLW_SECRET_KEY"),webhookHash=Deno.env.get("FLW_WEBHOOK_SECRET_HASH");
 if(!url||!service||!secret||!webhookHash)return json({error:"Flutterwave webhook is not configured"},503);
 const supplied=req.headers.get("verif-hash");
 if(!supplied||supplied!==webhookHash)return json({error:"Invalid webhook signature"},401);
 let event:Record<string,any>;try{event=await req.json();}catch{return json({error:"Invalid JSON"},400);}
 const data=event?.data;
 const transactionId=data?.id;
 if(!Number.isSafeInteger(Number(transactionId))||Number(transactionId)<=0)return json({error:"Missing transaction ID"},400);
 if(event.event!=="charge.completed")return json({received:true,ignored:true});
 let verifyResponse:Response;
 try{
  verifyResponse=await fetch("https://api.flutterwave.com/v3/transactions/"+encodeURIComponent(String(transactionId))+"/verify",{
   headers:{Authorization:"Bearer "+secret,Accept:"application/json"},signal:AbortSignal.timeout(25000)
  });
 }catch{return json({error:"Could not verify transaction with provider"},502);}
 if(!verifyResponse.ok)return json({error:"Provider transaction verification failed"},502);
 const verified=await verifyResponse.json().catch(()=>({}));
 const tx=verified?.data;
 if(verified?.status!=="success"||tx?.status!=="successful"||typeof tx?.tx_ref!=="string")return json({received:true,processed:false,reason:"transaction_not_successful"},202);
 const db=createClient(url,service);
 const {data:payment,error:paymentError}=await db.from("payment_records")
  .select("id,amount_minor,currency,status,membership_id")
  .eq("provider","flutterwave").eq("provider_order_id",tx.tx_ref).maybeSingle();
 if(paymentError||!payment)return json({received:true,processed:false,reason:"payment_record_not_found"},202);
 const expected=BigInt(payment.amount_minor);
 const paid=toMinor(tx.amount,String(tx.currency||"").toUpperCase());
 if(String(tx.currency||"").toUpperCase()!==String(payment.currency).trim().toUpperCase()||paid===null||paid!==expected){
  return json({received:true,processed:false,reason:"amount_currency_mismatch"},202);
 }
 if(payment.status==="completed"&&payment.membership_id)return json({received:true,duplicate:true});
 const eventId=String(transactionId);
 const {data:delivery,error:deliveryError}=await db.from("payment_webhook_events").insert({
  provider:"flutterwave",provider_event_id:eventId,event_type:"charge.completed",
  related_order_id:tx.tx_ref,processing_status:"received"
 }).select("id").single();
 let deliveryId=delivery?.id;
 if(deliveryError){
  if(deliveryError.code!=="23505")return json({error:"Could not record verified event"},500);
  const {data:existing,error:existingError}=await db.from("payment_webhook_events").select("id,processing_status")
   .eq("provider","flutterwave").eq("provider_event_id",eventId).maybeSingle();
  if(existingError||!existing)return json({error:"Could not load previous event"},500);
  if(existing.processing_status==="processed"||existing.processing_status==="ignored")return json({received:true,duplicate:true});
  deliveryId=existing.id;
 }
 const {data:membershipId,error:activationError}=await db.rpc("complete_verified_provider_membership_payment",{
  p_payment_id:payment.id,p_capture_id:eventId,p_provider:"flutterwave"
 });
 if(activationError||!membershipId){
  await db.from("payment_webhook_events").update({processing_status:"failed",error_message:(activationError?.message||"Membership activation failed").slice(0,500)}).eq("id",deliveryId);
  return json({received:true,processed:false,reason:"membership_activation_failed"},202);
 }
 await db.from("payment_webhook_events").update({processing_status:"processed",processed_at:new Date().toISOString(),error_message:null}).eq("id",deliveryId);
 return json({received:true,processed:true});
});
