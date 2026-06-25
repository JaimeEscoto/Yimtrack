import { db } from '@/db/client';
import { workoutSessions, sessionExercises, exercises } from '@/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export type UserStats = {
  totalSessions: number;
  totalMinutes: number;
  thisWeek: number;
  thisMonth: number;
  currentStreak: number;
  longestStreak: number;
  byFocus: { focus: string; count: number }[];
  topMuscles: { muscle: string; count: number }[];
  weeklyTrend: { day: string; count: number }[]; // últimos 14 días
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const completed = await db.select({
    id: workoutSessions.id,
    focus: workoutSessions.focus,
    actualMinutes: workoutSessions.actualMinutes,
    plannedMinutes: workoutSessions.plannedMinutes,
    completedAt: workoutSessions.completedAt
  }).from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, 'completed')))
    .orderBy(desc(workoutSessions.completedAt));

  const total = completed.length;
  const totalMinutes = completed.reduce((acc, s) => acc + (s.actualMinutes ?? s.plannedMinutes ?? 0), 0);

  const now = new Date();
  const startWeek = new Date(now); startWeek.setDate(now.getDate() - 7);
  const startMonth = new Date(now); startMonth.setDate(now.getDate() - 30);
  const thisWeek = completed.filter(s => s.completedAt && s.completedAt >= startWeek).length;
  const thisMonth = completed.filter(s => s.completedAt && s.completedAt >= startMonth).length;

  const byFocusMap = new Map<string, number>();
  for (const s of completed) byFocusMap.set(s.focus, (byFocusMap.get(s.focus) ?? 0) + 1);
  const byFocus = [...byFocusMap.entries()]
    .map(([focus, count]) => ({ focus, count }))
    .sort((a, b) => b.count - a.count);

  // streaks (en días distintos con sesión)
  const dayKeys = [...new Set(completed
    .filter(s => s.completedAt)
    .map(s => s.completedAt!.toISOString().slice(0, 10)))].sort();
  const { current, longest } = calcStreaks(dayKeys);

  // últimos 14 días
  const weeklyTrend: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    weeklyTrend.push({
      day: key.slice(5),
      count: completed.filter(s => s.completedAt?.toISOString().slice(0, 10) === key).length
    });
  }

  // top muscle groups
  const sessionIds = completed.map(c => c.id);
  let topMuscles: { muscle: string; count: number }[] = [];
  if (sessionIds.length) {
    const rows = await db.execute<{ muscle: string; count: number }>(sql`
      SELECT m as muscle, count(*)::int as count
      FROM ${sessionExercises}
      INNER JOIN ${exercises} ON ${exercises.id} = ${sessionExercises.exerciseId}
      , unnest(${exercises.muscleGroups}) as m
      WHERE ${sessionExercises.sessionId} IN ${sessionIds}
      GROUP BY m
      ORDER BY count DESC
      LIMIT 6
    `);
    topMuscles = (rows as any).rows ?? rows as any;
  }

  return {
    totalSessions: total,
    totalMinutes,
    thisWeek, thisMonth,
    currentStreak: current,
    longestStreak: longest,
    byFocus,
    topMuscles,
    weeklyTrend
  };
}

function calcStreaks(days: string[]): { current: number; longest: number } {
  if (!days.length) return { current: 0, longest: 0 };
  let longest = 1, run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = dayDiff(days[i - 1], days[i]);
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else if (diff > 1) run = 1;
  }
  // current streak: ¿la última fecha es hoy o ayer?
  const today = new Date().toISOString().slice(0, 10);
  const last = days[days.length - 1];
  const diffToToday = dayDiff(last, today);
  let current = 0;
  if (diffToToday <= 1) {
    current = 1;
    for (let i = days.length - 1; i > 0; i--) {
      if (dayDiff(days[i - 1], days[i]) === 1) current++;
      else break;
    }
  }
  return { current, longest };
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
