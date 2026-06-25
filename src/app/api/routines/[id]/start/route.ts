import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { routines, routineItems, workoutSessions, sessionExercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }

  const [routine] = await db.select().from(routines).where(eq(routines.id, params.id)).limit(1);
  if (!routine) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!routine.isPublic && routine.userId !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const items = await db.select().from(routineItems)
    .where(eq(routineItems.routineId, routine.id))
    .orderBy(routineItems.position);

  const [session] = await db.insert(workoutSessions).values({
    userId: user.id,
    gymId: user.primaryGymId ?? null,
    routineId: routine.id,
    focus: routine.focus,
    plannedMinutes: routine.estimatedMinutes,
    status: 'in_progress'
  }).returning();

  if (items.length) {
    await db.insert(sessionExercises).values(items.map((it, idx) => ({
      sessionId: session.id,
      exerciseId: it.exerciseId,
      position: idx,
      plannedSets: it.sets,
      plannedReps: it.reps,
      restSeconds: it.restSeconds
    })));
  }

  return NextResponse.json({ id: session.id });
}
