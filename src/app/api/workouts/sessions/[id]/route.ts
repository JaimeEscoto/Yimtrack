import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { workoutSessions, sessionExercises, exercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const [session] = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.id, params.id), eq(workoutSessions.userId, user.id))).limit(1);
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const items = await db.select({
    id: sessionExercises.id,
    position: sessionExercises.position,
    plannedSets: sessionExercises.plannedSets,
    plannedReps: sessionExercises.plannedReps,
    restSeconds: sessionExercises.restSeconds,
    completedSets: sessionExercises.completedSets,
    completedReps: sessionExercises.completedReps,
    name: exercises.name,
    muscleGroups: exercises.muscleGroups
  })
  .from(sessionExercises)
  .innerJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
  .where(eq(sessionExercises.sessionId, session.id))
  .orderBy(sessionExercises.position);

  return NextResponse.json({ session, items });
}
