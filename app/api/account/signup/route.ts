import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Account registration is not configured.' }, { status: 503 });

  let body: { email?: unknown; password?: unknown; fullName?: unknown };
  try { body = await request.json() as { email?: unknown; password?: unknown; fullName?: unknown }; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 120) : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128 || fullName.length < 2) {
    return NextResponse.json({ error: 'Provide your name, a valid email and a password of at least 8 characters.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body: JSON.stringify({ email, password, data: { full_name: fullName } }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json() as { access_token?: string; refresh_token?: string; expires_in?: number; msg?: string; message?: string };
    if (!upstream.ok) return NextResponse.json({ error: data.msg || data.message || 'Registration failed.' }, { status: upstream.status });
    const response = NextResponse.json({
      ok: true,
      confirmationRequired: !data.access_token,
      message: data.access_token ? 'Your account is ready.' : 'Check your email to confirm your account before signing in.',
    });
    if (data.access_token && data.refresh_token) {
      const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
      response.cookies.set('rp_access_token', data.access_token, { ...options, maxAge: Math.max(60, Math.min(data.expires_in ?? 3600, 3600)) });
      response.cookies.set('rp_refresh_token', data.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch {
    return NextResponse.json({ error: 'Account service is temporarily unavailable.' }, { status: 502 });
  }
}
