import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { workoutSessions } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const rows = await db.select().from(workoutSessions)
    .where(eq(workoutSessions.userId, user.id))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(50);
  return NextResponse.json(rows);
}
