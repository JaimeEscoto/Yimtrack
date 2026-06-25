'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Routine = {
  id: string; name: string; focus: string; estimatedMinutes: number;
  isPublic: boolean; userId: string; authorUsername: string;
};

export default function RoutinesPage() {
  const [scope, setScope] = useState<'public' | 'mine'>('public');
  const [q, setQ] = useState('');
  const [list, setList] = useState<Routine[]>([]);

  async function load() {
    const res = await fetch(`/api/routines?scope=${scope}&q=${encodeURIComponent(q)}`);
    setList(await res.json());
  }
  useEffect(() => { load(); }, [scope]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rutinas</h2>
        <Link href="/routines/new" className="btn-primary">+ Crear rutina</Link>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setScope('public')}
          className={`px-3 py-1 rounded-full text-sm ${scope === 'public' ? 'bg-brand text-black' : 'bg-neutral-800'}`}>
          Explorar
        </button>
        <button onClick={() => setScope('mine')}
          className={`px-3 py-1 rounded-full text-sm ${scope === 'mine' ? 'bg-brand text-black' : 'bg-neutral-800'}`}>
          Mías
        </button>
      </div>

      <div className="flex gap-2">
        <input className="input" placeholder="Buscar por nombre…"
          value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()} />
        <button className="btn-ghost" onClick={load}>Buscar</button>
      </div>

      {list.length === 0 && <p className="text-neutral-500 text-sm">No hay rutinas todavía.</p>}

      <ul className="space-y-2">
        {list.map(r => (
          <li key={r.id} className="card">
            <Link href={`/routines/${r.id}`} className="block">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-neutral-500">
                    @{r.authorUsername} · {r.focus} · ~{r.estimatedMinutes} min
                  </div>
                </div>
                {!r.isPublic && <span className="text-xs text-neutral-500">privada</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
