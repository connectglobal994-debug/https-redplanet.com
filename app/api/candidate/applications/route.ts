import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to view your applications.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Career services are not configured.' }, { status: 503 });
  try {
    const applications = await supabaseAdmin<Record<string, unknown>[]>(
      `rp_job_applications?applicant_user_id=eq.${userId}&select=id,job_id,status,submitted_at,updated_at,cover_letter&order=submitted_at.desc&limit=100`
    );
    const jobIds = [...new Set(applications.map((item) => String(item.job_id)))];
    if (!jobIds.length) return NextResponse.json({ applications: [] });
    const jobs = await supabaseAdmin<Record<string, unknown>[]>(
      `rp_jobs?id=in.(${jobIds.join(',')})&select=id,title,company_name,location_text,work_mode,employment_type,application_url`
    );
    const jobById = new Map(jobs.map((job) => [String(job.id), job]));
    return NextResponse.json({ applications: applications.map((item) => ({ ...item, job: jobById.get(String(item.job_id)) ?? null })) });
  } catch (error) {
    console.error('Candidate applications load failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load your job applications.' }, { status: 503 });
  }
}
