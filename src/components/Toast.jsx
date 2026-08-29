import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

const icons = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const colors = {
  success: "bg-status-ok text-white",
  error: "bg-status-error text-white",
  info: "bg-inverse-surface text-inverse-on-surface",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed inset-0 z-[200] flex flex-col gap-2 items-center justify-center px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "animate-scale-in pointer-events-auto max-w-sm w-full sm:w-auto shadow-2xl rounded-full px-5 py-3 flex items-center gap-2 font-body-md text-body-md " +
              (colors[t.type] || colors.success)
            }
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icons[t.type] || icons.success}
            </span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
