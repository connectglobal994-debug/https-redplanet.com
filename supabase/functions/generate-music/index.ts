// Red Planet music generation gateway.
// Configure MUSIC_PROVIDER_URL and MUSIC_PROVIDER_API_KEY as Supabase Edge Function secrets.
// Provider URL must implement the documented Red Planet adapter contract:
// POST { prompt, style, duration_seconds, callback_url? }
// Response JSON: { status: "queued"|"processing"|"completed", provider_job_id?, audio_url?, error? }
// Do not expose provider credentials to browser code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "https://www.redplanet.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const providerUrl = Deno.env.get("MUSIC_PROVIDER_URL");
  const providerKey = Deno.env.get("MUSIC_PROVIDER_API_KEY");
  if (!url || !anon || !serviceRole || !providerUrl || !providerKey) {
    return Response.json({ error: "Music generation provider is not configured yet." }, { status: 503, headers: cors });
  }
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return Response.json({ error: "Sign in required." }, { status: 401, headers: cors });
  const supabase = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "Invalid session." }, { status: 401, headers: cors });
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400, headers: cors }); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const style = typeof body.style === "string" ? body.style.trim().slice(0, 100) : "";
  const duration = Number(body.duration_seconds ?? 30);
  if (prompt.length < 10 || prompt.length > 2000 || !Number.isInteger(duration) || duration < 5 || duration > 300) {
    return Response.json({ error: "Enter a prompt (10–2000 characters) and duration from 5 to 300 seconds." }, { status: 400, headers: cors });
  }
  // The provider adapter is configured server-side; API keys never reach the browser.
  const response = await fetch(providerUrl, {
    method: "POST",
    headers: { "Authorization": "Bearer " + providerKey, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style, duration_seconds: duration, user_id: user.id }),
  });
  const raw = await response.text();
  if (!response.ok) return Response.json({ error: "Music provider request failed.", provider_status: response.status }, { status: 502, headers: cors });
  let result;
  try { result = JSON.parse(raw); } catch { return Response.json({ error: "Music provider returned an invalid response." }, { status: 502, headers: cors }); }
  const admin = createClient(url, serviceRole);
  const { data: job, error: insertError } = await admin.from("music_generation_jobs").insert({
    user_id: user.id, prompt, style, duration_seconds: duration,
    status: ["queued", "processing", "completed"].includes(result.status) ? result.status : "queued",
    provider_job_id: typeof result.provider_job_id === "string" ? result.provider_job_id : null,
  }).select("id,status").single();
  if (insertError) return Response.json({ error: "Could not save generation job." }, { status: 500, headers: cors });
  return Response.json({ job_id: job.id, status: job.status, provider: "configured" }, { headers: cors });
});
