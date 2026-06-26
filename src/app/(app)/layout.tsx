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
    { href: '/feed', label: 'Feed' },
    { href: '/workout/today', label: 'Entrenar' },
    { href: '/routines', label: 'Rutinas' },
    { href: '/history', label: 'Historial' },
    { href: '/chat', label: 'Chat' },
    { href: '/achievements', label: 'Logros' },
    { href: '/contacts', label: 'Contactos' },
    { href: '/gym', label: 'Gym' }
  ];
  if (user.role === 'admin') items.push({ href: '/admin', label: 'Admin' });

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-20 border-b border-line-soft bg-surface-base/80 backdrop-blur-xl"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold tracking-tight text-base">Yimtrack</span>
          </Link>
          <MobileNav items={items} username={user.username} />
          <Link href={`/profile/${user.username}`} className="md:hidden">
            <span className="block rounded-full ring-2 ring-line">
              <Avatar username={user.username} avatarUrl={user.avatarUrl} size={32} />
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-4 md:py-8 pb-28 md:pb-8 anim-in">
        {children}
      </main>

      <BottomNav username={user.username} isAdmin={user.role === 'admin'} />
      <SleepPrompt />
    </div>
  );
}
