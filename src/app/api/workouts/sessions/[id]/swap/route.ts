import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sessionExercises, workoutSessions, exercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { and, eq, notInArray, sql } from 'drizzle-orm';

const Schema = z.object({
  itemId: z.string().uuid(),
  excludeIds: z.array(z.string().uuid()).default([])
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });

  // Verifica que la sesión sea del usuario y esté en progreso
  const [session] = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.id, params.id), eq(workoutSessions.userId, user.id)))
    .limit(1);
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (session.status !== 'in_progress') {
    return NextResponse.json({ error: 'session_not_active' }, { status: 409 });
  }

  // Item actual + ejercicio original
  const [item] = await db.select().from(sessionExercises)
    .where(and(eq(sessionExercises.id, parsed.data.itemId), eq(sessionExercises.sessionId, session.id)))
    .limit(1);
  if (!item) return NextResponse.json({ error: 'item_not_found' }, { status: 404 });

  const [original] = await db.select().from(exercises).where(eq(exercises.id, item.exerciseId)).limit(1);
  if (!original) return NextResponse.json({ error: 'orig_not_found' }, { status: 404 });

  // Excluir: el original, los que ya están en la sesión, y los rechazados
  const inSession = await db.select({ exerciseId: sessionExercises.exerciseId })
    .from(sessionExercises).where(eq(sessionExercises.sessionId, session.id));
  const exclude = [...new Set([
    original.id,
    ...inSession.map(r => r.exerciseId),
    ...parsed.data.excludeIds
  ])];

  const candidates = await db.select().from(exercises).where(
    and(
      eq(exercises.isPublic, true),
      notInArray(exercises.id, exclude),
      sql`${exercises.muscleGroups} && ARRAY[${sql.join(
        original.muscleGroups.map(m => sql`${m}`), sql`, `
      )}]::text[]`
    )
  );
  if (!candidates.length) return NextResponse.json({ error: 'no_alternative' }, { status: 404 });

  const scored = candidates.map(c => {
    const overlap = c.muscleGroups.filter(m => original.muscleGroups.includes(m)).length;
    const diffPenalty = Math.abs(c.difficulty - original.difficulty);
    return { c, score: overlap * 10 - diffPenalty };
  }).sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3);
  const pick = top[Math.floor(Math.random() * top.length)].c;

  // Actualiza el item de la sesión. Mantiene los sets/reps/rest planificados originalmente.
  await db.update(sessionExercises).set({
    exerciseId: pick.id,
    completedSets: 0,
    completedReps: 0
  }).where(eq(sessionExercises.id, item.id));

  return NextResponse.json({
    id: item.id,
    exerciseId: pick.id,
    name: pick.name,
    muscleGroups: pick.muscleGroups,
    plannedSets: item.plannedSets,
    plannedReps: item.plannedReps,
    restSeconds: item.restSeconds,
    completedSets: 0,
    completedReps: 0,
    position: item.position
  });
}
