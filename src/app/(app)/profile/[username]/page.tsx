import { db } from '@/db/client';
import { users, workoutSessions, routines } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUserStats } from '@/lib/stats';
import StatsDashboard from '@/components/StatsDashboard';
import Avatar from '@/components/Avatar';
import { getCurrentUser } from '@/lib/auth';

export default async function Profile({ params }: { params: { username: string } }) {
  const me = await getCurrentUser();
  const [u] = await db.select().from(users)
    .where(eq(users.username, params.username.toLowerCase())).limit(1);
  if (!u) notFound();
  const isMe = me?.id === u.id;

  const stats = await getUserStats(u.id);

  const recent = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.userId, u.id), eq(workoutSessions.status, 'completed')))
    .orderBy(desc(workoutSessions.completedAt)).limit(10);

  const userRoutines = await db.select().from(routines)
    .where(isMe
      ? eq(routines.userId, u.id)
      : and(eq(routines.userId, u.id), eq(routines.isPublic, true)))
    .orderBy(desc(routines.createdAt)).limit(20);

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center gap-3 sm:gap-4">
        <Avatar username={u.username} avatarUrl={u.avatarUrl} size={64} />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold truncate">@{u.username}</h2>
          <p className="text-neutral-400 text-sm truncate">{u.displayName}</p>
          {u.bio && <p className="text-neutral-300 mt-2 text-sm break-words">{u.bio}</p>}
        </div>
        {isMe && <Link href="/profile/edit" className="btn-ghost w-full sm:w-auto">Editar perfil</Link>}
      </section>

      <StatsDashboard stats={stats} />

      <section className="card">
        <h3 className="font-semibold mb-3">Rutinas creadas {!isMe && '(públicas)'}</h3>
        {userRoutines.length === 0
          ? <p className="text-neutral-500 text-sm">Aún no hay rutinas.</p>
          : <ul className="space-y-2">
              {userRoutines.map(r => (
                <li key={r.id}>
                  <Link href={`/routines/${r.id}`} className="block border-b border-neutral-800 pb-2 hover:text-brand">
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-xs text-neutral-500">{r.focus} · ~{r.estimatedMinutes} min{!r.isPublic && ' · privada'}</div>
                  </Link>
                </li>
              ))}
            </ul>}
      </section>

      <section className="card">
        <h3 className="font-semibold mb-3">Sesiones recientes</h3>
        {recent.length === 0
          ? <p className="text-neutral-500 text-sm">Aún sin sesiones completadas.</p>
          : <ul className="space-y-1 text-sm">
              {recent.map(s => (
                <li key={s.id} className="flex justify-between border-b border-neutral-800 py-2">
                  <span className="capitalize">{s.focus}</span>
                  <span className="text-neutral-500 text-xs">
                    {s.completedAt && new Date(s.completedAt).toLocaleDateString()} · {s.actualMinutes ?? s.plannedMinutes} min
                  </span>
                </li>
              ))}
            </ul>}
      </section>
    </div>
  );
}
