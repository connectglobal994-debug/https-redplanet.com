import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/supabaseUser';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in to view your publishing queue.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Social publishing is not configured.' }, { status: 503 });
  try {
    const channels = await supabaseAdmin<Record<string, unknown>[]>(
      `social_channels?owner_user_id=eq.${userId}&select=id,platform,account_label,status`
    );
    const ids = channels.map((channel) => String(channel.id));
    if (!ids.length) return NextResponse.json({ queue: [], channels: [] });
    const queue = await supabaseAdmin<Record<string, unknown>[]>(
      `social_publish_jobs?channel_id=in.(${ids.join(',')})&select=id,channel_id,caption,scheduled_at,status,created_at,last_error&order=created_at.desc&limit=100`
    );
    const channelById = new Map(channels.map((channel) => [String(channel.id), channel]));
    return NextResponse.json({ queue: queue.map((item) => ({ ...item, channel: channelById.get(String(item.channel_id)) ?? null })), channels });
  } catch (error) {
    console.error('Social publishing queue load failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load the publishing queue.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Sign in before creating social content.' }, { status: 401 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ error: 'Social publishing is not configured.' }, { status: 503 });
  let body: { channelId?: unknown; caption?: unknown; scheduledAt?: unknown; mediaAssetId?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }
  const channelId = clean(body.channelId, 64);
  const caption = clean(body.caption, 5000);
  const scheduledAt = clean(body.scheduledAt, 40);
  const mediaAssetId = clean(body.mediaAssetId, 64);
  if (!UUID.test(channelId) || caption.length < 1) {
    return NextResponse.json({ error: 'Choose a connected channel and provide a caption.' }, { status: 400 });
  }
  if (scheduledAt && (Number.isNaN(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now())) {
    return NextResponse.json({ error: 'Choose a valid future schedule time.' }, { status: 400 });
  }
  if (mediaAssetId && !UUID.test(mediaAssetId)) return NextResponse.json({ error: 'Invalid media asset identifier.' }, { status: 400 });

  try {
    const channels = await supabaseAdmin<Record<string, unknown>[]>(
      `social_channels?id=eq.${channelId}&owner_user_id=eq.${userId}&select=id,status&limit=1`
    );
    if (!channels[0]) return NextResponse.json({ error: 'Social channel not found or access denied.' }, { status: 404 });
    if (channels[0].status !== 'connected') return NextResponse.json({ error: 'Connect and verify this social account before submitting content.' }, { status: 409 });
    if (mediaAssetId) {
      const assets = await supabaseAdmin<Record<string, unknown>[]>(
        `media_assets?id=eq.${mediaAssetId}&owner_user_id=eq.${userId}&select=id&limit=1`
      );
      if (!assets[0]) return NextResponse.json({ error: 'Media asset not found or not owned by this account.' }, { status: 404 });
    }
    const rows = await supabaseAdmin<Record<string, unknown>[]>('social_publish_jobs', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        channel_id: channelId,
        media_asset_id: mediaAssetId || null,
        caption,
        scheduled_at: scheduledAt || null,
        status: 'awaiting_approval',
      }),
    });
    return NextResponse.json({ ok: true, item: rows[0], message: 'Submitted for approval. Publishing is not automatic until an approved provider worker is configured.' }, { status: 201 });
  } catch (error) {
    console.error('Social content submission failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not submit this content for approval.' }, { status: 503 });
  }
}
