import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { routines, routineItems, exercises, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }

  const [routine] = await db.select({
    id: routines.id,
    name: routines.name,
    focus: routines.focus,
    estimatedMinutes: routines.estimatedMinutes,
    isPublic: routines.isPublic,
    userId: routines.userId,
    authorUsername: users.username
  }).from(routines)
    .innerJoin(users, eq(users.id, routines.userId))
    .where(eq(routines.id, params.id))
    .limit(1);

  if (!routine) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const items = await db.select({
    id: routineItems.id,
    exerciseId: routineItems.exerciseId,
    position: routineItems.position,
    sets: routineItems.sets,
    reps: routineItems.reps,
    restSeconds: routineItems.restSeconds,
    notes: routineItems.notes,
    name: exercises.name,
    muscleGroups: exercises.muscleGroups
  }).from(routineItems)
    .innerJoin(exercises, eq(exercises.id, routineItems.exerciseId))
    .where(eq(routineItems.routineId, routine.id))
    .orderBy(routineItems.position);

  return NextResponse.json({ routine, items });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  await db.delete(routines).where(and(eq(routines.id, params.id), eq(routines.userId, user.id)));
  return NextResponse.json({ ok: true });
}
