import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';
import { getResearchProjectAccess } from '@/lib/researchAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to view this project.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Research services are not configured.' }, { status: 503 });
  const { projectId } = await context.params;
  try {
    const access = await getResearchProjectAccess(projectId, userId);
    if (!access) return NextResponse.json({ error: 'Project not found or access denied.' }, { status: 404 });
    const [sources, findings] = await Promise.all([
      supabaseAdmin<Record<string, unknown>[]>(`research_sources?project_id=eq.${projectId}&select=*&order=created_at.desc`),
      supabaseAdmin<Record<string, unknown>[]>(`research_findings?project_id=eq.${projectId}&select=*&order=created_at.desc`),
    ]);
    return NextResponse.json({ project: access.project, canEdit: access.canEdit, sources, findings });
  } catch (error) {
    console.error('Research project detail failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load this research project.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to update this project.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Research services are not configured.' }, { status: 503 });
  const { projectId } = await context.params;
  let body: { title?: unknown; researchQuestion?: unknown; status?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 180) : '';
  const researchQuestion = typeof body.researchQuestion === 'string' ? body.researchQuestion.trim().slice(0, 5000) : '';
  const status = body.status;
  if (title.length < 3 || researchQuestion.length < 10 || !['active','paused','completed','archived'].includes(String(status))) {
    return NextResponse.json({ error: 'Provide a valid title, research question and project status.' }, { status: 400 });
  }
  try {
    const access = await getResearchProjectAccess(projectId, userId);
    if (!access) return NextResponse.json({ error: 'Project not found or access denied.' }, { status: 404 });
    if (!access.canEdit) return NextResponse.json({ error: 'Editor access is required.' }, { status: 403 });
    const rows = await supabaseAdmin<Record<string, unknown>[]>(`research_projects?id=eq.${projectId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ title, research_question: researchQuestion, status, updated_at: new Date().toISOString() }),
    });
    return NextResponse.json({ ok: true, project: rows[0] });
  } catch (error) {
    console.error('Research project update failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not update this project.' }, { status: 503 });
  }
}
