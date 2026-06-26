import { db } from '@/db/client';
import { users, workoutSessions, routines, sleepLogs, exercises, sessionExercises, contacts } from '@/db/schema';
import { sql, desc, eq } from 'drizzle-orm';

export async function getAdminStats() {
  const [totals] = await db.execute<{
    users: number; sessions_total: number; sessions_completed: number;
    routines: number; routines_public: number; total_minutes: number;
    contacts_accepted: number; sleep_logs: number;
  }>(sql`
    SELECT
      (SELECT count(*)::int FROM ${users}) AS users,
      (SELECT count(*)::int FROM ${workoutSessions}) AS sessions_total,
      (SELECT count(*)::int FROM ${workoutSessions} WHERE status = 'completed') AS sessions_completed,
      (SELECT count(*)::int FROM ${routines}) AS routines,
      (SELECT count(*)::int FROM ${routines} WHERE is_public = true) AS routines_public,
      (SELECT COALESCE(sum(COALESCE(actual_minutes, planned_minutes)),0)::int
        FROM ${workoutSessions} WHERE status = 'completed') AS total_minutes,
      (SELECT count(*)::int FROM ${contacts} WHERE status = 'accepted') AS contacts_accepted,
      (SELECT count(*)::int FROM ${sleepLogs}) AS sleep_logs
  `) as any;

  // Signups por día (últimos 30)
  const signups = await db.execute<{ day: string; count: number }>(sql`
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
           count(*)::int AS count
    FROM ${users}
    WHERE created_at >= now() - interval '30 days'
    GROUP BY 1
    ORDER BY 1
  `) as any;

  // Sesiones por día (últimos 30)
  const sessionsByDay = await db.execute<{ day: string; count: number }>(sql`
    SELECT to_char(date_trunc('day', started_at), 'YYYY-MM-DD') AS day,
           count(*)::int AS count
    FROM ${workoutSessions}
    WHERE started_at >= now() - interval '30 days'
    GROUP BY 1
    ORDER BY 1
  `) as any;

  // Top usuarios por sesiones completadas
  const topUsers = await db.execute<{
    username: string; displayName: string | null; avatarUrl: string | null; sessions: number;
  }>(sql`
    SELECT u.username, u.display_name AS "displayName", u.avatar_url AS "avatarUrl",
           count(s.id)::int AS sessions
    FROM ${users} u
    LEFT JOIN ${workoutSessions} s
      ON s.user_id = u.id AND s.status = 'completed'
    GROUP BY u.id
    ORDER BY sessions DESC, u.created_at ASC
    LIMIT 10
  `) as any;

  // Sesiones por foco
  const byFocus = await db.execute<{ focus: string; count: number }>(sql`
    SELECT focus, count(*)::int AS count
    FROM ${workoutSessions}
    WHERE status = 'completed'
    GROUP BY focus
    ORDER BY count DESC
  `) as any;

  // Top rutinas por veces iniciadas
  const topRoutines = await db.execute<{
    name: string; author: string; uses: number; isPublic: boolean;
  }>(sql`
    SELECT r.name, u.username AS author, r.is_public AS "isPublic",
           count(s.id)::int AS uses
    FROM ${routines} r
    INNER JOIN ${users} u ON u.id = r.user_id
    LEFT JOIN ${workoutSessions} s ON s.routine_id = r.id
    GROUP BY r.id, u.username
    ORDER BY uses DESC, r.created_at DESC
    LIMIT 10
  `) as any;

  // Ejercicios más usados
  const topExercises = await db.execute<{ name: string; count: number }>(sql`
    SELECT e.name, count(*)::int AS count
    FROM ${sessionExercises} se
    INNER JOIN ${exercises} e ON e.id = se.exercise_id
    GROUP BY e.name
    ORDER BY count DESC
    LIMIT 10
  `) as any;

  // Usuarios activos (sesión completada en últimos 7 días)
  const [active] = await db.execute<{ count: number }>(sql`
    SELECT count(DISTINCT user_id)::int AS count
    FROM ${workoutSessions}
    WHERE status = 'completed' AND started_at >= now() - interval '7 days'
  `) as any;

  return {
    totals,
    signups: signups.rows ?? signups,
    sessionsByDay: sessionsByDay.rows ?? sessionsByDay,
    topUsers: topUsers.rows ?? topUsers,
    byFocus: byFocus.rows ?? byFocus,
    topRoutines: topRoutines.rows ?? topRoutines,
    topExercises: topExercises.rows ?? topExercises,
    activeWeek: active?.count ?? 0
  };
}
