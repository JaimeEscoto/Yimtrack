import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import {
  workoutSessions, userAchievements, achievements, routines, users, contacts
} from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { and, desc, eq, inArray, ne, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Event =
  | { type: 'session'; id: string; userId: string; createdAt: string; focus: string; minutes: number }
  | { type: 'achievement'; id: string; userId: string; createdAt: string; name: string; iconEmoji: string | null }
  | { type: 'routine'; id: string; userId: string; createdAt: string; name: string; focus: string };

export async function GET(req: Request) {
  let me;
  try { me = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const scope = new URL(req.url).searchParams.get('scope') ?? 'friends';

  // userIds a incluir
  let userIds: string[];
  if (scope === 'friends') {
    const friends = await db.select().from(contacts)
      .where(and(
        eq(contacts.status, 'accepted'),
        or(eq(contacts.requesterId, me.id), eq(contacts.addresseeId, me.id))
      ));
    userIds = friends.map(c => c.requesterId === me.id ? c.addresseeId : c.requesterId);
    userIds.push(me.id);
    if (!userIds.length) return NextResponse.json({ events: [] });
  } else {
    // discover: otros usuarios (no yo)
    const others = await db.select({ id: users.id }).from(users)
      .where(ne(users.id, me.id)).limit(50);
    userIds = others.map(u => u.id);
    if (!userIds.length) return NextResponse.json({ events: [] });
  }

  const events: Event[] = [];

  // sesiones completadas
  const ss = await db.select({
    id: workoutSessions.id, userId: workoutSessions.userId,
    completedAt: workoutSessions.completedAt, focus: workoutSessions.focus,
    actualMinutes: workoutSessions.actualMinutes, plannedMinutes: workoutSessions.plannedMinutes
  }).from(workoutSessions)
    .where(and(eq(workoutSessions.status, 'completed'), inArray(workoutSessions.userId, userIds)))
    .orderBy(desc(workoutSessions.completedAt)).limit(30);
  for (const s of ss) {
    if (!s.completedAt) continue;
    events.push({
      type: 'session', id: s.id, userId: s.userId,
      createdAt: s.completedAt.toISOString(), focus: s.focus,
      minutes: s.actualMinutes ?? s.plannedMinutes
    });
  }

  // logros desbloqueados
  const ua = await db.select({
    achievementId: userAchievements.achievementId,
    userId: userAchievements.userId,
    unlockedAt: userAchievements.unlockedAt,
    name: achievements.name,
    iconEmoji: achievements.iconEmoji
  }).from(userAchievements)
    .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
    .where(inArray(userAchievements.userId, userIds))
    .orderBy(desc(userAchievements.unlockedAt)).limit(30);
  for (const a of ua) {
    events.push({
      type: 'achievement', id: a.achievementId, userId: a.userId,
      createdAt: a.unlockedAt.toISOString(), name: a.name, iconEmoji: a.iconEmoji
    });
  }

  // rutinas creadas (públicas)
  const rs = await db.select({
    id: routines.id, userId: routines.userId, createdAt: routines.createdAt,
    name: routines.name, focus: routines.focus
  }).from(routines)
    .where(and(eq(routines.isPublic, true), inArray(routines.userId, userIds)))
    .orderBy(desc(routines.createdAt)).limit(30);
  for (const r of rs) {
    events.push({
      type: 'routine', id: r.id, userId: r.userId,
      createdAt: r.createdAt.toISOString(), name: r.name, focus: r.focus
    });
  }

  // Hidratar usuarios
  const usrs = await db.select({
    id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl
  }).from(users).where(inArray(users.id, userIds));
  const userMap = Object.fromEntries(usrs.map(u => [u.id, u]));

  // Si discover, marcar quiénes ya son contactos para ocultar el botón
  let friendIds = new Set<string>();
  if (scope === 'discover') {
    const cs = await db.select().from(contacts)
      .where(or(eq(contacts.requesterId, me.id), eq(contacts.addresseeId, me.id)));
    friendIds = new Set(cs.map(c => c.requesterId === me.id ? c.addresseeId : c.requesterId));
  }

  events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const limited = events.slice(0, 40);

  return NextResponse.json({
    events: limited.map(e => ({ ...e, user: userMap[e.userId] })),
    friendIds: scope === 'discover' ? [...friendIds] : []
  });
}
