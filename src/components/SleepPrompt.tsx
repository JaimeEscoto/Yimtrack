'use client';
import { useEffect, useState } from 'react';

const SKIP_KEY = 'yim_sleep_skip_date';

export default function SleepPrompt() {
  const [open, setOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [needSleep, setNeedSleep] = useState(true);
  const [needWake, setNeedWake] = useState(true);

  useEffect(() => {
    fetch('/api/sleep/today').then(r => r.json()).then(d => {
      if (!d.needsPrompt) return;
      // Si el usuario pidió saltar hoy, no molestar de nuevo
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(SKIP_KEY) === today) return;
      setNeedSleep(!d.sleepTime);
      setNeedWake(!d.wakeTime);
      setSleepTime(d.sleepTime ?? '');
      setWakeTime(d.wakeTime ?? '');
      setOpen(true);
    }).catch(() => {});
  }, []);

  if (!open) return null;

  async function save() {
    setBusy(true);
    await fetch('/api/sleep', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sleepTime: needSleep && sleepTime ? sleepTime : undefined,
        wakeTime: needWake && wakeTime ? wakeTime : undefined
      })
    });
    setBusy(false);
    setOpen(false);
  }

  function skip() {
    localStorage.setItem(SKIP_KEY, new Date().toISOString().slice(0, 10));
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <div className="card max-w-sm w-full space-y-4">
        <div>
          <h3 className="text-lg font-semibold">🌙 Registro de sueño</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Llevemos un control diario de tu descanso. Tarda 5 segundos.
          </p>
        </div>

        {needSleep && (
          <div>
            <label className="label">¿A qué hora te dormiste anoche?</label>
            <input type="time" className="input" value={sleepTime}
              onChange={e => setSleepTime(e.target.value)} />
          </div>
        )}

        {needWake && (
          <div>
            <label className="label">¿A qué hora te levantaste hoy?</label>
            <input type="time" className="input" value={wakeTime}
              onChange={e => setWakeTime(e.target.value)} />
          </div>
        )}

        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={save}
            disabled={busy || ((needSleep && !sleepTime) && (needWake && !wakeTime))}>
            {busy ? '…' : 'Guardar'}
          </button>
          <button className="btn-ghost" onClick={skip}>Ahora no</button>
        </div>
      </div>
    </div>
  );
}
