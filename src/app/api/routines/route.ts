import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { routines, routineItems, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { FOCUS_OPTIONS } from '@/lib/validation';
import { or, eq, desc, ilike, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const CreateSchema = z.object({
  name: z.string().min(2).max(80),
  focus: z.enum(FOCUS_OPTIONS),
  isPublic: z.boolean().default(true),
  items: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().min(1).max(10),
    reps: z.number().int().min(1).max(100),
    restSeconds: z.number().int().min(0).max(600),
    notes: z.string().max(200).optional()
  })).min(1).max(20)
});

export async function GET(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope') ?? 'public';
  const q = searchParams.get('q') ?? '';

  const where = scope === 'mine'
    ? eq(routines.userId, user.id)
    : eq(routines.isPublic, true);

  const filtered = q ? and(where, ilike(routines.name, `%${q}%`)) : where;

  const rows = await db.select({
    id: routines.id,
    name: routines.name,
    focus: routines.focus,
    estimatedMinutes: routines.estimatedMinutes,
    isPublic: routines.isPublic,
    userId: routines.userId,
    authorUsername: users.username,
    createdAt: routines.createdAt
  })
  .from(routines)
  .innerJoin(users, eq(users.id, routines.userId))
  .where(filtered)
  .orderBy(desc(routines.createdAt))
  .limit(50);

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Estimación rápida: suma de sets * (45s ejecución + rest)
  const estimatedMinutes = Math.max(5, Math.round(
    parsed.data.items.reduce((acc, it) =>
      acc + it.sets * 45 + Math.max(0, it.sets - 1) * it.restSeconds, 0) / 60
  ));

  const [r] = await db.insert(routines).values({
    userId: user.id,
    name: parsed.data.name,
    focus: parsed.data.focus,
    isPublic: parsed.data.isPublic,
    estimatedMinutes
  }).returning();

  await db.insert(routineItems).values(
    parsed.data.items.map((it, idx) => ({
      routineId: r.id,
      exerciseId: it.exerciseId,
      position: idx,
      sets: it.sets,
      reps: it.reps,
      restSeconds: it.restSeconds,
      notes: it.notes
    }))
  );

  return NextResponse.json(r);
}
