"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (variant: ToastVariant, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const iconMap: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.4 14.31A1 1 0 002.77 20h18.46a1 1 0 00.88-1.83l-8.4-14.31a1 1 0 00-1.76 0z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const bgMap: Record<ToastVariant, string> = {
  success: "border-success/30",
  error: "border-danger/30",
  warning: "border-warning/30",
  info: "border-info/30",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (variant: ToastVariant, message: string, duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, variant, message, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3
              rounded-xl border bg-surface px-4 py-3
              shadow-[var(--shadow-lg)] min-w-[300px] max-w-[420px]
              animate-in slide-in-from-bottom-2 fade-in
              ${bgMap[t.variant]}
            `}
          >
            {iconMap[t.variant]}
            <p className="flex-1 text-sm text-text-primary">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-lg p-1 text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
