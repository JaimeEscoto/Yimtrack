import { db } from '@/db/client';
import { users, workoutSessions, userAchievements, achievements } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export default async function Profile({ params }: { params: { username: string } }) {
  const [u] = await db.select().from(users).where(eq(users.username, params.username.toLowerCase())).limit(1);
  if (!u) notFound();
  const completed = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.userId, u.id), eq(workoutSessions.status, 'completed')));
  const ach = await db.select({
    name: achievements.name, iconEmoji: achievements.iconEmoji, unlockedAt: userAchievements.unlockedAt
  }).from(userAchievements)
    .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
    .where(eq(userAchievements.userId, u.id));

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-2xl font-semibold">@{u.username}</h2>
        <p className="text-neutral-400">{u.displayName}</p>
        {u.bio && <p className="text-neutral-300 mt-2">{u.bio}</p>}
      </section>
      <section className="card">
        <h3 className="font-semibold">Estadísticas</h3>
        <p className="text-sm">Sesiones completadas: <span className="text-brand">{completed.length}</span></p>
      </section>
      <section className="card">
        <h3 className="font-semibold mb-2">Logros</h3>
        <div className="flex flex-wrap gap-3">
          {ach.length === 0 && <p className="text-neutral-500 text-sm">Aún sin logros.</p>}
          {ach.map(a => (
            <div key={a.name} className="text-center">
              <div className="text-3xl">{a.iconEmoji}</div>
              <div className="text-xs">{a.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
