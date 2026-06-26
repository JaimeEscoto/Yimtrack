'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string };

// Desktop-only nav usado en el header. En mobile la navegación es BottomNav.
export default function MobileNav({ items, username }: { items: Item[]; username: string }) {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex gap-4 text-sm items-center">
      {items.map(it => (
        <Link key={it.href} href={it.href}
          className={pathname.startsWith(it.href) ? 'text-brand' : 'hover:text-brand'}>
          {it.label}
        </Link>
      ))}
      <Link href={`/profile/${username}`} className="hover:text-brand">@{username}</Link>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="text-neutral-500 hover:text-red-400">Salir</button>
      </form>
    </nav>
  );
}
