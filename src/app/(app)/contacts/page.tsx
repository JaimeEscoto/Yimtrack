'use client';
import { useEffect, useState } from 'react';

type SearchUser = { id: string; username: string; displayName: string | null };
type Contact = {
  id: string; status: string; requesterId: string; addresseeId: string;
  otherUsername: string; otherDisplayName: string | null;
};

export default function ContactsPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [me, setMe] = useState<string | null>(null);

  async function loadContacts() {
    setContacts(await (await fetch('/api/contacts')).json());
  }
  useEffect(() => { loadContacts(); }, []);

  async function search() {
    if (!q) return setResults([]);
    setResults(await (await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)).json());
  }

  async function add(id: string) {
    await fetch('/api/contacts/request', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ addresseeId: id })
    });
    loadContacts();
  }

  async function accept(id: string) {
    await fetch(`/api/contacts/${id}/accept`, { method: 'POST' });
    loadContacts();
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Buscar contactos</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="username…" value={q}
            onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          <button className="btn-ghost" onClick={search}>Buscar</button>
        </div>
        <ul className="space-y-2">
          {results.map(u => (
            <li key={u.id} className="flex justify-between border-b border-neutral-800 pb-2">
              <span>@{u.username} <span className="text-neutral-500 text-xs">{u.displayName}</span></span>
              <button className="btn-ghost" onClick={() => add(u.id)}>Agregar</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Mis contactos</h2>
        {contacts.length === 0 && <p className="text-neutral-500 text-sm">Aún no tienes contactos.</p>}
        <ul className="space-y-2">
          {contacts.map(c => (
            <li key={c.id} className="flex justify-between border-b border-neutral-800 pb-2">
              <span>@{c.otherUsername} <span className="text-neutral-500 text-xs">{c.status}</span></span>
              {c.status === 'pending' && c.addresseeId !== c.requesterId && (
                <button className="btn-ghost" onClick={() => accept(c.id)}>Aceptar</button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
