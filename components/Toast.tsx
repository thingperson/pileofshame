'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';

interface ToastMessage {
  id: string;
  text: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (text: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, duration = 3200) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDone={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: ToastMessage; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDone, 300);
    }, toast.duration || 2500);
    return () => clearTimeout(timer);
  }, [toast.duration, onDone]);

  return (
    <div
      className={`
        px-5 py-3 rounded-xl text-sm font-semibold font-[family-name:var(--font-mono)]
        bg-bg-elevated border border-accent-purple/40 text-text-primary
        shadow-xl shadow-black/40
        transition-all duration-300 ease-out max-w-[90vw] text-center
        ${visible && !leaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
    >
      {toast.text}
    </div>
  );
}
