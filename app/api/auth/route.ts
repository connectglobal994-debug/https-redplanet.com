import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, verifyAdminPassword } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!process.env.ADMIN_UPLOAD_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: 'Admin authentication is not configured on this deployment.' },
      { status: 503 }
    );
  }

  if (!verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  createAdminSession(response);
  return response;
}
