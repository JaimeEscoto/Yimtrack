import type { UserStats } from '@/lib/stats';

const ACCENTS = ['#10b981', '#38bdf8', '#f59e0b', '#f472b6', '#a78bfa', '#fb7185'];

export default function StatsDashboard({ stats }: { stats: UserStats }) {
  const maxDay = Math.max(1, ...stats.weeklyTrend.map(d => d.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <Stat label="Sesiones"        value={stats.totalSessions}                     accent="brand" />
        <Stat label="Minutos"          value={stats.totalMinutes}                      accent="blue"  />
        <Stat label="Esta semana"      value={stats.thisWeek}                          accent="amber" />
        <Stat label="Este mes"         value={stats.thisMonth}                         accent="pink"  />
        <Stat label="Racha actual"     value={`${stats.currentStreak}d`}               accent="brand" />
        <Stat label="Racha más larga"  value={`${stats.longestStreak}d`}               accent="amber" />
        <Stat label="Foco principal"   value={stats.byFocus[0]?.focus ?? '—'}   small  accent="blue"  />
        <Stat label="Grupo top"        value={stats.topMuscles[0]?.muscle ?? '—'} small accent="pink"  />
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Actividad · 14 días</h3>
          <span className="chip">{stats.weeklyTrend.reduce((a,d)=>a+d.count,0)} sesiones</span>
        </div>
        <div className="flex gap-1.5 items-end h-28">
          {stats.weeklyTrend.map((d, i) => (
            <div key={d.day + i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full rounded-md relative overflow-hidden" style={{
                height: `${Math.max(4, (d.count / maxDay) * 100)}%`,
                background: d.count
                  ? 'linear-gradient(180deg, #10b981 0%, #047857 100%)'
                  : 'rgba(255,255,255,0.04)'
              }}>
                {d.count > 0 && (
                  <span className="absolute inset-0 flex items-start justify-center pt-0.5 text-[9px] font-semibold text-black/80">
                    {d.count}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-ink-dim tnum">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.byFocus.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm mb-3">Sesiones por foco</h3>
          <ul className="space-y-2">
            {stats.byFocus.map((f, i) => {
              const max = stats.byFocus[0].count || 1;
              const pct = (f.count / max) * 100;
              return (
                <li key={f.focus} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-ink">{f.focus}</span>
                    <span className="text-ink-muted tnum">{f.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${pct}%`,
                      background: ACCENTS[i % ACCENTS.length]
                    }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {stats.topMuscles.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm mb-3">Grupos musculares trabajados</h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.topMuscles.map(m => (
              <span key={m.muscle} className="chip chip-brand">
                {m.muscle} · <span className="tnum">{m.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ACCENT_STYLE: Record<string, { color: string; bar: string }> = {
  brand: { color: '#6ee7b7', bar: '#10b981' },
  blue:  { color: '#7dd3fc', bar: '#38bdf8' },
  amber: { color: '#fcd34d', bar: '#f59e0b' },
  pink:  { color: '#f9a8d4', bar: '#f472b6' }
};

function Stat({
  label, value, small, accent = 'brand'
}: { label: string; value: string | number; small?: boolean; accent?: keyof typeof ACCENT_STYLE }) {
  const a = ACCENT_STYLE[accent];
  return (
    <div className="card relative overflow-hidden">
      <span className="absolute top-0 left-0 right-0 h-0.5" style={{ background: a.bar, opacity: 0.6 }} />
      <div className={`font-bold tracking-tight tnum truncate ${small ? 'text-base sm:text-lg capitalize' : 'text-2xl sm:text-3xl'}`}
        style={{ color: a.color }}>
        {value}
      </div>
      <div className="text-[11px] text-ink-muted mt-1 truncate uppercase tracking-wider">{label}</div>
    </div>
  );
}
