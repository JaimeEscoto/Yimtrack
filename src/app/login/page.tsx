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
      <div className="w-full max-w-sm space-y-6 anim-in">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/icon.svg" alt="" width={56} height={56} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
          <p className="text-sm text-ink-muted">Entra para seguir tu progreso.</p>
        </div>
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Usuario o email</label>
            <input className="input" value={form.identifier} autoComplete="username"
              onChange={e => setForm({ ...form, identifier: e.target.value })} required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" autoComplete="current-password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <p className="text-sm text-ink-muted text-center">
          ¿Sin cuenta? <Link className="text-brand font-medium" href="/register">Regístrate</Link>
        </p>
      </div>
    </main>
  );
}
