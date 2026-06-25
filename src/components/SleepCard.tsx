import { db } from '@/db/client';
import { sleepLogs } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

function hoursBetween(sleep: string | null, wake: string | null): number | null {
  if (!sleep || !wake) return null;
  const [sh, sm] = sleep.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // pasó medianoche
  return Math.round((mins / 60) * 10) / 10;
}

export default async function SleepCard({ userId }: { userId: string }) {
  const rows = await db.select().from(sleepLogs)
    .where(eq(sleepLogs.userId, userId))
    .orderBy(desc(sleepLogs.logDate))
    .limit(7);

  const withHours = rows.map(r => ({
    date: r.logDate,
    sleepTime: r.sleepTime,
    wakeTime: r.wakeTime,
    hours: hoursBetween(r.sleepTime, r.wakeTime)
  }));

  const valid = withHours.filter(r => r.hours !== null);
  const avg = valid.length
    ? Math.round((valid.reduce((a, r) => a + r.hours!, 0) / valid.length) * 10) / 10
    : null;
  const maxH = Math.max(8, ...valid.map(r => r.hours!));

  return (
    <section className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">🌙 Sueño · últimos 7 días</h3>
        {avg !== null && <span className="text-sm text-neutral-400">prom. {avg} h</span>}
      </div>
      {withHours.length === 0 ? (
        <p className="text-neutral-500 text-sm">Aún sin registros. Te preguntaremos cada día.</p>
      ) : (
        <div className="flex gap-1 items-end h-20">
          {[...withHours].reverse().map(r => (
            <div key={r.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-brand"
                style={{
                  height: r.hours ? `${(r.hours / maxH) * 100}%` : 4,
                  opacity: r.hours ? 1 : 0.2
                }}
                title={r.hours ? `${r.hours} h` : 'sin datos'} />
              <span className="text-[10px] text-neutral-500">{r.date.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
