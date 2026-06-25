import Link from 'next/link';
import { db } from '@/db/client';
import { workoutSessions } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { getUserStats } from '@/lib/stats';
import StatsDashboard from '@/components/StatsDashboard';
import Avatar from '@/components/Avatar';
import SleepCard from '@/components/SleepCard';

export default async function Dashboard() {
  const user = await requireUser();
  const stats = await getUserStats(user.id);
  const recent = await db.select().from(workoutSessions)
    .where(eq(workoutSessions.userId, user.id))
    .orderBy(desc(workoutSessions.startedAt)).limit(5);

  return (
    <div className="space-y-6">
      <section className="card flex items-center gap-4">
        <Avatar username={user.username} avatarUrl={user.avatarUrl} size={64} />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Hola, {user.displayName ?? user.username} 👋</h2>
          <p className="text-neutral-400 text-sm">¿Qué entrenas hoy?</p>
        </div>
        <Link href="/workout/today" className="btn-primary">Generar rutina</Link>
      </section>

      <StatsDashboard stats={stats} />

      <SleepCard userId={user.id} />

      <section className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Últimas sesiones</h3>
          <Link href="/history" className="text-xs text-brand">Ver todo</Link>
        </div>
        {recent.length === 0
          ? <p className="text-neutral-500 text-sm">Aún no has entrenado.</p>
          : <ul className="divide-y divide-neutral-800">
              {recent.map(s => (
                <li key={s.id}>
                  <Link href={`/history/${s.id}`} className="py-2 flex justify-between text-sm hover:text-brand">
                    <span className="capitalize">{s.focus} · {s.plannedMinutes} min</span>
                    <span className="text-neutral-500">{s.status}</span>
                  </Link>
                </li>
              ))}
            </ul>}
      </section>
    </div>
  );
}
