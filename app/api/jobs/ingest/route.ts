import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const maxDuration = 60;

type JobicyJob = {
  id?: number | string;
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  salaryCurrency?: string;
  salaryPeriod?: string;
};

type JobicyResponse = { jobs?: JobicyJob[]; nextCursor?: string | null; success?: boolean; error?: string };

const textValue = (value: unknown, max: number) => typeof value === 'string'
  ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
  : '';

const safeUrl = (value: unknown) => {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch { return ''; }
};

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Jobs database is not configured.' }, { status: 503 });
  }

  let runId: string | undefined;
  try {
    const runRows = await supabaseAdmin<{ id: string }[]>('rp_job_ingestion_runs', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ provider: 'Jobicy', status: 'started' }),
    });
    runId = runRows[0]?.id;

    const discovered: JobicyJob[] = [];
    let cursor: string | null = null;
    let pages = 0;
    do {
      const url = new URL('https://jobicy.com/api/jobs');
      url.searchParams.set('count', '100');
      if (cursor) url.searchParams.set('cursor', cursor);
      const response = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'RedPlanetJobs/1.0 (+https://redplanet.com/jobs)' },
        signal: AbortSignal.timeout(20000),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Jobicy returned HTTP ${response.status}`);
      const payload = await response.json() as JobicyResponse;
      if (payload.success === false) throw new Error(payload.error || 'Jobicy reported an unsuccessful response.');
      if (Array.isArray(payload.jobs)) discovered.push(...payload.jobs);
      cursor = typeof payload.nextCursor === 'string' ? payload.nextCursor : null;
      pages += 1;
    } while (cursor && pages < 3);

    const records = discovered.flatMap((job) => {
      const title = textValue(job.jobTitle, 180);
      const company = textValue(job.companyName, 160);
      const canonicalUrl = safeUrl(job.url);
      if (!title || !company || !canonicalUrl || !job.id) return [];
      const descriptionText = textValue(job.jobDescription || job.jobExcerpt, 18000);
      const description = descriptionText.length >= 30
        ? descriptionText
        : `${descriptionText} More details are available from the original publisher.`;
      const jobTypes = Array.isArray(job.jobType) ? job.jobType.join(' ').toLowerCase() : '';
      const employmentType = jobTypes.includes('part') ? 'part_time'
        : jobTypes.includes('contract') ? 'contract'
        : jobTypes.includes('intern') ? 'internship'
        : 'full_time';
      const minValue = job.salaryMin === undefined ? null : Number(job.salaryMin);
      const maxValue = job.salaryMax === undefined ? null : Number(job.salaryMax);
      const salaryValid = (minValue === null || (Number.isFinite(minValue) && minValue >= 0))
        && (maxValue === null || (Number.isFinite(maxValue) && maxValue >= 0))
        && (minValue === null || maxValue === null || maxValue >= minValue);
      return [{
        title,
        company_name: company,
        description,
        category: Array.isArray(job.jobIndustry) ? textValue(job.jobIndustry[0], 80) || 'Other' : 'Other',
        employment_type: employmentType,
        work_mode: 'remote',
        location_text: textValue(job.jobGeo, 160) || 'Anywhere',
        country_code: null,
        salary_min: salaryValid ? minValue : null,
        salary_max: salaryValid ? maxValue : null,
        salary_currency: textValue(job.salaryCurrency, 3).toUpperCase() || null,
        salary_period: textValue(job.salaryPeriod, 20) || null,
        application_url: canonicalUrl,
        source_name: 'Jobicy',
        source_url: canonicalUrl,
        external_id: String(job.id),
        status: 'published',
        published_at: job.pubDate && !Number.isNaN(Date.parse(job.pubDate))
          ? new Date(job.pubDate).toISOString()
          : new Date().toISOString(),
      }];
    });

    if (records.length) {
      await supabaseAdmin('rp_jobs?on_conflict=source_name,external_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(records),
      });
    }

    if (runId) {
      await supabaseAdmin(`rp_job_ingestion_runs?id=eq.${runId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'completed',
          fetched_count: discovered.length,
          inserted_count: records.length,
          finished_at: new Date().toISOString(),
        }),
      });
    }
    return NextResponse.json({ ok: true, provider: 'Jobicy', pages, fetched: discovered.length, processed: records.length });
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
