import { db } from '@/db/client';
import { conversations } from '@/db/schema';
import { and, eq, or } from 'drizzle-orm';

export function pairKey(a: string, b: string) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

export async function getOrCreateConversation(meId: string, otherId: string) {
  const pair = pairKey(meId, otherId);
  const [existing] = await db.select().from(conversations)
    .where(and(eq(conversations.userAId, pair.userAId), eq(conversations.userBId, pair.userBId)))
    .limit(1);
  if (existing) return existing;
  const [created] = await db.insert(conversations).values(pair).returning();
  return created;
}
