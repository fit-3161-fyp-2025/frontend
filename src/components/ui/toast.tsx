import { createContext, useContext, useState, useCallback, useMemo } from "react";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
};

type ToastContextType = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const next: Toast = { id, ...toast };
    setToasts(prev => [...prev, next]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`rounded-md border px-4 py-2 shadow bg-white ${t.variant === "destructive" ? "border-red-300" : t.variant === "success" ? "border-green-300" : "border-gray-200"}`}>
          {t.title && <div className="font-medium mb-0.5">{t.title}</div>}
          {t.description && <div className="text-sm text-gray-700">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
