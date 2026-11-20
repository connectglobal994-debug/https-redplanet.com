// Red Planet music generation gateway.
// Provider credentials are server-side Edge Function secrets only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "https://www.redplanet.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const providerUrl = Deno.env.get("MUSIC_PROVIDER_URL");
  const providerKey = Deno.env.get("MUSIC_PROVIDER_API_KEY");
  if (!url || !anon || !serviceRole) return reply({ error: "Supabase server configuration is incomplete." }, 503);
  if (!providerUrl || !providerKey) return reply({ error: "Music generation provider is not configured yet." }, 503);
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reply({ error: "Sign in required." }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return reply({ error: "Invalid session." }, 401);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply({ error: "Invalid JSON." }, 400); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const style = typeof body.style === "string" ? body.style.trim().slice(0, 100) : "";
  const duration = Number(body.duration_seconds ?? 30);
  if (prompt.length < 10 || prompt.length > 2000 || !Number.isInteger(duration) || duration < 5 || duration > 300) {
    return reply({ error: "Enter a prompt (10–2000 characters) and duration from 5 to 300 seconds." }, 400);
  }
  const admin = createClient(url, serviceRole);
  const { data: job, error: insertError } = await admin.from("music_generation_jobs").insert({
    user_id: user.id, prompt, style, duration_seconds: duration, status: "queued",
  }).select("id,status").single();
  if (insertError || !job) return reply({ error: "Could not create generation job." }, 500);
  let providerResponse: Response;
  try {
    providerResponse = await fetch(providerUrl, {
      method: "POST",
      headers: { "Authorization": "Bearer " + providerKey, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style, duration_seconds: duration, user_id: user.id }),
      signal: AbortSignal.timeout(90000),
    });
  } catch (error) {
    await admin.from("music_generation_jobs").update({ status: "failed", error_code: error instanceof Error ? error.name : "provider_unreachable" }).eq("id", job.id);
    return reply({ error: "Music provider could not be reached.", job_id: job.id }, 502);
  }
  const raw = await providerResponse.text();
  if (!providerResponse.ok) {
    await admin.from("music_generation_jobs").update({ status: "failed", error_code: "provider_http_" + providerResponse.status }).eq("id", job.id);
    return reply({ error: "Music provider request failed.", job_id: job.id, provider_status: providerResponse.status }, 502);
  }
  let result: Record<string, unknown>;
  try { result = JSON.parse(raw); } catch {
    await admin.from("music_generation_jobs").update({ status: "failed", error_code: "invalid_provider_response" }).eq("id", job.id);
    return reply({ error: "Music provider returned an invalid response.", job_id: job.id }, 502);
  }
  const providerStatus = ["queued", "processing", "completed"].includes(String(result.status)) ? String(result.status) : "queued";
  const providerJobId = typeof result.provider_job_id === "string" ? result.provider_job_id.slice(0, 255) : null;
  const { error: updateError } = await admin.from("music_generation_jobs").update({
    status: providerStatus,
    provider_job_id: providerJobId,
    completed_at: providerStatus === "completed" ? new Date().toISOString() : null,
  }).eq("id", job.id);
  if (updateError) return reply({ error: "Provider accepted the request, but the job status could not be saved.", job_id: job.id }, 500);
  return reply({ job_id: job.id, status: providerStatus, provider_job_id: providerJobId });
});
