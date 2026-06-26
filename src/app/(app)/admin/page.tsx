import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAdminStats } from '@/lib/admin-stats';
import Avatar from '@/components/Avatar';
import Link from 'next/link';

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const s = await getAdminStats();
  const t = s.totals;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Admin · Yimtrack</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Usuarios" value={t.users} />
        <Stat label="Activos 7d" value={s.activeWeek} />
        <Stat label="Sesiones totales" value={t.sessions_total} />
        <Stat label="Completadas" value={t.sessions_completed} />
        <Stat label="Minutos entrenados" value={t.total_minutes} />
        <Stat label="Rutinas" value={t.routines} />
        <Stat label="Rutinas públicas" value={t.routines_public} />
        <Stat label="Contactos aceptados" value={t.contacts_accepted} />
      </div>

      <TrendCard title="Registros últimos 30 días" data={s.signups} />
      <TrendCard title="Sesiones iniciadas últimos 30 días" data={s.sessionsByDay} />

      <section className="card">
        <h3 className="font-semibold mb-3">Top usuarios por sesiones</h3>
        <ul className="space-y-2">
          {s.topUsers.map((u: any) => (
            <li key={u.username} className="flex items-center gap-3 border-b border-neutral-800 pb-2">
              <Avatar username={u.username} avatarUrl={u.avatarUrl} size={36} />
              <Link href={`/profile/${u.username}`} className="flex-1 hover:text-brand">
                <div className="text-sm">@{u.username}</div>
                <div className="text-xs text-neutral-500">{u.displayName}</div>
              </Link>
              <span className="text-brand font-semibold">{u.sessions}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="card">
          <h3 className="font-semibold mb-3">Distribución por foco</h3>
          <ul className="space-y-1 text-sm">
            {s.byFocus.map((f: any) => (
              <li key={f.focus} className="flex justify-between">
                <span className="capitalize">{f.focus}</span>
                <span className="text-neutral-400">{f.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h3 className="font-semibold mb-3">Ejercicios más usados</h3>
          <ul className="space-y-1 text-sm">
            {s.topExercises.map((e: any) => (
              <li key={e.name} className="flex justify-between">
                <span className="truncate pr-2">{e.name}</span>
                <span className="text-neutral-400 flex-shrink-0">{e.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h3 className="font-semibold mb-3">Rutinas más usadas</h3>
        <ul className="space-y-2 text-sm">
          {s.topRoutines.map((r: any, i: number) => (
            <li key={i} className="flex justify-between border-b border-neutral-800 pb-2 gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-neutral-500">
                  @{r.author}{!r.isPublic && ' · privada'}
                </div>
              </div>
              <span className="text-brand font-semibold flex-shrink-0">{r.uses}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-2xl md:text-3xl font-bold text-brand">{value}</div>
      <div className="text-xs text-neutral-400 mt-1">{label}</div>
    </div>
  );
}

function TrendCard({ title, data }: { title: string; data: { day: string; count: number }[] }) {
  // Rellenar 30 días aunque no haya datos en algunos
  const map = new Map(data.map(d => [d.day, d.count]));
  const days: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ day: key, count: map.get(key) ?? 0 });
  }
  const max = Math.max(1, ...days.map(d => d.count));
  return (
    <section className="card">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="flex gap-[2px] items-end h-24 overflow-hidden">
        {days.map(d => (
          <div key={d.day} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-brand rounded-t"
              title={`${d.day}: ${d.count}`}
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
