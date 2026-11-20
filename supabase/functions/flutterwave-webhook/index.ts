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
 if(event.event==="refund.completed"){
  const refundId=data?.id;
  if(!Number.isSafeInteger(Number(refundId))||Number(refundId)<=0)return json({error:"Missing refund ID"},400);
  let refundResponse:Response;
  try{refundResponse=await fetch("https://api.flutterwave.com/v3/refunds/"+encodeURIComponent(String(refundId)),{headers:{Authorization:"Bearer "+secret,Accept:"application/json"},signal:AbortSignal.timeout(20000)});}
  catch{return json({error:"Could not verify refund with provider"},502);}
  if(!refundResponse.ok)return json({error:"Provider refund verification failed"},502);
  const refundBody=await refundResponse.json().catch(()=>({}));
  const refund=refundBody?.data;
  const refundStatus=String(refund?.status||"").toLowerCase();
  const transactionId=refund?.transaction_id??refund?.tx_id??data?.charge_id;
  const amountMinor=toMinor(refund?.amount_refunded??data?.amount_refunded,String(refund?.currency||data?.currency||"KES").toUpperCase());
  if(refundBody?.status!=="success"||!["completed","completed-bank-transfer","completed-momo","completed-mpgs","completed-offline","completed-preauth","succeeded"].includes(refundStatus)||!Number.isSafeInteger(Number(transactionId))||Number(transactionId)<=0||amountMinor===null||amountMinor<=0n){
   return json({received:true,processed:false,reason:"refund_not_final_or_invalid"},202);
  }
  const db=createClient(url,service);
  const {data:payment,error:paymentError}=await db.from("payment_records").select("id,amount_minor,currency,status,membership_id,provider_capture_id").eq("provider","flutterwave").eq("provider_capture_id",String(transactionId)).maybeSingle();
  if(paymentError||!payment)return json({received:true,processed:false,reason:"original_payment_not_found"},202);
  const currency=String(payment.currency).toUpperCase();
  if(amountMinor>BigInt(payment.amount_minor))return json({received:true,processed:false,reason:"refund_exceeds_payment"},202);
  // Re-query the original charge as well: refund metadata alone is not the authority
  // for the original transaction's currency or reference.
  let chargeResponse:Response;
  try{chargeResponse=await fetch("https://api.flutterwave.com/v3/transactions/"+encodeURIComponent(String(transactionId))+"/verify",{headers:{Authorization:"Bearer "+secret,Accept:"application/json"},signal:AbortSignal.timeout(20000)});}
  catch{return json({error:"Could not verify original charge"},502);}
  if(!chargeResponse.ok)return json({error:"Original charge verification failed"},502);
  const chargeBody=await chargeResponse.json().catch(()=>({}));
  const charge=chargeBody?.data;
  if(chargeBody?.status!=="success"||String(charge?.currency||"").toUpperCase()!==currency||String(charge?.tx_ref||"")!==String(payment.id)){
   return json({received:true,processed:false,reason:"original_charge_mismatch"},202);
  }
  const refundAmount=Number(amountMinor);
  if(!Number.isSafeInteger(refundAmount))return json({received:true,processed:false,reason:"refund_amount_out_of_range"},202);
  const {error:upsertError}=await db.from("payment_refunds").upsert({
   payment_id:payment.id,provider:"flutterwave",provider_refund_id:String(refundId),
   amount_minor:refundAmount,currency,status:"completed",provider_reference:String(refund?.flw_ref||"")
  },{onConflict:"provider,provider_refund_id"});
  if(upsertError)return json({error:"Could not record verified refund"},500);
  const {data:refundRows,error:sumError}=await db.from("payment_refunds").select("amount_minor").eq("payment_id",payment.id).eq("provider","flutterwave").eq("status","completed");
  if(sumError||!refundRows)return json({error:"Could not reconcile verified refunds"},500);
  const totalRefunded=refundRows.reduce((sum,row)=>sum+BigInt(row.amount_minor),0n);
  if(totalRefunded>BigInt(payment.amount_minor))return json({received:true,processed:false,reason:"cumulative_refund_exceeds_payment"},202);
  if(totalRefunded===BigInt(payment.amount_minor)&&payment.membership_id){
   const {error:membershipError}=await db.from("memberships").update({status:"cancelled",updated_at:new Date().toISOString()}).eq("id",payment.membership_id);
   if(membershipError)return json({error:"Refund recorded but membership cancellation failed"},500);
  }
  const {error:paymentUpdateError}=await db.from("payment_records").update({status:totalRefunded===BigInt(payment.amount_minor)?"refunded":"completed"}).eq("id",payment.id);
  if(paymentUpdateError)return json({error:"Refund recorded but payment reconciliation failed"},500);
  return json({received:true,processed:true,refund_status:"completed",fully_refunded:totalRefunded===BigInt(payment.amount_minor)});
 }
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
