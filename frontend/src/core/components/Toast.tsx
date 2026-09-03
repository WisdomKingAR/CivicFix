// frontend/src/core/components/Toast.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type Listener = (toasts: ToastItem[]) => void;

let listeners: Listener[] = [];
let toasts: ToastItem[] = [];

const notify = () => {
  listeners.forEach((l) => l([...toasts]));
};

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, type: 'success', message }];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  error: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, type: 'error', message }];
    notify();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  info: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, type: 'info', message }];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export const Toaster: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md animate-fadeIn transition-all ${
            t.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/30 shadow-emerald-950/20'
              : t.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-500/30 shadow-rose-950/20'
              : 'bg-slate-900/90 text-slate-100 border-slate-700 shadow-slate-950/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
