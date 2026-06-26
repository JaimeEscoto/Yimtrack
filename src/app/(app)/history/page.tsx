'use client';
import { useEffect, useState } from 'react';
import Sheet from '@/components/Sheet';
import ExerciseIcon from '@/components/ExerciseIcon';

type Session = {
  id: string; focus: string; status: string;
  plannedMinutes: number; actualMinutes: number | null;
  startedAt: string; completedAt: string | null;
};
type Item = {
  id: string; name: string; muscleGroups: string[];
  plannedSets: number; plannedReps: number; restSeconds: number;
  completedSets: number; completedReps: number; weightKg: string | null;
};

export default function HistoryPage() {
  const [list, setList] = useState<Session[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<{ session: Session; items: Item[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetch('/api/workouts/history').then(r => r.json()).then(setList);
  }, []);

  async function openDetail(id: string) {
    setOpen(true); setDetail(null); setLoadingDetail(true);
    const res = await fetch(`/api/workouts/sessions/${id}`);
    const data = await res.json();
    setDetail(data); setLoadingDetail(false);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="page-title">Historial</h2>
        <span className="chip">{list.length} sesiones</span>
      </header>

      {list.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-2">📋</div>
          <p className="text-ink-muted text-sm">Aún no hay sesiones registradas.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map(s => (
            <li key={s.id}>
              <button onClick={() => openDetail(s.id)}
                className="card card-hover w-full text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
                  <FocusIcon focus={s.focus} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium capitalize truncate">{s.focus}</div>
                  <div className="text-xs text-ink-muted truncate">
                    {new Date(s.startedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs tnum">{s.actualMinutes ?? s.plannedMinutes} min</div>
                  <StatusPill status={s.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={detail?.session.focus ? capital(detail.session.focus) : 'Sesión'}>
        {loadingDetail && <p className="text-ink-muted text-sm">Cargando…</p>}
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Mini label="Duración" value={`${detail.session.actualMinutes ?? detail.session.plannedMinutes} min`} />
              <Mini label="Ejercicios" value={String(detail.items.length)} />
              <Mini label="Estado" value={capital(detail.session.status)} />
            </div>
            <div className="text-xs text-ink-muted">
              {new Date(detail.session.startedAt).toLocaleString()}
            </div>
            <ol className="space-y-2">
              {detail.items.map((it, i) => (
                <li key={it.id} className="card flex items-center gap-3">
                  <ExerciseIcon muscleGroups={it.muscleGroups} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{i + 1}. {it.name}</div>
                    <div className="text-[11px] text-ink-muted truncate">{it.muscleGroups.join(' · ')}</div>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <div className="tnum">{it.completedSets}/{it.plannedSets} × {it.completedReps}</div>
                    {it.weightKg && <div className="text-ink-muted tnum">{it.weightKg} kg</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function capital(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 border border-line-soft py-2">
      <div className="text-sm font-semibold tnum">{value}</div>
      <div className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'chip-brand',
    in_progress: 'chip',
    abandoned: 'chip'
  };
  return <span className={`chip ${map[status] ?? ''} mt-1 text-[10px]`}>{capital(status)}</span>;
}

function FocusIcon({ focus }: { focus: string }) {
  const emoji: Record<string, string> = {
    upper: '💪', lower: '🦵', push: '👐', pull: '🤜', full: '🏋️',
    cardio: '❤️', mixed: '🔥', core: '🧘'
  };
  return <span className="text-lg">{emoji[focus] ?? '🏋️'}</span>;
}
