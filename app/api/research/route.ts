import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to access your research workspace.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Research services are not configured.' }, { status: 503 });
  try {
    const [owned, memberships] = await Promise.all([
      supabaseAdmin<Record<string, unknown>[]>(`research_projects?owner_user_id=eq.${userId}&select=id,title,research_question,status,created_at,updated_at`),
      supabaseAdmin<Record<string, unknown>[]>(`research_project_members?user_id=eq.${userId}&select=project_id,member_role`),
    ]);
    const ids = [...new Set([...owned.map((p) => String(p.id)), ...memberships.map((m) => String(m.project_id))])];
    if (!ids.length) return NextResponse.json({ projects: [] });
    const projects = await supabaseAdmin<Record<string, unknown>[]>(
      `research_projects?id=in.(${ids.join(',')})&select=id,owner_user_id,title,research_question,status,created_at,updated_at&order=updated_at.desc`
    );
    const roles = new Map(memberships.map((m) => [String(m.project_id), String(m.member_role)]));
    return NextResponse.json({ projects: projects.map((p) => ({ ...p, access_role: p.owner_user_id === userId ? 'owner' : roles.get(String(p.id)) || 'viewer' })) });
  } catch (error) {
    console.error('Research projects load failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load research projects.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to create a research project.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Research services are not configured.' }, { status: 503 });
  let body: { title?: unknown; researchQuestion?: unknown };
  try { body = await request.json() as { title?: unknown; researchQuestion?: unknown }; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const title = clean(body.title, 180);
  const researchQuestion = clean(body.researchQuestion, 5000);
  if (title.length < 3 || researchQuestion.length < 10) {
    return NextResponse.json({ error: 'Enter a project title and a research question of at least 10 characters.' }, { status: 400 });
  }
  try {
    const rows = await supabaseAdmin<Record<string, unknown>[]>('research_projects', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ owner_user_id: userId, title, research_question: researchQuestion }),
    });
    return NextResponse.json({ ok: true, project: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Research project create failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not create the project. Confirm the unified platform migration is applied.' }, { status: 503 });
  }
}
