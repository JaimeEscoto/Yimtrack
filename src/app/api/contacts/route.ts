import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { contacts, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { or, eq, and } from 'drizzle-orm';

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const rows = await db.select({
    id: contacts.id,
    status: contacts.status,
    requesterId: contacts.requesterId,
    addresseeId: contacts.addresseeId,
    otherUsername: users.username,
    otherDisplayName: users.displayName,
    otherAvatarUrl: users.avatarUrl
  }).from(contacts)
    .innerJoin(users, or(
      and(eq(contacts.requesterId, user.id), eq(users.id, contacts.addresseeId)),
      and(eq(contacts.addresseeId, user.id), eq(users.id, contacts.requesterId))
    ))
    .where(or(eq(contacts.requesterId, user.id), eq(contacts.addresseeId, user.id)));
  return NextResponse.json(rows);
}
