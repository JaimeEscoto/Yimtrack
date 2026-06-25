import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db.select().from(exercises).where(eq(exercises.isPublic, true));
  return NextResponse.json(rows);
}
