'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseIcon from '@/components/ExerciseIcon';

type Exercise = {
  id: string; name: string; muscleGroups: string[];
  defaultSets: number; defaultReps: number; defaultRestSeconds: number;
};
type Item = {
  exerciseId: string; name: string; muscleGroups: string[];
  sets: number; reps: number; restSeconds: number;
};

const FOCUSES = [
  { key: 'upper', label: 'Tren superior' },
  { key: 'lower', label: 'Tren inferior' },
  { key: 'push',  label: 'Empuje' },
  { key: 'pull',  label: 'Tracción' },
  { key: 'full',  label: 'Cuerpo completo' },
  { key: 'mixed', label: 'Mixto' },
  { key: 'core',  label: 'Core' },
  { key: 'cardio',label: 'Cardio' }
];

export default function NewRoutinePage() {
  const r = useRouter();
  const [pool, setPool] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('mixed');
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/exercises').then(r => r.json()).then(setPool);
  }, []);

  function add(ex: Exercise) {
    setItems([...items, {
      exerciseId: ex.id, name: ex.name, muscleGroups: ex.muscleGroups,
      sets: ex.defaultSets, reps: ex.defaultReps, restSeconds: ex.defaultRestSeconds
    }]);
  }
  function remove(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setItems(copy);
  }
  function patch(i: number, p: Partial<Item>) {
    setItems(items.map((it, idx) => idx === i ? { ...it, ...p } : it));
  }

  async function save() {
    setBusy(true); setErr(null);
    const res = await fetch('/api/routines', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name, focus, isPublic,
        items: items.map(({ exerciseId, sets, reps, restSeconds }) =>
          ({ exerciseId, sets, reps, restSeconds }))
      })
    });
    setBusy(false);
    if (!res.ok) {
      setErr('Revisa los campos. Necesitas nombre y al menos 1 ejercicio.');
      return;
    }
    const j = await res.json();
    r.push(`/routines/${j.id}`);
  }

  const filtered = pool.filter(e =>
    !filter || e.name.toLowerCase().includes(filter.toLowerCase()) ||
    e.muscleGroups.some(m => m.includes(filter.toLowerCase())));

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Nueva rutina</h2>
        <div>
          <label className="label">Nombre</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            placeholder="ej. Empuje de fuerza 45min" />
        </div>
        <div>
          <label className="label">Foco</label>
          <div className="flex flex-wrap gap-2">
            {FOCUSES.map(f => (
              <button key={f.key} type="button" onClick={() => setFocus(f.key)}
                className={`px-3 py-1 rounded-full text-sm ${focus === f.key ? 'bg-brand text-black' : 'bg-neutral-800'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          Pública — otras personas pueden verla y usarla
        </label>
      </section>

      <section className="card space-y-3">
        <h3 className="font-semibold">Tu secuencia ({items.length})</h3>
        {items.length === 0 && <p className="text-neutral-500 text-sm">Agrega ejercicios desde el catálogo de abajo.</p>}
        <ol className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-3">
                <ExerciseIcon muscleGroups={it.muscleGroups} size={40} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{i + 1}. {it.name}</div>
                  <div className="text-xs text-neutral-500">{it.muscleGroups.join(' · ')}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(i, -1)} className="text-xs">▲</button>
                  <button onClick={() => move(i,  1)} className="text-xs">▼</button>
                </div>
                <button onClick={() => remove(i)} className="text-red-400 text-xs">Quitar</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <label className="label text-xs">Sets</label>
                  <input type="number" className="input" min={1} max={10} value={it.sets}
                    onChange={e => patch(i, { sets: +e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs">Reps</label>
                  <input type="number" className="input" min={1} value={it.reps}
                    onChange={e => patch(i, { reps: +e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs">Descanso (s)</label>
                  <input type="number" className="input" min={0} max={600} value={it.restSeconds}
                    onChange={e => patch(i, { restSeconds: +e.target.value })} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn-primary w-full" onClick={save}
          disabled={busy || !name || items.length === 0}>
          {busy ? '…' : 'Guardar rutina'}
        </button>
      </section>

      <section className="card space-y-3">
        <h3 className="font-semibold">Catálogo de ejercicios</h3>
        <input className="input" placeholder="Filtrar por nombre o grupo…"
          value={filter} onChange={e => setFilter(e.target.value)} />
        <ul className="grid sm:grid-cols-2 gap-2">
          {filtered.map(e => (
            <li key={e.id} className="flex items-center gap-2 border border-neutral-800 rounded-lg p-2">
              <ExerciseIcon muscleGroups={e.muscleGroups} size={36} />
              <div className="flex-1">
                <div className="text-sm">{e.name}</div>
                <div className="text-xs text-neutral-500">{e.muscleGroups.join(' · ')}</div>
              </div>
              <button onClick={() => add(e)} className="btn-ghost text-xs">+ Agregar</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
