import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { gyms, users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { GymSchema } from '@/lib/validation';
import { ilike, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const rows = q
    ? await db.select().from(gyms).where(ilike(gyms.name, `%${q}%`)).limit(20)
    : await db.select().from(gyms).limit(20);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const parsed = GymSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const [g] = await db.insert(gyms).values({ ...parsed.data, createdBy: user.id }).returning();
  await db.update(users).set({ primaryGymId: g.id }).where(eq(users.id, user.id));
  return NextResponse.json(g);
}
