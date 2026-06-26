import Link from 'next/link';
import { getUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const uid = await getUserId();
  if (uid) redirect('/dashboard');
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 anim-in">
        <div className="flex justify-center">
          <img src="/icon.svg" alt="" width={88} height={88} className="rounded-2xl shadow-glow" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight h-display">
            Yim<span className="text-brand">track</span>
          </h1>
          <p className="text-ink-muted">
            Entrena, registra y comparte. Rutinas hechas a tu medida y comunidad para crecer juntos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-ghost w-full sm:w-auto">Iniciar sesión</Link>
          <Link href="/register" className="btn-primary w-full sm:w-auto">Crear cuenta</Link>
        </div>
      </div>
    </main>
  );
}
