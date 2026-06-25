import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { achievements, userAchievements } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const all = await db.select().from(achievements);
  const owned = await db.select().from(userAchievements).where(eq(userAchievements.userId, user.id));
  const ownedMap = new Map(owned.map(o => [o.achievementId, o.unlockedAt]));
  return NextResponse.json(all.map(a => ({
    ...a,
    unlockedAt: ownedMap.get(a.id) ?? null
  })));
}
