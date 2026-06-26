'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

type Conv = {
  id: string;
  lastMessageAt: string;
  other: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  lastMessage: { body: string; createdAt: string; fromMe: boolean } | null;
};

export default function ChatList() {
  const [list, setList] = useState<Conv[]>([]);
  useEffect(() => {
    fetch('/api/chat/conversations').then(r => r.json()).then(setList);
  }, []);
  return (
    <div className="space-y-4">
      <h2 className="page-title">Mensajes</h2>
      {list.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-2">💬</div>
          <p className="text-ink-muted text-sm">Aún no tienes conversaciones.</p>
          <p className="text-ink-dim text-xs mt-1">Visita un perfil y empieza el chat.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {list.map(c => (
            <li key={c.id}>
              <Link href={`/chat/${c.other.username}`}
                className="card card-hover flex items-center gap-3">
                <Avatar username={c.other.username} avatarUrl={c.other.avatarUrl} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-medium truncate">@{c.other.username}</span>
                    <span className="text-[10px] text-ink-dim shrink-0 tnum">
                      {timeAgo(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted truncate">
                    {c.lastMessage ? (
                      <>
                        {c.lastMessage.fromMe && <span className="text-ink-dim">Tú: </span>}
                        {c.lastMessage.body}
                      </>
                    ) : <span className="italic">Sin mensajes aún</span>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000); if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24); return `${dd}d`;
}
