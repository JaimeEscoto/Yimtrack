import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-brand">Yimtrack</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/workout/today">Entrenar</Link>
            <Link href="/routines">Rutinas</Link>
            <Link href="/history">Historial</Link>
            <Link href="/achievements">Logros</Link>
            <Link href="/contacts">Contactos</Link>
            <Link href="/gym">Gym</Link>
            <Link href={`/profile/${user.username}`}>@{user.username}</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4">{children}</main>
    </div>
  );
}
