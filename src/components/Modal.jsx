import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portal a document.body por la misma razón que DropdownPanel: evita quedar atrapado dentro
  // del stacking context de un ancestro con position:sticky (sidebar) o transform.
  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <h2 className="text-body-lg font-body-lg font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border-subtle shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
