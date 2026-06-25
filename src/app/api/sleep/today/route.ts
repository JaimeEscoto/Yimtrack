import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sleepLogs } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const today = todayKey();
  const [row] = await db.select().from(sleepLogs)
    .where(and(eq(sleepLogs.userId, user.id), eq(sleepLogs.logDate, today)))
    .limit(1);
  return NextResponse.json({
    date: today,
    sleepTime: row?.sleepTime ?? null,
    wakeTime: row?.wakeTime ?? null,
    needsPrompt: !row || !row.sleepTime || !row.wakeTime
  });
}
