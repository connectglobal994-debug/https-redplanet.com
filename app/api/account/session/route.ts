import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const baseUrl = () => process.env.SUPABASE_URL?.replace(/\/$/, '');
const anonKey = () => process.env.SUPABASE_ANON_KEY;
const accessCookie = 'rp_access_token';
const refreshCookie = 'rp_refresh_token';

function setSessionCookies(response: NextResponse, accessToken: string, refreshToken: string, expiresIn: number) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  response.cookies.set(accessCookie, accessToken, { ...options, maxAge: Math.max(60, Math.min(expiresIn, 3600)) });
  response.cookies.set(refreshCookie, refreshToken, { ...options, maxAge: 60 * 60 * 24 * 30 });
}

function clearSessionCookies(response: NextResponse) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 0 };
  response.cookies.set(accessCookie, '', options);
  response.cookies.set(refreshCookie, '', options);
}

export async function POST(request: NextRequest) {
  if (!baseUrl() || !anonKey()) {
    return NextResponse.json({ error: 'Account authentication is not configured.' }, { status: 503 });
  }
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json() as { email?: unknown; password?: unknown }; }
  catch { return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 }); }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: 'Enter a valid email and a password of at least 8 characters.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${baseUrl()}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey()! },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json() as { access_token?: string; refresh_token?: string; expires_in?: number; user?: { id?: string }; msg?: string; message?: string; error_description?: string };
    if (!upstream.ok || !data.access_token || !data.refresh_token) {
      return NextResponse.json({ error: data.error_description || data.msg || data.message || 'Sign-in failed. Check your credentials and email verification.' }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true, user: { id: data.user?.id } });
    setSessionCookies(response, data.access_token, data.refresh_token, data.expires_in ?? 3600);
    return response;
  } catch {
    return NextResponse.json({ error: 'Account service is temporarily unavailable.' }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(accessCookie)?.value;
  if (!token || !baseUrl() || !anonKey()) return NextResponse.json({ authenticated: false }, { status: 200 });
  try {
    const upstream = await fetch(`${baseUrl()}/auth/v1/user`, {
      headers: { apikey: anonKey()!, Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) return NextResponse.json({ authenticated: false }, { status: 200 });
    const user = await upstream.json() as { id?: string; email?: string };
    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(accessCookie)?.value;
  if (token && baseUrl() && anonKey()) {
    await fetch(`${baseUrl()}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: anonKey()!, Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => undefined);
  }
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
