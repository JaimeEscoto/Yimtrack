import { db } from '@/db/client';
import { achievements, userAchievements, workoutSessions } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';

type Rule =
  | { type: 'sessions_count'; threshold: number }
  | { type: 'streak_days'; threshold: number }
  | { type: 'focus_sessions'; focus: string; threshold: number };

export async function evaluateAchievements(userId: string) {
  const allAchievements = await db.select().from(achievements);
  const already = await db.select({ id: userAchievements.achievementId })
    .from(userAchievements).where(eq(userAchievements.userId, userId));
  const ownedIds = new Set(already.map(a => a.id));

  const sessions = await db.select({
    focus: workoutSessions.focus,
    completedAt: workoutSessions.completedAt
  }).from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, 'completed')));

  const total = sessions.length;
  const byFocus = new Map<string, number>();
  for (const s of sessions) {
    byFocus.set(s.focus, (byFocus.get(s.focus) ?? 0) + 1);
  }
  const days = new Set(sessions
    .filter(s => s.completedAt)
    .map(s => s.completedAt!.toISOString().slice(0, 10)));
  const streak = longestStreak([...days].sort());

  const unlocked: { code: string; name: string; iconEmoji: string | null }[] = [];

  for (const a of allAchievements) {
    if (ownedIds.has(a.id)) continue;
    const rule = a.rule as Rule;
    let pass = false;
    if (rule.type === 'sessions_count') pass = total >= rule.threshold;
    else if (rule.type === 'focus_sessions') pass = (byFocus.get(rule.focus) ?? 0) >= rule.threshold;
    else if (rule.type === 'streak_days') pass = streak >= rule.threshold;

    if (pass) {
      await db.insert(userAchievements).values({ userId, achievementId: a.id }).onConflictDoNothing();
      unlocked.push({ code: a.code, name: a.name, iconEmoji: a.iconEmoji });
    }
  }
  return unlocked;
}

function longestStreak(daysSorted: string[]): number {
  if (!daysSorted.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < daysSorted.length; i++) {
    const prev = new Date(daysSorted[i - 1]);
    const curD = new Date(daysSorted[i]);
    const diff = Math.round((curD.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else if (diff > 1) cur = 1;
  }
  return best;
}
