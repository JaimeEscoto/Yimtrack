import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { conversations, messages, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { desc, eq, or, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  let me;
  try { me = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }

  const rows = await db.select({
    id: conversations.id,
    lastMessageAt: conversations.lastMessageAt,
    userAId: conversations.userAId,
    userBId: conversations.userBId
  })
    .from(conversations)
    .where(or(eq(conversations.userAId, me.id), eq(conversations.userBId, me.id)))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(50);

  const out = await Promise.all(rows.map(async c => {
    const otherId = c.userAId === me.id ? c.userBId : c.userAId;
    const [other] = await db.select({
      id: users.id, username: users.username,
      displayName: users.displayName, avatarUrl: users.avatarUrl
    }).from(users).where(eq(users.id, otherId)).limit(1);

    const [last] = await db.select({ body: messages.body, createdAt: messages.createdAt, senderId: messages.senderId })
      .from(messages)
      .where(eq(messages.conversationId, c.id))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    return {
      id: c.id,
      lastMessageAt: c.lastMessageAt,
      other,
      lastMessage: last ? { body: last.body, createdAt: last.createdAt, fromMe: last.senderId === me.id } : null
    };
  }));

  return NextResponse.json(out);
}
