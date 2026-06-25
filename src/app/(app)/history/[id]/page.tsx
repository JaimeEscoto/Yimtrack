import { db } from '@/db/client';
import { workoutSessions, sessionExercises, exercises } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ExerciseIcon from '@/components/ExerciseIcon';
import Link from 'next/link';

export default async function SessionDetail({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [session] = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.id, params.id), eq(workoutSessions.userId, user.id)))
    .limit(1);
  if (!session) notFound();

  const items = await db.select({
    id: sessionExercises.id,
    position: sessionExercises.position,
    name: exercises.name,
    muscleGroups: exercises.muscleGroups,
    plannedSets: sessionExercises.plannedSets,
    plannedReps: sessionExercises.plannedReps,
    restSeconds: sessionExercises.restSeconds,
    completedSets: sessionExercises.completedSets,
    completedReps: sessionExercises.completedReps,
    weightKg: sessionExercises.weightKg
  }).from(sessionExercises)
    .innerJoin(exercises, eq(exercises.id, sessionExercises.exerciseId))
    .where(eq(sessionExercises.sessionId, session.id))
    .orderBy(sessionExercises.position);

  return (
    <div className="space-y-4">
      <Link href="/history" className="text-sm text-neutral-400">← Historial</Link>
      <section className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold capitalize">{session.focus}</h2>
            <p className="text-sm text-neutral-400">
              {new Date(session.startedAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="capitalize text-sm">{session.status}</div>
            <div className="text-xs text-neutral-500">
              {session.actualMinutes ?? session.plannedMinutes} min
            </div>
          </div>
        </div>
      </section>

      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={it.id} className="card flex items-center gap-3">
            <ExerciseIcon muscleGroups={it.muscleGroups} size={48} />
            <div className="flex-1">
              <div className="font-medium">{i + 1}. {it.name}</div>
              <div className="text-xs text-neutral-500">{it.muscleGroups.join(' · ')}</div>
            </div>
            <div className="text-right text-sm">
              <div>{it.completedSets}/{it.plannedSets} sets · {it.completedReps} reps</div>
              {it.weightKg && <div className="text-xs text-neutral-500">{it.weightKg} kg</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
