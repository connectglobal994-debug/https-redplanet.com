import { NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ platforms: [], status: 'not_configured' }, { status: 503 });
  try {
    const platforms = await supabaseAdmin<Record<string, unknown>[]>(
      'social_platform_catalog?select=platform,display_name,integration_status,connection_method,supports_publishing,supports_inbox,notes&order=display_name.asc'
    );
    return NextResponse.json({ platforms, status: 'ok' });
  } catch (error) {
    console.error('Social platform catalog load failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ platforms: [], status: 'unavailable' }, { status: 503 });
  }
}
