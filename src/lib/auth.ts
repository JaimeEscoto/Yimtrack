import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const COOKIE = 'yim_session';
const ALG = 'HS256';

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET not set');
  return new TextEncoder().encode(s);
}

export async function signSession(userId: string) {
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSession() {
  cookies().delete(COOKIE);
}

export async function getUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const id = await getUserId();
  if (!id) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error('UNAUTHORIZED');
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'admin') throw new Error('FORBIDDEN');
  return u;
}
