import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const Schema = z.object({
  displayName: z.string().min(1).max(40).optional(),
  bio: z.string().max(280).optional(),
  // data URL: data:image/jpeg;base64,XXXX  — limitamos a ~200KB
  avatarUrl: z.string().max(280_000).optional().nullable()
});

export async function PATCH(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });

  const patch: Record<string, any> = {};
  if (parsed.data.displayName !== undefined) patch.displayName = parsed.data.displayName;
  if (parsed.data.bio !== undefined) patch.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) patch.avatarUrl = parsed.data.avatarUrl;

  await db.update(users).set(patch).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
