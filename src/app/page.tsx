import Link from 'next/link';
import { getUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const uid = await getUserId();
  if (uid) redirect('/dashboard');
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-brand">Yimtrack</h1>
        <p className="text-neutral-400">Entrena, registra y comparte. Rutinas a medida según tu día.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="btn-ghost">Iniciar sesión</Link>
          <Link href="/register" className="btn-primary">Crear cuenta</Link>
        </div>
      </div>
    </main>
  );
}
