import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { workoutSessions, sessionExercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { FOCUS_OPTIONS } from '@/lib/validation';

const StartSchema = z.object({
  focus: z.enum(FOCUS_OPTIONS),
  durationMin: z.number().int().min(5).max(180),
  items: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().min(1).max(10),
    reps: z.number().int().min(1).max(100),
    restSeconds: z.number().int().min(0).max(600)
  })).min(1).max(20)
});

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const body = await req.json();
  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [session] = await db.insert(workoutSessions).values({
    userId: user.id,
    gymId: user.primaryGymId ?? null,
    focus: parsed.data.focus,
    plannedMinutes: parsed.data.durationMin,
    status: 'in_progress'
  }).returning();

  await db.insert(sessionExercises).values(
    parsed.data.items.map((it, idx) => ({
      sessionId: session.id,
      exerciseId: it.exerciseId,
      position: idx,
      plannedSets: it.sets,
      plannedReps: it.reps,
      restSeconds: it.restSeconds
    }))
  );

  return NextResponse.json({ id: session.id });
}
