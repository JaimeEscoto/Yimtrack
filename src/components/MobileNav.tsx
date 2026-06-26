'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string };

export default function MobileNav({ items, username }: { items: Item[]; username: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex gap-4 text-sm items-center">
        {items.map(it => (
          <Link key={it.href} href={it.href}
            className={pathname.startsWith(it.href) ? 'text-brand' : 'hover:text-brand'}>
            {it.label}
          </Link>
        ))}
        <Link href={`/profile/${username}`} className="hover:text-brand">@{username}</Link>
      </nav>

      {/* Mobile button */}
      <button
        className="md:hidden p-2 -mr-2"
        aria-label="Menú"
        onClick={() => setOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6"  x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-72 bg-neutral-950 border-l border-neutral-800 p-4 flex flex-col"
            onClick={e => e.stopPropagation()}>
            <button
              className="self-end p-2"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
            <nav className="flex flex-col gap-1 mt-2">
              {items.map(it => (
                <Link key={it.href} href={it.href}
                  onClick={() => setOpen(false)}
                  className={`py-3 px-2 rounded-lg ${
                    pathname.startsWith(it.href)
                      ? 'bg-neutral-800 text-brand'
                      : 'hover:bg-neutral-900'
                  }`}>
                  {it.label}
                </Link>
              ))}
              <Link href={`/profile/${username}`}
                onClick={() => setOpen(false)}
                className="py-3 px-2 rounded-lg hover:bg-neutral-900 mt-2 border-t border-neutral-800 pt-4">
                @{username}
              </Link>
              <form action="/api/auth/logout" method="post"
                onSubmit={() => setTimeout(() => location.href = '/login', 100)}>
                <button type="submit"
                  className="w-full text-left py-3 px-2 rounded-lg hover:bg-neutral-900 text-red-400">
                  Cerrar sesión
                </button>
              </form>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
