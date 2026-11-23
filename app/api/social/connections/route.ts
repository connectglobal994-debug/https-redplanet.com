import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to view connected social accounts.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Social connections are not configured.' }, { status: 503 });
  try {
    const accounts = await supabaseAdmin<Record<string, unknown>[]>(
      `social_channels?owner_user_id=eq.${userId}&select=id,platform,account_label,status,scopes,connected_at,created_at&order=created_at.desc`
    );
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Social connection list failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load connected accounts.' }, { status: 503 });
  }
}
