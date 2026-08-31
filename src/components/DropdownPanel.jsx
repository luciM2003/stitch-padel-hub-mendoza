import { useEffect } from "react";

const POSICIONES = {
  "top-right": "top-16 right-3 sm:right-6 origin-top-right",
  "bottom-left": "bottom-24 md:bottom-6 left-3 md:left-6 origin-bottom-left",
};

// Igual que Modal, pero como panel flotante anclado a una esquina de la pantalla en vez de
// tarjeta centrada — para menús cortos que salen de un ícono (notificaciones, configuración),
// no para diálogos de contenido largo/formularios grandes.
export default function DropdownPanel({ open, onClose, title, children, footer, anchor = "top-right" }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150]" onClick={onClose}></div>
      <div
        className={
          "fixed z-[160] w-[min(92vw,380px)] max-h-[75vh] bg-surface-container-lowest border border-border-subtle rounded-2xl shadow-2xl flex flex-col animate-scale-in " +
          POSICIONES[anchor]
        }
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle shrink-0">
          <h2 className="text-body-md font-body-md font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="px-3 py-2 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-border-subtle shrink-0">{footer}</div>}
      </div>
    </>
  );
}
