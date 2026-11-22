import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const maxDuration = 60;

type JobicyJob = {
  id?: number | string;
  url?: string;
  jobUrl?: string;
  jobTitle?: string;
  companyName?: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  annualSalaryMin?: number | string;
  annualSalaryMax?: number | string;
  salaryCurrency?: string;
  pubDate?: string;
};

const textValue = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
const safeUrl = (value: unknown) => {
  if (typeof value !== 'string') return '';
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : ''; }
  catch { return ''; }
};

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Jobs database is not configured.' }, { status: 503 });
  }

  const runRows = await supabaseAdmin<{ id: string }[]>('rp_job_ingestion_runs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ provider: 'Jobicy', status: 'started' }),
  });
  const runId = runRows[0]?.id;

  try {
    const response = await fetch('https://jobicy.com/api/v2/remote-jobs?count=50', {
      headers: { Accept: 'application/json', 'User-Agent': 'RedPlanetJobs/1.0 (+https://redplanet.com/jobs)' },
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Job source returned HTTP ${response.status}`);
    const payload = await response.json() as { jobs?: JobicyJob[] };
    const sourceJobs = Array.isArray(payload.jobs) ? payload.jobs : [];

    const records = sourceJobs.flatMap((job) => {
      const title = textValue(job.jobTitle, 180);
      const company = textValue(job.companyName, 160);
      const applyUrl = safeUrl(job.url || job.jobUrl);
      if (!title || !company || !applyUrl || !job.id) return [];
      const rawDescription = textValue(job.jobDescription || job.jobExcerpt, 18000);
      const description = rawDescription.length >= 30 ? rawDescription : `${rawDescription} More details are available from the original publisher.`;
      const geo = textValue(job.jobGeo, 160) || 'Remote';
      const jobTypes = Array.isArray(job.jobType) ? job.jobType : [];
      const type = jobTypes.join(' ').toLowerCase();
      const employmentType = type.includes('part') ? 'part_time' : type.includes('contract') ? 'contract' : type.includes('intern') ? 'internship' : 'full_time';
      const min = job.annualSalaryMin === undefined ? null : Number(job.annualSalaryMin);
      const max = job.annualSalaryMax === undefined ? null : Number(job.annualSalaryMax);
      return [{
        title, company_name: company, description,
        category: Array.isArray(job.jobIndustry) ? textValue(job.jobIndustry[0], 80) || 'Other' : 'Other',
        employment_type: employmentType, work_mode: 'remote',
        location_text: geo, country_code: null,
        salary_min: min !== null && Number.isFinite(min) && min >= 0 ? min : null,
        salary_max: max !== null && Number.isFinite(max) && max >= 0 ? max : null,
        salary_currency: textValue(job.salaryCurrency, 3).toUpperCase() || null,
        application_url: applyUrl, source_name: 'Jobicy', source_url: applyUrl,
        external_id: String(job.id), status: 'published',
        published_at: job.pubDate && !Number.isNaN(Date.parse(job.pubDate)) ? new Date(job.pubDate).toISOString() : new Date().toISOString(),
      }];
    });

    let inserted = 0;
    if (records.length) {
      await supabaseAdmin('rp_jobs?on_conflict=source_name,external_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(records),
      });
      inserted = records.length;
    }
    if (runId) {
      await supabaseAdmin(`rp_job_ingestion_runs?id=eq.${runId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed', fetched_count: sourceJobs.length, inserted_count: inserted, finished_at: new Date().toISOString() }),
      });
    }
    return NextResponse.json({ ok: true, provider: 'Jobicy', fetched: sourceJobs.length, processed: inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ingestion error';
    if (runId) {
      await supabaseAdmin(`rp_job_ingestion_runs?id=eq.${runId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'failed', error_summary: message.slice(0, 500), finished_at: new Date().toISOString() }),
      }).catch(() => undefined);
    }
    console.error('Job discovery failed:', message);
    return NextResponse.json({ error: 'Job discovery failed. Check the ingestion run log.' }, { status: 502 });
  }
}
