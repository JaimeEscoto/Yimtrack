import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SleepPrompt from '@/components/SleepPrompt';
import MobileNav from '@/components/MobileNav';

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
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="font-bold text-brand">Yimtrack</Link>
          <MobileNav items={items} username={user.username} />
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pb-24">{children}</main>
      <SleepPrompt />
    </div>
  );
}
