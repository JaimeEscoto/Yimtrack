import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { contacts } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  await db.update(contacts).set({ status: 'accepted' })
    .where(and(eq(contacts.id, params.id), eq(contacts.addresseeId, user.id)));
  return NextResponse.json({ ok: true });
}
