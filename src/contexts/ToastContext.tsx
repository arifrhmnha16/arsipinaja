import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-brand-cream text-brand-black';
          let borderAccent = 'border-brand-black';
          let icon = <Info className="w-5 h-5 text-brand-blue flex-shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-brand-blue text-white';
            icon = <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-brand-navy text-white';
            icon = <AlertTriangle className="w-5 h-5 text-brand-sky flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-lg border-2 ${borderAccent} p-3.5 shadow-retro transition-all flex items-start gap-3 ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-medium leading-tight">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current hover:opacity-75 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
