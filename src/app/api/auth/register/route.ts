import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { RegisterSchema } from '@/lib/validation';
import { signSession, setSessionCookie } from '@/lib/auth';
import { or, eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { username, email, password, displayName } = parsed.data;
  const existing = await db.select().from(users)
    .where(or(eq(users.username, username.toLowerCase()), eq(users.email, email.toLowerCase())))
    .limit(1);
  if (existing.length) {
    return NextResponse.json({ error: 'Username o email ya en uso' }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [u] = await db.insert(users).values({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    displayName: displayName || username
  }).returning();
  const token = await signSession(u.id);
  await setSessionCookie(token);
  return NextResponse.json({ id: u.id, username: u.username });
}
