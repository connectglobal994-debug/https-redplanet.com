import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';
import { getResearchProjectAccess } from '@/lib/researchAccess';

export const runtime = 'nodejs';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validUrl = (value: string) => { try { const u = new URL(value); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; } };

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to add a source.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Research services are not configured.' }, { status: 503 });
  const { projectId } = await context.params;
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const sourceUrl = clean(body.sourceUrl, 2048);
  const title = clean(body.title, 300);
  const sourceType = ['web','paper','book','report','dataset','interview','other'].includes(String(body.sourceType)) ? String(body.sourceType) : 'web';
  if (!validUrl(sourceUrl) || sourceUrl.length < 8 || title.length < 2) return NextResponse.json({ error: 'Enter a valid source URL and title.' }, { status: 400 });
  try {
    const access = await getResearchProjectAccess(projectId, userId);
    if (!access) return NextResponse.json({ error: 'Project not found or access denied.' }, { status: 404 });
    if (!access.canEdit) return NextResponse.json({ error: 'Editor access is required to add sources.' }, { status: 403 });
    const rows = await supabaseAdmin<Record<string, unknown>[]>('research_sources', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        project_id: projectId, added_by: userId, source_url: sourceUrl, title,
        publisher: clean(body.publisher, 180) || null,
        notes: clean(body.notes, 3000) || null,
        evidence_excerpt: clean(body.evidenceExcerpt, 5000) || null,
        source_type: sourceType,
      }),
    });
    return NextResponse.json({ ok: true, source: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Research source save failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not save this source.' }, { status: 503 });
  }
}
