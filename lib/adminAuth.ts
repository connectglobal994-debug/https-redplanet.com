import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'rp_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function verifyAdminPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_UPLOAD_PASSWORD;
  if (typeof candidate !== 'string' || !expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminSession(response: NextResponse) {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  const token = `${payload}.${sign(payload, secret)}`;
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function isAdminRequest(request: NextRequest): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return false;
  const expiresAt = Number(payload);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
