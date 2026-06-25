import Link from 'next/link';
import { db } from '@/db/client';
import { workoutSessions } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export default async function HistoryPage() {
  const user = await requireUser();
  const rows = await db.select().from(workoutSessions)
    .where(eq(workoutSessions.userId, user.id))
    .orderBy(desc(workoutSessions.startedAt)).limit(50);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Historial</h2>
      {rows.length === 0 && <p className="text-neutral-500">Aún no hay sesiones.</p>}
      <ul className="space-y-2">
        {rows.map(s => (
          <li key={s.id}>
            <Link href={`/history/${s.id}`} className="card flex justify-between text-sm hover:border-neutral-700">
              <div>
                <div className="font-medium capitalize">{s.focus}</div>
                <div className="text-neutral-500 text-xs">{new Date(s.startedAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="capitalize">{s.status}</div>
                <div className="text-neutral-500 text-xs">{s.actualMinutes ?? s.plannedMinutes} min</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
