import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { workoutSessions, sessionExercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { evaluateAchievements } from '@/lib/achievements';

const CompleteSchema = z.object({
  actualMinutes: z.number().int().min(1).max(300),
  exercises: z.array(z.object({
    id: z.string().uuid(),
    completedSets: z.number().int().min(0).max(20),
    completedReps: z.number().int().min(0).max(2000),
    weightKg: z.number().min(0).max(1000).optional()
  })).default([])
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = CompleteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [session] = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.id, params.id), eq(workoutSessions.userId, user.id))).limit(1);
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await db.update(workoutSessions).set({
    status: 'completed',
    actualMinutes: parsed.data.actualMinutes,
    completedAt: new Date()
  }).where(eq(workoutSessions.id, session.id));

  for (const ex of parsed.data.exercises) {
    await db.update(sessionExercises).set({
      completedSets: ex.completedSets,
      completedReps: ex.completedReps,
      weightKg: ex.weightKg != null ? String(ex.weightKg) : null
    }).where(and(eq(sessionExercises.id, ex.id), eq(sessionExercises.sessionId, session.id)));
  }

  const unlocked = await evaluateAchievements(user.id);
  return NextResponse.json({ ok: true, unlocked });
}
