import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const Schema = z.object({ gymId: z.string().uuid() });

export async function PUT(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });
  await db.update(users).set({ primaryGymId: parsed.data.gymId }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
