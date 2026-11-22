import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validUrl = (value: string) => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:'; }
  catch { return false; }
};

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'AI knowledge database is not configured.' }, { status: 503 });
  const params = new URLSearchParams({ select: 'id,title,category,tags,source_type,source_name,source_url,rights_basis,status,created_at,updated_at', order: 'updated_at.desc', limit: '100' });
  try {
    const items = await supabaseAdmin<Record<string, unknown>[]>(`rp_ai_knowledge?${params.toString()}`);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Could not load the AI knowledge library.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'AI knowledge database is not configured.' }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }

  const title = clean(body.title, 180);
  const content = clean(body.body, 30000);
  const category = clean(body.category, 80) || 'General';
  const sourceType = body.sourceType === 'approved_source' ? 'approved_source' : 'manual';
  const sourceName = clean(body.sourceName, 160);
  const sourceUrl = clean(body.sourceUrl, 2048);
  const rightsBasis = clean(body.rightsBasis, 500);
  const status = body.status === 'published' ? 'published' : 'draft';
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim().slice(0, 40)).filter(Boolean).slice(0, 20)
    : [];

  if (title.length < 3 || content.length < 30) return NextResponse.json({ error: 'Provide a title and at least 30 characters of knowledge content.' }, { status: 400 });
  if (!rightsBasis || !body.rightsConfirmed) return NextResponse.json({ error: 'Confirm you have permission to store and use this material.' }, { status: 400 });
  if (!validUrl(sourceUrl)) return NextResponse.json({ error: 'Source URL must use HTTPS.' }, { status: 400 });

  try {
    const rows = await supabaseAdmin<Record<string, unknown>[]>('rp_ai_knowledge', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        title, body: content, category, tags, source_type: sourceType,
        source_name: sourceName || null, source_url: sourceUrl || null,
        rights_basis: rightsBasis, status, updated_at: new Date().toISOString(),
      }),
    });
    return NextResponse.json({ ok: true, item: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('AI knowledge save failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not save the knowledge item. Apply the AI knowledge migration first.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'AI knowledge database is not configured.' }, { status: 503 });
  let body: { id?: unknown; status?: unknown };
  try { body = await request.json() as { id?: unknown; status?: unknown }; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const id = clean(body.id, 64);
  const status = body.status;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      !['draft','published','archived'].includes(String(status))) {
    return NextResponse.json({ error: 'A valid item ID and status are required.' }, { status: 400 });
  }
  try {
    const rows = await supabaseAdmin<Record<string, unknown>[]>(`rp_ai_knowledge?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    if (!rows[0]) return NextResponse.json({ error: 'Knowledge item not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Could not update the knowledge item.' }, { status: 503 });
  }
}
