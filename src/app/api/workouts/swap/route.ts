import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { and, eq, notInArray, sql } from 'drizzle-orm';

const Schema = z.object({
  exerciseId: z.string().uuid(),
  excludeIds: z.array(z.string().uuid()).default([])
});

export async function POST(req: Request) {
  try { await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad' }, { status: 400 });

  const [original] = await db.select().from(exercises)
    .where(eq(exercises.id, parsed.data.exerciseId)).limit(1);
  if (!original) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const exclude = [...new Set([parsed.data.exerciseId, ...parsed.data.excludeIds])];

  // Buscar candidatos que compartan al menos un grupo muscular
  const candidates = await db.select().from(exercises).where(
    and(
      eq(exercises.isPublic, true),
      notInArray(exercises.id, exclude),
      sql`${exercises.muscleGroups} && ARRAY[${sql.join(
        original.muscleGroups.map(m => sql`${m}`), sql`, `
      )}]::text[]`
    )
  );

  if (!candidates.length) {
    return NextResponse.json({ error: 'no_alternative' }, { status: 404 });
  }

  // Puntaje: + por cada grupo muscular en común, - por diferencia de dificultad
  const scored = candidates.map(c => {
    const overlap = c.muscleGroups.filter(m => original.muscleGroups.includes(m)).length;
    const diffPenalty = Math.abs(c.difficulty - original.difficulty);
    return { c, score: overlap * 10 - diffPenalty };
  }).sort((a, b) => b.score - a.score);

  // Tomamos el top 3 y elegimos uno al azar para no devolver siempre el mismo
  const top = scored.slice(0, 3);
  const pick = top[Math.floor(Math.random() * top.length)].c;

  return NextResponse.json({
    exerciseId: pick.id,
    name: pick.name,
    muscleGroups: pick.muscleGroups,
    sets: pick.defaultSets,
    reps: pick.defaultReps,
    restSeconds: pick.defaultRestSeconds,
    estimatedSeconds: pick.defaultSets * pick.secondsPerSet +
                       (pick.defaultSets - 1) * pick.defaultRestSeconds
  });
}
