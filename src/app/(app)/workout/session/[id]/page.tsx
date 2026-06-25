'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExerciseIcon from '@/components/ExerciseIcon';

type Item = {
  id: string; position: number; name: string; muscleGroups: string[];
  plannedSets: number; plannedReps: number; restSeconds: number;
  completedSets: number; completedReps: number;
};
type SessionData = { session: { id: string; focus: string; plannedMinutes: number; startedAt: string }, items: Item[] };

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [data, setData] = useState<SessionData | null>(null);
  const [progress, setProgress] = useState<Record<string, { completedSets: number; completedReps: number; weightKg?: number }>>({});
  const [startTime] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState<{ name: string; iconEmoji: string | null }[]>([]);

  useEffect(() => {
    fetch(`/api/workouts/sessions/${id}`).then(r => r.json()).then(d => {
      setData(d);
      const init: typeof progress = {};
      for (const it of d.items) init[it.id] = { completedSets: 0, completedReps: it.plannedReps };
      setProgress(init);
    });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [id]);

  if (!data) return <p>Cargando…</p>;

  const elapsedMin = Math.max(1, Math.round((now - startTime) / 60000));

  async function complete() {
    setBusy(true);
    const res = await fetch(`/api/workouts/sessions/${id}/complete`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        actualMinutes: elapsedMin,
        exercises: Object.entries(progress).map(([id, p]) => ({ id, ...p }))
      })
    });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      setUnlocked(j.unlocked ?? []);
      if (!(j.unlocked?.length)) r.push('/history');
    }
  }

  return (
    <div className="space-y-6">
      <section className="card flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold capitalize">{data.session.focus}</h2>
          <p className="text-sm text-neutral-400">{elapsedMin} / {data.session.plannedMinutes} min</p>
        </div>
        <button className="btn-primary" onClick={complete} disabled={busy}>Completar</button>
      </section>

      <ol className="space-y-3">
        {data.items.map((it, idx) => {
          const p = progress[it.id] ?? { completedSets: 0, completedReps: it.plannedReps };
          return (
            <li key={it.id} className="card">
              <div className="flex items-center gap-3">
                <ExerciseIcon muscleGroups={it.muscleGroups} size={56} />
                <div className="flex-1">
                  <div className="font-medium">{idx + 1}. {it.name}</div>
                  <div className="text-xs text-neutral-500">{it.muscleGroups.join(' · ')}</div>
                </div>
                <div className="text-sm text-neutral-300">{it.plannedSets} × {it.plannedReps}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <label className="label">Sets</label>
                  <input type="number" className="input" min={0} max={it.plannedSets * 2} value={p.completedSets}
                    onChange={e => setProgress({ ...progress, [it.id]: { ...p, completedSets: +e.target.value } })} />
                </div>
                <div>
                  <label className="label">Reps</label>
                  <input type="number" className="input" min={0} value={p.completedReps}
                    onChange={e => setProgress({ ...progress, [it.id]: { ...p, completedReps: +e.target.value } })} />
                </div>
                <div>
                  <label className="label">Kg</label>
                  <input type="number" className="input" min={0} step="0.5" value={p.weightKg ?? ''}
                    onChange={e => setProgress({ ...progress, [it.id]: { ...p, weightKg: e.target.value ? +e.target.value : undefined } })} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {unlocked.length > 0 && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="card max-w-sm w-full text-center space-y-4">
            <h3 className="text-2xl font-bold text-brand">¡Nuevos logros!</h3>
            <ul className="space-y-2">
              {unlocked.map(u => (
                <li key={u.name} className="text-lg">{u.iconEmoji} {u.name}</li>
              ))}
            </ul>
            <button className="btn-primary w-full" onClick={() => r.push('/history')}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
}
