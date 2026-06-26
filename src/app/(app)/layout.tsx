import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SleepPrompt from '@/components/SleepPrompt';
import MobileNav from '@/components/MobileNav';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const items = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/workout/today', label: 'Entrenar' },
    { href: '/routines', label: 'Rutinas' },
    { href: '/history', label: 'Historial' },
    { href: '/achievements', label: 'Logros' },
    { href: '/contacts', label: 'Contactos' },
    { href: '/gym', label: 'Gym' }
  ];
  if (user.role === 'admin') items.push({ href: '/admin', label: 'Admin' });

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-20"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="font-bold text-brand flex items-center gap-2">
            <img src="/icon.svg" alt="" width={24} height={24} className="rounded" />
            <span>Yimtrack</span>
          </Link>
          <MobileNav items={items} username={user.username} />
          {/* En mobile mostramos solo el avatar arriba a la derecha */}
          <Link href={`/profile/${user.username}`} className="md:hidden">
            <Avatar username={user.username} avatarUrl={user.avatarUrl} size={32} />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 md:px-4 py-4 pb-28 md:pb-8">
        {children}
      </main>

      <BottomNav username={user.username} isAdmin={user.role === 'admin'} />
      <SleepPrompt />
    </div>
  );
}
