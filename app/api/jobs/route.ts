import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JobInput = {
  title?: unknown;
  companyName?: unknown;
  description?: unknown;
  category?: unknown;
  employmentType?: unknown;
  workMode?: unknown;
  location?: unknown;
  countryCode?: unknown;
  salaryMin?: unknown;
  salaryMax?: unknown;
  salaryCurrency?: unknown;
  applicationUrl?: unknown;
  sourceName?: unknown;
  sourceUrl?: unknown;
  externalId?: unknown;
  status?: unknown;
  expiresAt?: unknown;
};

const EMPLOYMENT_TYPES = new Set(['full_time','part_time','contract','temporary','internship','freelance','volunteer']);
const WORK_MODES = new Set(['remote','hybrid','onsite']);
const STATUSES = new Set(['draft','published','paused','expired']);
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validHttpUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
};

export async function GET(request: NextRequest) {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ jobs: [], status: 'not_configured' }, { status: 503 });
  }

  const params = new URLSearchParams();
  params.set('select', 'id,title,company_name,description,category,employment_type,work_mode,location_text,country_code,salary_min,salary_max,salary_currency,application_url,source_name,source_url,published_at,expires_at');
  params.set('status', 'eq.published');
  params.set('or', '(expires_at.is.null,expires_at.gt.' + new Date().toISOString() + ')');
  params.set('order', 'published_at.desc.nullslast');
  params.set('limit', '60');

  const q = clean(request.nextUrl.searchParams.get('q'), 80).replace(/[%,()]/g, ' ');
  const location = clean(request.nextUrl.searchParams.get('location'), 80).replace(/[%,()]/g, ' ');
  const mode = clean(request.nextUrl.searchParams.get('workMode'), 20);
  const type = clean(request.nextUrl.searchParams.get('employmentType'), 30);
  if (q) params.set('or', '(title.ilike.*' + q + '*,company_name.ilike.*' + q + '*,description.ilike.*' + q + '*)');
  if (location) params.set('location_text', 'ilike.*' + location + '*');
  if (WORK_MODES.has(mode)) params.set('work_mode', 'eq.' + mode);
  if (EMPLOYMENT_TYPES.has(type)) params.set('employment_type', 'eq.' + type);

  try {
    const rows = await supabaseAdmin<Record<string, unknown>[]>(`rp_jobs?${params.toString()}`);
    return NextResponse.json({ jobs: rows, status: 'ok' });
  } catch (error) {
    console.error('Jobs listing failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ jobs: [], status: 'unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Administrator access is required to publish jobs.' }, { status: 403 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Job publishing is not configured.' }, { status: 503 });
  }

  let body: JobInput;
  try { body = await request.json() as JobInput; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }

  const title = clean(body.title, 180);
  const companyName = clean(body.companyName, 160);
  const description = clean(body.description, 20000);
  const applicationUrl = clean(body.applicationUrl, 2048);
  const employmentType = clean(body.employmentType, 30) || 'full_time';
  const workMode = clean(body.workMode, 20) || 'onsite';
  const status = clean(body.status, 20) || 'published';
  const salaryMin = body.salaryMin === null || body.salaryMin === undefined || body.salaryMin === '' ? null : Number(body.salaryMin);
  const salaryMax = body.salaryMax === null || body.salaryMax === undefined || body.salaryMax === '' ? null : Number(body.salaryMax);

  if (title.length < 3 || companyName.length < 2 || description.length < 30) {
    return NextResponse.json({ error: 'Title, company and a description of at least 30 characters are required.' }, { status: 400 });
  }
  if (!validHttpUrl(applicationUrl)) return NextResponse.json({ error: 'A valid HTTP or HTTPS application URL is required.' }, { status: 400 });
  if (!EMPLOYMENT_TYPES.has(employmentType) || !WORK_MODES.has(workMode) || !STATUSES.has(status)) {
    return NextResponse.json({ error: 'Choose valid employment, work-mode and publication values.' }, { status: 400 });
  }
  if ((salaryMin !== null && (!Number.isFinite(salaryMin) || salaryMin < 0)) ||
      (salaryMax !== null && (!Number.isFinite(salaryMax) || salaryMax < 0)) ||
      (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin)) {
    return NextResponse.json({ error: 'Salary range is invalid.' }, { status: 400 });
  }

  const sourceUrl = clean(body.sourceUrl, 2048);
  if (sourceUrl && !validHttpUrl(sourceUrl)) return NextResponse.json({ error: 'Source URL must be HTTP or HTTPS.' }, { status: 400 });
  const expiresAt = clean(body.expiresAt, 40);
  if (expiresAt && Number.isNaN(Date.parse(expiresAt))) return NextResponse.json({ error: 'Expiry date is invalid.' }, { status: 400 });

  const record = {
    title, company_name: companyName, description,
    category: clean(body.category, 80) || 'Other',
    employment_type: employmentType, work_mode: workMode,
    location_text: clean(body.location, 160) || 'Not specified',
    country_code: clean(body.countryCode, 2).toUpperCase() || null,
    salary_min: salaryMin, salary_max: salaryMax,
    salary_currency: clean(body.salaryCurrency, 3).toUpperCase() || null,
    application_url: applicationUrl,
    source_name: clean(body.sourceName, 100) || 'Red Planet',
    source_url: sourceUrl || null,
    external_id: clean(body.externalId, 200) || null,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
    expires_at: expiresAt || null,
  };

  try {
    const rows = await supabaseAdmin<Record<string, unknown>[]>('rp_jobs', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(record),
    });
    return NextResponse.json({ ok: true, job: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Admin job publishing failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'The job could not be saved. Check that the jobs database migration has been applied.' }, { status: 503 });
  }
}
