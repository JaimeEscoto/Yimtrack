'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';

export default function EditProfile() {
  const r = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Cargar perfil propio vía /api/users/search no aplica — hacemos un fetch al perfil propio
    // Usamos la sesión: leemos via /api/contacts (no devuelve me). Mejor crear endpoint /me.
    fetch('/api/users/me/profile').then(r => r.json()).then(u => {
      setUsername(u.username);
      setDisplayName(u.displayName || '');
      setBio(u.bio || '');
      setAvatarUrl(u.avatarUrl || null);
    });
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg('Tiene que ser una imagen.'); return; }

    const dataUrl = await resizeImage(file, 256);
    if (dataUrl.length > 200_000) {
      setMsg('La imagen pesa más de 200 KB después de comprimir. Usa una más pequeña.');
      return;
    }
    setAvatarUrl(dataUrl);
    setMsg(null);
  }

  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/users/me', {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName, bio, avatarUrl })
    });
    setBusy(false);
    if (res.ok) {
      setMsg('Guardado.');
      r.refresh();
    } else {
      setMsg('Error al guardar.');
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-semibold">Editar perfil</h2>

      <section className="card space-y-4">
        <div className="flex items-center gap-4">
          <Avatar username={username} avatarUrl={avatarUrl} size={80} />
          <div className="flex flex-col gap-2">
            <button className="btn-ghost" onClick={() => fileInput.current?.click()}>
              {avatarUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {avatarUrl && (
              <button className="text-red-400 text-xs text-left" onClick={() => setAvatarUrl(null)}>
                Quitar foto
              </button>
            )}
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </div>

        <div>
          <label className="label">Nombre</label>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={3} maxLength={280}
            value={bio} onChange={e => setBio(e.target.value)} />
        </div>

        {msg && <p className="text-sm text-neutral-400">{msg}</p>}
        <button className="btn-primary w-full" onClick={save} disabled={busy}>
          {busy ? '…' : 'Guardar'}
        </button>
      </section>
    </div>
  );
}

function resizeImage(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target!.result as string; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
