'use client';
import { useEffect, useState } from 'react';

type Gym = { id: string; name: string; address?: string | null; city?: string | null };

export default function GymPage() {
  const [list, setList] = useState<Gym[]>([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name: '', address: '', city: '' });

  async function search() {
    const res = await fetch(`/api/gyms?q=${encodeURIComponent(q)}`);
    setList(await res.json());
  }
  useEffect(() => { search(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/gyms', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form)
    });
    if (res.ok) { setForm({ name: '', address: '', city: '' }); search(); }
  }

  async function setPrimary(id: string) {
    await fetch('/api/users/me/gym', {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ gymId: id })
    });
    alert('Gimnasio asignado como principal');
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Buscar gimnasio</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="Nombre…" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn-ghost" onClick={search}>Buscar</button>
        </div>
        <ul className="space-y-2">
          {list.map(g => (
            <li key={g.id} className="flex justify-between border-b border-neutral-800 pb-2">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-neutral-500">{[g.address, g.city].filter(Boolean).join(' · ')}</div>
              </div>
              <button className="btn-ghost" onClick={() => setPrimary(g.id)}>Usar este</button>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={create} className="card space-y-3">
        <h2 className="text-xl font-semibold">Registrar gimnasio</h2>
        <input className="input" placeholder="Nombre" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Dirección" value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })} />
        <input className="input" placeholder="Ciudad" value={form.city}
          onChange={e => setForm({ ...form, city: e.target.value })} />
        <button className="btn-primary">Crear y usar</button>
      </form>
    </div>
  );
}
