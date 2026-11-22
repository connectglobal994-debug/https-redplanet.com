// Creates PayPal orders from a server-controlled plan catalog. The browser never supplies a price.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "https://www.redplanet.com",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

type Plan = { amount_minor: number; currency: string; period_days: number };
function paypalBase() {
  return Deno.env.get("PAYPAL_ENV") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
function minorToMajor(amountMinor: number, currency: string) {
  const digits = new Intl.NumberFormat("en", { style: "currency", currency })
    .resolvedOptions().maximumFractionDigits;
  const value = BigInt(amountMinor);
  const scale = 10n ** BigInt(digits);
  const whole = value / scale;
  if (digits === 0) return whole.toString();
  const fraction = (value % scale).toString().padStart(digits, "0");
  return whole.toString() + "." + fraction;
}
async function accessToken(base: string, id: string, secret: string) {
  const response = await fetch(base + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(id + ":" + secret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("PayPal authentication failed");
  const data = await response.json();
  if (typeof data.access_token !== "string") throw new Error("PayPal access token missing");
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const catalogSecret = Deno.env.get("PAYPAL_PLAN_CATALOG");
  const siteUrl = Deno.env.get("RP_SITE_URL");
  if (!supabaseUrl || !anonKey || !serviceRole || !clientId || !clientSecret || !catalogSecret || !siteUrl) {
    return reply({ error: "Checkout is not configured" }, 503);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reply({ error: "Sign in required" }, 401);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return reply({ error: "Invalid session" }, 401);

  let requestBody: Record<string, unknown>;
  try { requestBody = await req.json(); } catch { return reply({ error: "Invalid JSON" }, 400); }
  const planCode = typeof requestBody.plan_code === "string" ? requestBody.plan_code.trim() : "";
  let catalog: Record<string, Plan>;
  try { catalog = JSON.parse(catalogSecret); } catch { return reply({ error: "Plan catalog is invalid" }, 503); }
  const plan = catalog[planCode];
  if (!plan || !Number.isSafeInteger(plan.amount_minor) || plan.amount_minor <= 0 ||
      !Number.isInteger(plan.period_days) || plan.period_days < 1 || plan.period_days > 3660 ||
      typeof plan.currency !== "string" || !/^[A-Z]{3}$/.test(plan.currency)) {
    return reply({ error: "Selected plan is unavailable" }, 400);
  }
  let amount: string;
  try { amount = minorToMajor(plan.amount_minor, plan.currency); }
  catch { return reply({ error: "Plan currency is not supported" }, 503); }

  const db = createClient(supabaseUrl, serviceRole);
  const { data: payment, error: insertError } = await db.from("payment_records").insert({
    user_id: user.id,
    provider: "paypal",
    currency: plan.currency,
    amount_minor: plan.amount_minor,
    plan_code: planCode,
    membership_period_days: plan.period_days,
    status: "pending",
  }).select("id").single();
  if (insertError || !payment) return reply({ error: "Could not create payment record" }, 500);

  const base = paypalBase();
  let token: string;
  try { token = await accessToken(base, clientId, clientSecret); }
  catch {
    await db.from("payment_records").update({ status: "failed" }).eq("id", payment.id);
    return reply({ error: "Payment provider authentication failed" }, 502);
  }

  const origin = siteUrl.replace(/\/$/, "");
  let orderResponse: Response;
  try {
    orderResponse = await fetch(base + "/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "PayPal-Request-Id": payment.id,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: payment.id,
          custom_id: payment.id,
          invoice_id: payment.id,
          amount: { currency_code: plan.currency, value: amount },
          description: "Red Planet membership: " + planCode,
        }],
        application_context: {
          brand_name: "Red Planet",
          user_action: "PAY_NOW",
          return_url: origin + "/payments.html?paypal=return",
          cancel_url: origin + "/payments.html?paypal=cancel",
        },
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    await db.from("payment_records").update({ status: "failed" }).eq("id", payment.id);
    return reply({ error: "Could not reach the payment provider" }, 502);
  }
  const responseBody = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok || typeof responseBody.id !== "string") {
    await db.from("payment_records").update({ status: "failed" }).eq("id", payment.id);
    return reply({ error: "PayPal could not create the order" }, 502);
  }

  const approval = Array.isArray(responseBody.links)
    ? responseBody.links.find((link: Record<string, unknown>) => link.rel === "approve" && typeof link.href === "string")
    : null;
  if (!approval?.href) {
    await db.from("payment_records").update({ status: "failed" }).eq("id", payment.id);
    return reply({ error: "PayPal order did not include an approval link" }, 502);
  }
  const { error: saveError } = await db.from("payment_records")
    .update({ provider_order_id: responseBody.id })
    .eq("id", payment.id);
  if (saveError) return reply({ error: "Order created but could not be safely linked to its payment record" }, 500);

  return reply({ order_id: responseBody.id, approval_url: approval.href, payment_id: payment.id });
});
