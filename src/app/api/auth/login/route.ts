import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { LoginSchema } from '@/lib/validation';
import { signSession, setSessionCookie } from '@/lib/auth';
import { or, eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const id = parsed.data.identifier.toLowerCase();
  const [u] = await db.select().from(users)
    .where(or(eq(users.username, id), eq(users.email, id)))
    .limit(1);
  if (!u) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  const ok = await bcrypt.compare(parsed.data.password, u.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  const token = await signSession(u.id);
  await setSessionCookie(token);
  return NextResponse.json({ id: u.id, username: u.username });
}
