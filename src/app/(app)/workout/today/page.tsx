'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseIcon from '@/components/ExerciseIcon';

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
const DURATIONS = [15, 30, 45, 60, 75];

type Item = { exerciseId: string; name: string; muscleGroups: string[]; sets: number; reps: number; restSeconds: number; estimatedSeconds: number };
type Proposal = { focus: string; durationMin: number; estimatedMinutes: number; items: Item[] };

export default function TodayPage() {
  const r = useRouter();
  const [focus, setFocus] = useState('upper');
  const [duration, setDuration] = useState(30);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);

  async function propose() {
    setBusy(true);
    const res = await fetch('/api/workouts/propose', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ focus, durationMin: duration })
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) setProposal(data);
  }

  async function start() {
    if (!proposal) return;
    setBusy(true);
    const res = await fetch('/api/workouts/sessions', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        focus: proposal.focus, durationMin: proposal.durationMin,
        items: proposal.items.map(i => ({ exerciseId: i.exerciseId, sets: i.sets, reps: i.reps, restSeconds: i.restSeconds }))
      })
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) r.push(`/workout/session/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Tu rutina de hoy</h2>
        <div>
          <label className="label">Foco</label>
          <div className="flex flex-wrap gap-2">
            {FOCUSES.map(f => (
              <button key={f.key} onClick={() => setFocus(f.key)}
                className={`px-3 py-1 rounded-full text-sm ${focus === f.key ? 'bg-brand text-black' : 'bg-neutral-800'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Duración (min)</label>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-3 py-1 rounded-lg text-sm ${duration === d ? 'bg-brand text-black' : 'bg-neutral-800'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" onClick={propose} disabled={busy}>
          {busy ? '…' : 'Generar propuesta'}
        </button>
      </section>

      {proposal && (
        <section className="card space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Propuesta · ~{proposal.estimatedMinutes} min</h3>
            <button className="btn-primary" onClick={start} disabled={busy}>Iniciar sesión</button>
          </div>
          <ol className="space-y-2">
            {proposal.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-neutral-800 pb-2 text-sm">
                <ExerciseIcon muscleGroups={it.muscleGroups} size={48} />
                <div className="flex-1">
                  <div className="font-medium">{i + 1}. {it.name}</div>
                  <div className="text-neutral-500 text-xs">{it.muscleGroups.join(' · ')}</div>
                </div>
                <div className="text-neutral-300 text-right">
                  <div>{it.sets} × {it.reps}</div>
                  <div className="text-xs text-neutral-500">desc. {it.restSeconds}s</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
