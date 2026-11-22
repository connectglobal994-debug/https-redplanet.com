import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession, createAdminSession, verifyAdminPassword } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }
  const password = (body as { password?: unknown }).password;

  if (!process.env.ADMIN_UPLOAD_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: 'Admin authentication is not configured on this deployment.' },
      { status: 503 }
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  createAdminSession(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAdminSession(response);
  return response;
}
