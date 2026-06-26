'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

type Usr = { id: string; username: string; displayName: string | null; avatarUrl: string | null };
type Event =
  | { type: 'session'; id: string; userId: string; user: Usr; createdAt: string; focus: string; minutes: number }
  | { type: 'achievement'; id: string; userId: string; user: Usr; createdAt: string; name: string; iconEmoji: string | null }
  | { type: 'routine'; id: string; userId: string; user: Usr; createdAt: string; name: string; focus: string };

export default function FeedPage() {
  const [scope, setScope] = useState<'friends' | 'discover'>('friends');
  const [events, setEvents] = useState<Event[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [pendingAdd, setPendingAdd] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/feed?scope=${scope}`);
    const data = await res.json();
    setEvents(data.events ?? []);
    setFriendIds(data.friendIds ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [scope]);

  async function addFriend(userId: string) {
    setPendingAdd(s => new Set(s).add(userId));
    await fetch('/api/contacts/request', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ addresseeId: userId })
    });
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="page-title">Feed</h2>
        <div className="segment">
          <button data-active={scope === 'friends'} onClick={() => setScope('friends')}>Amigos</button>
          <button data-active={scope === 'discover'} onClick={() => setScope('discover')}>Descubrir</button>
        </div>
      </header>

      {loading ? (
        <p className="text-ink-muted text-sm">Cargando…</p>
      ) : events.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-2">📭</div>
          <p className="text-ink-muted text-sm">
            {scope === 'friends' ? 'Tus amigos aún no han hecho nada.' : 'Aún no hay actividad pública.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {events.map(e => {
            const isFriend = friendIds.includes(e.user.id);
            const isPending = pendingAdd.has(e.user.id);
            return (
              <li key={`${e.type}-${e.id}-${e.createdAt}`} className="card flex gap-3">
                <Link href={`/profile/${e.user.username}`} className="shrink-0">
                  <Avatar username={e.user.username} avatarUrl={e.user.avatarUrl} size={44} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <Link href={`/profile/${e.user.username}`}
                      className="font-medium truncate hover:text-brand">
                      @{e.user.username}
                    </Link>
                    <span className="text-[10px] text-ink-dim shrink-0 tnum">
                      {timeAgo(e.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-ink-muted mt-0.5">
                    {renderEvent(e)}
                  </div>
                  {scope === 'discover' && !isFriend && (
                    <button
                      onClick={() => addFriend(e.user.id)}
                      disabled={isPending}
                      className="text-xs text-brand hover:underline mt-2 disabled:opacity-50">
                      {isPending ? 'Solicitud enviada ✓' : '+ Agregar amigo'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function renderEvent(e: Event) {
  if (e.type === 'session') {
    return <>completó una sesión de <span className="text-ink font-medium capitalize">{e.focus}</span> · {e.minutes} min 💪</>;
  }
  if (e.type === 'achievement') {
    return <>desbloqueó el logro {e.iconEmoji} <span className="text-ink font-medium">{e.name}</span></>;
  }
  return (
    <>
      creó la rutina{' '}
      <Link href={`/routines/${e.id}`} className="text-ink font-medium hover:text-brand">
        {e.name}
      </Link>{' '}
      <span className="capitalize">({e.focus})</span>
    </>
  );
}

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000); if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24); return `${dd}d`;
}
