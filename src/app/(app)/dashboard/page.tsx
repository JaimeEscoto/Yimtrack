import Link from 'next/link';
import { db } from '@/db/client';
import { workoutSessions } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';

export default async function Dashboard() {
  const user = await requireUser();
  const recent = await db.select().from(workoutSessions)
    .where(eq(workoutSessions.userId, user.id))
    .orderBy(desc(workoutSessions.startedAt)).limit(5);
  const completed = recent.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-xl font-semibold">Hola, {user.displayName ?? user.username} 👋</h2>
        <p className="text-neutral-400 mt-1">¿Qué entrenas hoy?</p>
        <Link href="/workout/today" className="btn-primary mt-4 inline-flex">Generar rutina</Link>
      </section>
      <section className="card">
        <h3 className="font-semibold mb-3">Últimas sesiones</h3>
        {recent.length === 0
          ? <p className="text-neutral-500 text-sm">Aún no has entrenado. ¡A por la primera!</p>
          : <ul className="divide-y divide-neutral-800">
              {recent.map(s => (
                <li key={s.id} className="py-2 flex justify-between text-sm">
                  <span>{s.focus} · {s.plannedMinutes} min</span>
                  <span className="text-neutral-500">{s.status}</span>
                </li>
              ))}
            </ul>}
        <p className="text-xs text-neutral-500 mt-3">{completed} sesiones completadas en total reciente.</p>
      </section>
    </div>
  );
}
