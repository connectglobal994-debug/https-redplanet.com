import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in before applying for a job.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Applications are not configured.' }, { status: 503 });

  const { jobId } = await context.params;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(jobId)) return NextResponse.json({ error: 'Invalid job identifier.' }, { status: 400 });

  let body: { coverLetter?: unknown };
  try { body = await request.json() as { coverLetter?: unknown }; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const coverLetter = typeof body.coverLetter === 'string' ? body.coverLetter.trim().slice(0, 5000) : '';

  try {
    const jobs = await supabaseAdmin<Record<string, unknown>[]>(`rp_jobs?id=eq.${jobId}&status=eq.published&or=(expires_at.is.null,expires_at.gt.${encodeURIComponent(new Date().toISOString())})&select=id,title,company_name&limit=1`);
    if (!jobs[0]) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 });

    const existing = await supabaseAdmin<Record<string, unknown>[]>(`rp_job_applications?job_id=eq.${jobId}&applicant_user_id=eq.${userId}&select=id&limit=1`);
    if (existing[0]) return NextResponse.json({ error: 'You have already applied for this job.' }, { status: 409 });

    const profiles = await supabaseAdmin<Record<string, unknown>[]>(`rp_candidate_profiles?user_id=eq.${userId}&select=id&limit=1`);
    if (!profiles[0]) return NextResponse.json({ error: 'Create your candidate profile and CV before applying.' }, { status: 409 });
    const resumes = await supabaseAdmin<Record<string, unknown>[]>(`rp_resumes?candidate_profile_id=eq.${profiles[0].id}&is_primary=eq.true&select=id,content&limit=1`);
    if (!resumes[0]) return NextResponse.json({ error: 'Save your CV before applying.' }, { status: 409 });

    const rows = await supabaseAdmin<Record<string, unknown>[]>('rp_job_applications', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        job_id: jobId,
        applicant_user_id: userId,
        resume_id: resumes[0].id,
        resume_snapshot: resumes[0].content,
        cover_letter: coverLetter || null,
        status: 'submitted',
      }),
    });
    return NextResponse.json({ ok: true, application: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Job application failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Your application could not be submitted. Please try again.' }, { status: 503 });
  }
}
