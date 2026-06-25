'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const r = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form)
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json();
      setErr(typeof j.error === 'string' ? j.error : 'Revisa los datos');
      return;
    }
    r.push('/dashboard'); r.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        <div>
          <label className="label">Username</label>
          <input className="input" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} />
        </div>
        <div>
          <label className="label">Nombre</label>
          <input className="input" value={form.displayName}
            onChange={e => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input className="input" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? '…' : 'Crear cuenta'}</button>
        <p className="text-sm text-neutral-400 text-center">
          ¿Ya tienes? <Link className="text-brand" href="/login">Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}
