import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'A JSON object is required.' }, { status: 400 });
  }
  const input = body as { name?: unknown; email?: unknown; privacyConsent?: unknown; website?: unknown };
  if (typeof input.website === 'string' && input.website.trim()) {
    return NextResponse.json({ ok: true, message: 'Request received.' });
  }
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: 'Enter a name between 2 and 100 characters.' }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (input.privacyConsent !== true) {
    return NextResponse.json({ error: 'Please agree to the privacy notice before joining.' }, { status: 400 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Membership registration is temporarily unavailable. Please try again later.' }, { status: 503 });
  }
  try {
    await supabaseAdmin('membership_leads?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ full_name: name, email, privacy_consent_at: new Date().toISOString(), source: 'website' }),
    });
    return NextResponse.json({ ok: true, message: 'Your request has been received.' });
  } catch (error) {
    console.error('Membership intake failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not save your request. Please try again later.' }, { status: 500 });
  }
}
