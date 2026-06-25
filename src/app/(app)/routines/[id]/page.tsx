'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExerciseIcon from '@/components/ExerciseIcon';

type Routine = {
  id: string; name: string; focus: string; estimatedMinutes: number;
  isPublic: boolean; userId: string; authorUsername: string;
};
type Item = {
  id: string; name: string; muscleGroups: string[];
  sets: number; reps: number; restSeconds: number; notes: string | null;
};

export default function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [data, setData] = useState<{ routine: Routine; items: Item[] } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/routines/${id}`).then(r => r.json()).then(setData);
  }, [id]);

  if (!data) return <p>Cargando…</p>;

  async function start() {
    setBusy(true);
    const res = await fetch(`/api/routines/${id}/start`, { method: 'POST' });
    const j = await res.json();
    setBusy(false);
    if (res.ok) r.push(`/workout/session/${j.id}`);
  }

  async function del() {
    if (!confirm('¿Eliminar esta rutina?')) return;
    await fetch(`/api/routines/${id}`, { method: 'DELETE' });
    r.push('/routines');
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{data.routine.name}</h2>
            <p className="text-sm text-neutral-400">
              por @{data.routine.authorUsername} · {data.routine.focus} · ~{data.routine.estimatedMinutes} min
            </p>
          </div>
          {!data.routine.isPublic && <span className="text-xs text-neutral-500">privada</span>}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={start} disabled={busy}>Usar esta rutina</button>
          <button className="btn-ghost text-red-400" onClick={del}>Eliminar</button>
        </div>
      </section>

      <ol className="space-y-2">
        {data.items.map((it, i) => (
          <li key={it.id} className="card flex items-center gap-3">
            <ExerciseIcon muscleGroups={it.muscleGroups} size={48} />
            <div className="flex-1">
              <div className="font-medium">{i + 1}. {it.name}</div>
              <div className="text-xs text-neutral-500">{it.muscleGroups.join(' · ')}</div>
              {it.notes && <div className="text-xs text-neutral-400 mt-1">{it.notes}</div>}
            </div>
            <div className="text-right text-sm">
              <div>{it.sets} × {it.reps}</div>
              <div className="text-xs text-neutral-500">desc. {it.restSeconds}s</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
