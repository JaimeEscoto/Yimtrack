'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

type Msg = { id: string; body: string; createdAt: string; fromMe: boolean };
type Other = { id: string; username: string; displayName: string | null; avatarUrl: string | null };

export default function Conversation() {
  const { username } = useParams<{ username: string }>();
  const [other, setOther] = useState<Other | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/chat/${username}`);
    if (!res.ok) return;
    const data = await res.json();
    setOther(data.other);
    setMsgs(data.messages);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // polling cada 5s
    return () => clearInterval(t);
  }, [username]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const body = text.trim();
    setText('');
    // Optimistic
    const temp: Msg = { id: 'temp-' + Date.now(), body, createdAt: new Date().toISOString(), fromMe: true };
    setMsgs(m => [...m, temp]);
    const res = await fetch(`/api/chat/${username}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ body })
    });
    if (res.ok) {
      const real = await res.json();
      setMsgs(m => m.map(x => x.id === temp.id ? real : x));
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
      <Link href="/chat" className="text-xs text-ink-muted mb-2">← Mensajes</Link>
      {other && (
        <div className="card flex items-center gap-3 mb-3">
          <Link href={`/profile/${other.username}`}>
            <Avatar username={other.username} avatarUrl={other.avatarUrl} size={40} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">@{other.username}</div>
            <div className="text-xs text-ink-muted truncate">{other.displayName}</div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto card space-y-2 mb-3">
        {msgs.length === 0 && (
          <p className="text-ink-muted text-xs text-center py-8">Sin mensajes. Saluda 👋</p>
        )}
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm break-words ${
              m.fromMe ? 'bg-brand text-black rounded-br-sm' : 'bg-surface-2 text-ink rounded-bl-sm'
            }`}>
              <div>{m.body}</div>
              <div className={`text-[10px] mt-0.5 tnum ${m.fromMe ? 'text-black/60' : 'text-ink-dim'}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input className="input" placeholder="Escribe…" value={text}
          onChange={e => setText(e.target.value)} maxLength={1000} />
        <button className="btn-primary" disabled={!text.trim() || sending}>Enviar</button>
      </form>
    </div>
  );
}
