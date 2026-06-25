import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Focus } from './validation';

const FOCUS_MUSCLES: Record<Focus, string[]> = {
  upper: ['chest','back','shoulders','biceps','triceps'],
  lower: ['quads','hamstrings','glutes','calves'],
  push:  ['chest','shoulders','triceps'],
  pull:  ['back','biceps'],
  full:  ['chest','back','quads','glutes','shoulders','core'],
  cardio:['cardio'],
  mixed: ['chest','back','quads','glutes','core','cardio'],
  core:  ['core']
};

export type ProposalItem = {
  exerciseId: string;
  name: string;
  muscleGroups: string[];
  sets: number;
  reps: number;
  restSeconds: number;
  estimatedSeconds: number;
};

export type Proposal = {
  focus: Focus;
  durationMin: number;
  estimatedMinutes: number;
  items: ProposalItem[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function generateProposal(focus: Focus, durationMin: number): Promise<Proposal> {
  const muscles = FOCUS_MUSCLES[focus];
  const pool = await db.select().from(exercises).where(
    sql`${exercises.isPublic} = true AND ${exercises.muscleGroups} && ARRAY[${sql.join(muscles.map(m => sql`${m}`), sql`, `)}]::text[]`
  );

  // priorizar compound (más grupos musculares) primero, luego variar
  const compound = pool.filter(e => e.muscleGroups.length >= 2);
  const isolation = pool.filter(e => e.muscleGroups.length < 2);
  const ordered = [...shuffle(compound), ...shuffle(isolation)];

  const budget = durationMin * 60;
  const items: ProposalItem[] = [];
  let used = 0;
  const seenMuscles = new Set<string>();

  for (const ex of ordered) {
    const sets = ex.defaultSets;
    const reps = ex.defaultReps;
    const rest = ex.defaultRestSeconds;
    const perSet = ex.secondsPerSet;
    const est = sets * perSet + (sets - 1) * rest;
    if (used + est > budget && items.length >= 3) break;
    // Evitar repetir el mismo grupo muscular dominante demasiado pronto
    const dominant = ex.muscleGroups[0];
    if (seenMuscles.has(dominant) && items.length < muscles.length) continue;
    items.push({
      exerciseId: ex.id,
      name: ex.name,
      muscleGroups: ex.muscleGroups,
      sets, reps, restSeconds: rest,
      estimatedSeconds: est
    });
    ex.muscleGroups.forEach(m => seenMuscles.add(m));
    used += est;
    if (used >= budget) break;
    if (items.length >= 8) break;
  }

  return {
    focus,
    durationMin,
    estimatedMinutes: Math.round(used / 60),
    items
  };
}
