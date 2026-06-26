'use client';
import { useEffect } from 'react';

export default function Sheet({
  open, onClose, title, children
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full md:w-[640px] md:max-h-[85vh] max-h-[92vh] overflow-y-auto
                   bg-surface-1 border border-line-soft md:rounded-2xl rounded-t-3xl
                   anim-in"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="md:hidden sticky top-0 pt-2 pb-1 bg-surface-1 z-10">
          <div className="mx-auto w-10 h-1 rounded-full bg-line" />
        </div>
        <div className="sticky top-0 md:top-0 z-10 bg-surface-1/95 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-line-soft">
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
