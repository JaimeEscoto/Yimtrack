import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { ilike, ne, and } from 'drizzle-orm';

export async function GET(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const q = new URL(req.url).searchParams.get('q')?.toLowerCase() ?? '';
  if (!q) return NextResponse.json([]);
  const rows = await db.select({
    id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl
  }).from(users)
    .where(and(ilike(users.username, `%${q}%`), ne(users.id, user.id)))
    .limit(20);
  return NextResponse.json(rows);
}
