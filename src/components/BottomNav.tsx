'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Tab = { href: string; label: string; icon: React.ReactNode };
type MoreItem = { href: string; label: string; icon: React.ReactNode };

const HomeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/>
  </svg>
);
const DumbbellIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="9"  width="3" height="6" rx="1"/>
    <rect x="5" y="7"  width="3" height="10" rx="1"/>
    <rect x="8" y="11" width="8" height="2" rx="1"/>
    <rect x="16" y="7" width="3" height="10" rx="1"/>
    <rect x="19" y="9" width="3" height="6" rx="1"/>
  </svg>
);
const ListIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="4" cy="6" r="1"/>
    <circle cx="4" cy="12" r="1"/>
    <circle cx="4" cy="18" r="1"/>
  </svg>
);
const ClockIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 15 14"/>
  </svg>
);
const MoreIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="19" cy="12" r="1.5"/>
  </svg>
);
const TrophyIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/>
    <path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3"/>
  </svg>
);
const UsersIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BuildingIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <line x1="9" y1="8" x2="9" y2="8"/>
    <line x1="15" y1="8" x2="15" y2="8"/>
    <line x1="9" y1="13" x2="9" y2="13"/>
    <line x1="15" y1="13" x2="15" y2="13"/>
    <line x1="10" y1="21" x2="10" y2="17"/>
    <line x1="14" y1="21" x2="14" y2="17"/>
  </svg>
);
const UserIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const ShieldIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const LogoutIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const TABS: Tab[] = [
  { href: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { href: '/workout/today', label: 'Entrenar', icon: DumbbellIcon },
  { href: '/routines', label: 'Rutinas', icon: ListIcon },
  { href: '/history', label: 'Historial', icon: ClockIcon }
];

export default function BottomNav({ username, isAdmin }: { username: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const more: MoreItem[] = [
    { href: '/achievements', label: 'Logros', icon: TrophyIcon },
    { href: '/contacts', label: 'Contactos', icon: UsersIcon },
    { href: '/gym', label: 'Gimnasio', icon: BuildingIcon },
    { href: `/profile/${username}`, label: 'Mi perfil', icon: UserIcon }
  ];
  if (isAdmin) more.push({ href: '/admin', label: 'Admin', icon: ShieldIcon });

  const moreActive = !TABS.some(t => pathname.startsWith(t.href));

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur border-t border-neutral-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="grid grid-cols-5">
          {TABS.map(t => {
            const active = pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link href={t.href}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                    active ? 'text-brand' : 'text-neutral-400'}`}>
                  {t.icon}
                  <span>{t.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setMoreOpen(true)}
              className={`w-full flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                moreActive ? 'text-brand' : 'text-neutral-400'}`}>
              {MoreIcon}
              <span>Más</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMoreOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-neutral-950 rounded-t-2xl border-t border-neutral-800 p-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            <div className="mx-auto w-10 h-1 rounded-full bg-neutral-700 mb-4" />
            <ul className="grid grid-cols-2 gap-2">
              {more.map(m => (
                <li key={m.href}>
                  <Link href={m.href} onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800">
                    <span className="text-brand">{m.icon}</span>
                    <span className="text-sm">{m.label}</span>
                  </Link>
                </li>
              ))}
              <li className="col-span-2">
                <form action="/api/auth/logout" method="post"
                  onSubmit={() => setTimeout(() => location.href = '/login', 100)}>
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-900 text-red-400 hover:bg-neutral-800">
                    {LogoutIcon}
                    <span className="text-sm">Cerrar sesión</span>
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
