import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CandidateInput = {
  fullName?: unknown;
  headline?: unknown;
  location?: unknown;
  countryCode?: unknown;
  phone?: unknown;
  bio?: unknown;
  linkedinUrl?: unknown;
  portfolioUrl?: unknown;
  websiteUrl?: unknown;
  skills?: unknown;
  resumeTitle?: unknown;
  resume?: unknown;
};

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const safeOptionalUrl = (value: unknown) => {
  const raw = clean(value, 2048);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : false;
  } catch { return false; }
};

function validResume(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const json = JSON.stringify(value);
  return json.length <= 30000;
}

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to access your CV.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Candidate services are not configured.' }, { status: 503 });

  try {
    const profiles = await supabaseAdmin<Record<string, unknown>[]>(`rp_candidate_profiles?user_id=eq.${userId}&select=*`);
    if (!profiles[0]) return NextResponse.json({ profile: null, resume: null });
    const resumes = await supabaseAdmin<Record<string, unknown>[]>(`rp_resumes?candidate_profile_id=eq.${profiles[0].id}&is_primary=eq.true&select=*&limit=1`);
    return NextResponse.json({ profile: profiles[0], resume: resumes[0] ?? null });
  } catch (error) {
    console.error('Candidate profile load failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load your CV right now.' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to save your CV.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Candidate services are not configured.' }, { status: 503 });

  let body: CandidateInput;
  try { body = await request.json() as CandidateInput; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }

  const fullName = clean(body.fullName, 160);
  if (fullName.length < 2) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 });
  const linkedinUrl = safeOptionalUrl(body.linkedinUrl);
  const portfolioUrl = safeOptionalUrl(body.portfolioUrl);
  const websiteUrl = safeOptionalUrl(body.websiteUrl);
  if (linkedinUrl === false || portfolioUrl === false || websiteUrl === false) {
    return NextResponse.json({ error: 'Profile links must be valid HTTP or HTTPS URLs.' }, { status: 400 });
  }
  const skills = Array.isArray(body.skills)
    ? body.skills.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 60)).filter(Boolean).slice(0, 40)
    : [];
  const resume = body.resume ?? {};
  if (!validResume(resume)) return NextResponse.json({ error: 'CV information must be a JSON object under 30 KB.' }, { status: 400 });

  const profileRecord = {
    user_id: userId,
    full_name: fullName,
    headline: clean(body.headline, 180) || null,
    location_text: clean(body.location, 160) || null,
    country_code: clean(body.countryCode, 2).toUpperCase() || null,
    phone: clean(body.phone, 40) || null,
    bio: clean(body.bio, 2000) || null,
    linkedin_url: linkedinUrl,
    portfolio_url: portfolioUrl,
    website_url: websiteUrl,
    skills,
    updated_at: new Date().toISOString(),
  };

  try {
    const profiles = await supabaseAdmin<Record<string, unknown>[]>('rp_candidate_profiles?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(profileRecord),
    });
    const profile = profiles[0];
    if (!profile?.id) throw new Error('Profile was not returned after save.');

    const resumeRows = await supabaseAdmin<Record<string, unknown>[]>('rp_resumes?on_conflict=candidate_profile_id&is_primary=eq.true', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        candidate_profile_id: profile.id,
        title: clean(body.resumeTitle, 120) || 'My CV',
        content: resume,
        is_primary: true,
        updated_at: new Date().toISOString(),
      }),
    }).catch(async () => {
      const existing = await supabaseAdmin<Record<string, unknown>[]>(`rp_resumes?candidate_profile_id=eq.${profile.id}&is_primary=eq.true&select=id&limit=1`);
      if (!existing[0]?.id) throw new Error('Could not save CV. Check the CV database migration.');
      const updated = await supabaseAdmin<Record<string, unknown>[]>(`rp_resumes?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ title: clean(body.resumeTitle, 120) || 'My CV', content: resume, updated_at: new Date().toISOString() }),
      });
      return updated;
    });

    return NextResponse.json({ ok: true, profile, resume: resumeRows[0] ?? null });
  } catch (error) {
    console.error('Candidate CV save failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not save your CV. Confirm both candidate migrations have been applied.' }, { status: 503 });
  }
}
