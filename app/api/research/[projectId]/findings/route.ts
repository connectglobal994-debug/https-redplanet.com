import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';
import { getResearchProjectAccess } from '@/lib/researchAccess';

export const runtime = 'nodejs';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to add a finding.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Research services are not configured.' }, { status: 503 });
  const { projectId } = await context.params;
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const title = clean(body.title, 180);
  const content = clean(body.body, 12000);
  const confidence = ['unrated','low','medium','high'].includes(String(body.confidence)) ? String(body.confidence) : 'unrated';
  if (title.length < 3 || !content) return NextResponse.json({ error: 'A finding needs a title and a short evidence-based note.' }, { status: 400 });
  try {
    const access = await getResearchProjectAccess(projectId, userId);
    if (!access) return NextResponse.json({ error: 'Project not found or access denied.' }, { status: 404 });
    if (!access.canEdit) return NextResponse.json({ error: 'Editor access is required to add findings.' }, { status: 403 });
    const requestedSourceIds = Array.isArray(body.sourceIds) ? [...new Set(body.sourceIds.filter((id): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(id)))].slice(0, 50) : [];
    const matchingSources = requestedSourceIds.length
      ? await supabaseAdmin<Record<string, unknown>[]>(`research_sources?project_id=eq.${projectId}&id=in.(${requestedSourceIds.join(',')})&select=id`)
      : [];
    const sourceIds = matchingSources.map((source) => String(source.id));
    const rows = await supabaseAdmin<Record<string, unknown>[]>('research_findings', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ project_id: projectId, created_by: userId, title, body: content, confidence, source_ids: sourceIds }),
    });
    return NextResponse.json({ ok: true, finding: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Research finding save failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not save this finding.' }, { status: 503 });
  }
}
