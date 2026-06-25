import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { contacts } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';

const Schema = z.object({ addresseeId: z.string().uuid() });

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });
  if (parsed.data.addresseeId === user.id) return NextResponse.json({ error: 'self' }, { status: 400 });
  const [c] = await db.insert(contacts).values({
    requesterId: user.id,
    addresseeId: parsed.data.addresseeId,
    status: 'pending'
  }).onConflictDoNothing().returning();
  return NextResponse.json(c ?? { ok: true });
}
