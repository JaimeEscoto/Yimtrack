import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sleepLogs } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/;
const Schema = z.object({
  sleepTime: z.string().regex(HHMM).optional().nullable(),
  wakeTime: z.string().regex(HHMM).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const rows = await db.select().from(sleepLogs)
    .where(eq(sleepLogs.userId, user.id))
    .orderBy(desc(sleepLogs.logDate))
    .limit(30);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });

  const logDate = parsed.data.date ?? todayKey();

  const [existing] = await db.select().from(sleepLogs)
    .where(and(eq(sleepLogs.userId, user.id), eq(sleepLogs.logDate, logDate)))
    .limit(1);

  if (existing) {
    await db.update(sleepLogs).set({
      sleepTime: parsed.data.sleepTime ?? existing.sleepTime,
      wakeTime: parsed.data.wakeTime ?? existing.wakeTime
    }).where(eq(sleepLogs.id, existing.id));
  } else {
    await db.insert(sleepLogs).values({
      userId: user.id,
      logDate,
      sleepTime: parsed.data.sleepTime ?? null,
      wakeTime: parsed.data.wakeTime ?? null
    });
  }
  return NextResponse.json({ ok: true });
}
