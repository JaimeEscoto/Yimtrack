import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { conversations, messages, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { asc, eq } from 'drizzle-orm';
import { getOrCreateConversation } from '@/lib/chat';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SendSchema = z.object({ body: z.string().min(1).max(1000) });

async function findOther(username: string) {
  const [other] = await db.select().from(users)
    .where(eq(users.username, username.toLowerCase())).limit(1);
  return other ?? null;
}

export async function GET(req: Request, { params }: { params: { username: string } }) {
  let me;
  try { me = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const other = await findOther(params.username);
  if (!other) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (other.id === me.id) return NextResponse.json({ error: 'self' }, { status: 400 });

  const conv = await getOrCreateConversation(me.id, other.id);
  const rows = await db.select().from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(asc(messages.createdAt))
    .limit(200);

  return NextResponse.json({
    other: {
      id: other.id, username: other.username,
      displayName: other.displayName, avatarUrl: other.avatarUrl
    },
    messages: rows.map(m => ({
      id: m.id, body: m.body, createdAt: m.createdAt, fromMe: m.senderId === me.id
    }))
  });
}

export async function POST(req: Request, { params }: { params: { username: string } }) {
  let me;
  try { me = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const other = await findOther(params.username);
  if (!other) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (other.id === me.id) return NextResponse.json({ error: 'self' }, { status: 400 });

  const parsed = SendSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });

  const conv = await getOrCreateConversation(me.id, other.id);
  const [msg] = await db.insert(messages).values({
    conversationId: conv.id,
    senderId: me.id,
    body: parsed.data.body
  }).returning();
  await db.update(conversations).set({ lastMessageAt: msg.createdAt })
    .where(eq(conversations.id, conv.id));

  return NextResponse.json({
    id: msg.id, body: msg.body, createdAt: msg.createdAt, fromMe: true
  });
}
