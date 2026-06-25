import type { UserStats } from '@/lib/stats';

export default function StatsDashboard({ stats }: { stats: UserStats }) {
  const maxDay = Math.max(1, ...stats.weeklyTrend.map(d => d.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Sesiones" value={stats.totalSessions} />
        <Stat label="Minutos" value={stats.totalMinutes} />
        <Stat label="Esta semana" value={stats.thisWeek} />
        <Stat label="Este mes" value={stats.thisMonth} />
        <Stat label="Racha actual" value={`${stats.currentStreak}d`} />
        <Stat label="Racha más larga" value={`${stats.longestStreak}d`} />
        <Stat label="Foco principal" value={stats.byFocus[0]?.focus ?? '—'} small />
        <Stat label="Grupo top" value={stats.topMuscles[0]?.muscle ?? '—'} small />
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Últimas 2 semanas</h3>
        <div className="flex gap-1 items-end h-24">
          {stats.weeklyTrend.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-brand rounded-t"
                style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 0 }} />
              <span className="text-[10px] text-neutral-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.byFocus.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Sesiones por foco</h3>
          <ul className="space-y-1 text-sm">
            {stats.byFocus.map(f => (
              <li key={f.focus} className="flex justify-between">
                <span className="capitalize">{f.focus}</span>
                <span className="text-neutral-400">{f.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.topMuscles.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Grupos musculares trabajados</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topMuscles.map(m => (
              <span key={m.muscle} className="px-2 py-1 rounded-full bg-neutral-800 text-xs">
                {m.muscle} · {m.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="card text-center">
      <div className={`font-bold text-brand ${small ? 'text-lg capitalize' : 'text-3xl'}`}>{value}</div>
      <div className="text-xs text-neutral-400 mt-1">{label}</div>
    </div>
  );
}
