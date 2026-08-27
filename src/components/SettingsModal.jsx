import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal.jsx";
import { useToast } from "./Toast.jsx";

const info = {
  "Privacidad y seguridad": "Tus datos y reservas son visibles solo para vos y los clubes donde jugás. Podés pedir la eliminación de tu cuenta escribiendo a soporte@padelhub.app.",
  "Ayuda y soporte": "¿Tenés un problema con una reserva o un pago? Escribinos a soporte@padelhub.app o por WhatsApp al +54 261 555-0000, te respondemos en el día.",
};

export default function SettingsModal({ open, onClose }) {
  const navigate = useNavigate();
  const showToast = useToast();
  const [notifs, setNotifs] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [expanded, setExpanded] = useState(null);

  function logout() {
    onClose();
    navigate("/");
  }

  function toggleNotifs() {
    setNotifs((v) => !v);
    showToast(!notifs ? "Notificaciones activadas" : "Notificaciones desactivadas");
  }

  function toggleModo() {
    setModoOscuro((v) => !v);
    showToast(!modoOscuro ? "Modo oscuro activado" : "Modo claro activado");
  }

  return (
    <Modal open={open} onClose={onClose} title="Configuración">
      <div className="flex flex-col gap-1">
        <button
          onClick={toggleNotifs}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
        >
          <span className="material-symbols-outlined text-text-secondary">notifications</span>
          <span className="text-body-md font-body-md text-on-surface flex-1">Notificaciones</span>
          <span
            className={"w-11 h-6 rounded-full flex items-center px-0.5 transition-colors " + (notifs ? "bg-primary justify-end" : "bg-surface-container-high justify-start")}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-sm"></span>
          </span>
        </button>

        <button
          onClick={toggleModo}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
        >
          <span className="material-symbols-outlined text-text-secondary">dark_mode</span>
          <span className="text-body-md font-body-md text-on-surface flex-1">Apariencia</span>
          <span
            className={"w-11 h-6 rounded-full flex items-center px-0.5 transition-colors " + (modoOscuro ? "bg-primary justify-end" : "bg-surface-container-high justify-start")}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-sm"></span>
          </span>
        </button>

        {["Privacidad y seguridad", "Ayuda y soporte"].map((label) => {
          const isOpen = expanded === label;
          return (
            <div key={label}>
              <button
                onClick={() => setExpanded(isOpen ? null : label)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
              >
                <span className="material-symbols-outlined text-text-secondary">{label === "Ayuda y soporte" ? "help" : "lock"}</span>
                <span className="text-body-md font-body-md text-on-surface flex-1">{label}</span>
                <span className={"material-symbols-outlined text-text-secondary text-[18px] transition-transform " + (isOpen ? "rotate-90" : "")}>
                  chevron_right
                </span>
              </button>
              {isOpen && (
                <p className="animate-fade-in px-3 pb-3 text-label-muted font-label-muted text-text-secondary leading-relaxed">{info[label]}</p>
              )}
            </div>
          );
        })}

        <button
          onClick={logout}
          className="mt-3 flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-status-error/10 transition-colors text-left text-status-error"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-body-md font-body-md font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </Modal>
  );
}
