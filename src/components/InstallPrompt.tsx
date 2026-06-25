'use client';
import { useEffect, useState } from 'react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'yim_install_dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosShow, setIosShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Si ya está instalada o el usuario la descartó hace poco, no mostrar
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const recentlyDismissed = Date.now() - dismissedAt < 1000 * 60 * 60 * 24 * 7; // 7 días
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore -- iOS Safari
      window.navigator.standalone === true;
    if (standalone || recentlyDismissed) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBIP);

    // iOS Safari no dispara beforeinstallprompt — detectar y dar instrucciones
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIOS && isSafari) {
      setIosShow(true);
      setVisible(true);
    }

    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  if (!visible) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }
  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="card border-brand/40 shadow-2xl">
        <div className="flex items-start gap-3">
          <img src="/icon.svg" alt="" width={48} height={48} className="rounded-lg" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Instalar Yimtrack</h3>
            {iosShow ? (
              <p className="text-xs text-neutral-400 mt-1">
                Pulsa <span className="text-brand">Compartir</span> y luego{' '}
                <span className="text-brand">«Añadir a pantalla de inicio»</span> para tenerla como app.
              </p>
            ) : (
              <p className="text-xs text-neutral-400 mt-1">
                Añádela a tu dispositivo para acceso rápido y modo pantalla completa.
              </p>
            )}
            <div className="flex gap-2 mt-3">
              {!iosShow && (
                <button onClick={install} className="btn-primary text-xs px-3 py-1">Instalar</button>
              )}
              <button onClick={dismiss} className="btn-ghost text-xs px-3 py-1">Ahora no</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
