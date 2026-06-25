'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const r = useRouter();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form)
    });
    setBusy(false);
    if (!res.ok) { setErr((await res.json()).error || 'Error'); return; }
    r.push('/dashboard'); r.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        <div>
          <label className="label">Usuario o email</label>
          <input className="input" value={form.identifier}
            onChange={e => setForm({ ...form, identifier: e.target.value })} required />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input className="input" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? '…' : 'Entrar'}</button>
        <p className="text-sm text-neutral-400 text-center">
          ¿Sin cuenta? <Link className="text-brand" href="/register">Regístrate</Link>
        </p>
      </form>
    </main>
  );
}
