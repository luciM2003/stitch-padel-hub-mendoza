import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DropdownPanel from "./DropdownPanel.jsx";
import SettingsModal from "./SettingsModal.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

// Tarjeta de perfil al pie del sidebar: antes era un div estático sin ninguna acción. Ahora
// es un botón que abre un menú (ver perfil / configuración / cerrar sesión) anclado abajo a
// la izquierda, en el mismo lugar donde está la tarjeta.
export default function SidebarProfileMenu({ nombre, subtitulo, avatarUrl, verPerfilTo }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  async function logout() {
    setOpen(false);
    await signOut();
    navigate("/");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-3 border-t border-border-subtle pt-4 hover:bg-surface-container-high rounded-xl transition-colors text-left w-full"
      >
        <img className="w-10 h-10 rounded-full object-cover border border-border-subtle shrink-0" src={avatarUrl} alt={nombre} />
        <div className="overflow-hidden flex-1">
          <p className="font-label-caps text-label-caps text-text-primary truncate">{nombre}</p>
          <p className="font-label-muted text-label-muted text-text-secondary truncate">{subtitulo}</p>
        </div>
        <span className="material-symbols-outlined text-text-secondary text-[20px] shrink-0">unfold_more</span>
      </button>

      <DropdownPanel open={open} onClose={() => setOpen(false)} title={nombre} anchor="bottom-left">
        <div className="flex flex-col gap-1">
          {verPerfilTo && (
            <button
              onClick={() => {
                setOpen(false);
                navigate(verPerfilTo);
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-text-secondary">person</span>
              <span className="text-body-md font-body-md text-on-surface">Ver perfil</span>
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              setShowSettings(true);
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
          >
            <span className="material-symbols-outlined text-text-secondary">settings</span>
            <span className="text-body-md font-body-md text-on-surface">Configuración</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-status-error/10 transition-colors text-left text-status-error"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-body-md font-body-md font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </DropdownPanel>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} anchor="bottom-left" />
    </>
  );
}
