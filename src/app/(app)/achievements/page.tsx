import { db } from '@/db/client';
import { achievements, userAchievements } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export default async function AchievementsPage() {
  const user = await requireUser();
  const all = await db.select().from(achievements);
  const owned = await db.select().from(userAchievements).where(eq(userAchievements.userId, user.id));
  const ownedMap = new Map(owned.map(o => [o.achievementId, o.unlockedAt]));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Logros</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {all.map(a => {
          const unlocked = ownedMap.get(a.id);
          return (
            <div key={a.id} className={`card text-center ${unlocked ? '' : 'opacity-50'}`}>
              <div className="text-4xl">{a.iconEmoji}</div>
              <div className="font-medium mt-2">{a.name}</div>
              <div className="text-xs text-neutral-500">{a.description}</div>
              {unlocked && <div className="text-xs text-brand mt-1">Desbloqueado</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
