// Exposes only approved public plan fields from the private PayPal catalog.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

type Plan = { amount_minor: number; currency: string; period_days: number };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return reply({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const catalogSecret = Deno.env.get("PAYPAL_PLAN_CATALOG");
  if (!url || !anonKey || !catalogSecret || !Deno.env.get("ALLOWED_ORIGIN")) {
    return reply({ error: "Plans are not configured" }, 503);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reply({ error: "Sign in required" }, 401);
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return reply({ error: "Invalid session" }, 401);

  let catalog: Record<string, Plan>;
  try { catalog = JSON.parse(catalogSecret); }
  catch { return reply({ error: "Plan catalog is invalid" }, 503); }

  const plans = Object.entries(catalog)
    .filter(([code, plan]) =>
      /^[a-z0-9_-]{2,40}$/i.test(code) &&
      Number.isSafeInteger(plan?.amount_minor) && plan.amount_minor > 0 &&
      Number.isInteger(plan.period_days) && plan.period_days >= 1 && plan.period_days <= 3660 &&
      typeof plan.currency === "string" && /^[A-Z]{3}$/.test(plan.currency))
    .map(([code, plan]) => ({
      code, amount_minor: plan.amount_minor, currency: plan.currency, period_days: plan.period_days,
    }));
  return reply({ plans });
});
