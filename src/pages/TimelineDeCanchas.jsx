import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import SidebarProfileMenu from "../components/SidebarProfileMenu.jsx";
import { useToast } from "../components/Toast.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { adminNav, adminMobileNav } from "../config/nav.js";

const AVATAR_ADMIN =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBFzjDKTmd9DbUJw1ck2b4jD2cXRZLvH3fxeUkKXF8oG-OUZS1rtx45lAZdl3ZfFP5JhmZbG1a6r6ToL0iciFdMx3GqkLNSYWXOi_zlRbCXeyiaBRVMu3o3aLrdDRWfc6c9QvoSgZuGtjVlxN463aC1up9a-z7fWA-hMv2O3jJ-GilisFghTlMQzqZG1vg6Tnx8WrQTCsvZHXbEo-7rNtE_voFZO5NKhuGvRJSggnRyK_IAUY_ondY";

const dias = [
  { label: "Hoy, 24 Oct", sub: "Jueves" },
  { label: "Mañana, 25 Oct", sub: "Viernes" },
  { label: "Sáb, 26 Oct", sub: "Sábado" },
];

const courts = [
  { name: "Cancha 1", type: "Cristal • Techada", tipo: "Cristal" },
  { name: "Cancha 2", type: "Cristal • Techada", tipo: "Cristal" },
  { name: "Cancha 3", type: "Cristal • Descubierta", tipo: "Cristal" },
  { name: "Cancha 4", type: "Muro • Techada", tipo: "Muro" },
  { name: "Cancha 5", type: "Muro • Techada", tipo: "Muro" },
  { name: "Cancha 6", type: "Muro • Descubierta", tipo: "Muro" },
];

const bookings = [
  { id: 1, cliente: "Martín Perez", hora: "08:30 - 10:00 (90m)", nivel: "Nivel 4", estado: "Seña pagada", estadoColor: "text-status-pending", estadoIcon: "payments", color: "bg-surface-container-highest" },
  { id: 2, cliente: "Lucía Gómez", hora: "09:00 - 10:30 (90m)", nivel: "Nivel 6", estado: "Total pagado", estadoColor: "text-status-ok", estadoIcon: "check_circle", color: "bg-primary-container" },
  { id: 3, cliente: "Torneo Interno", hora: "09:30 - 11:00 (90m)", nivel: null, estado: "Bloqueado", estadoColor: "text-secondary", estadoIcon: "lock", color: "bg-surface-container-highest" },
  { id: 4, cliente: "En Mantenimiento", hora: "09:00 - 11:00", nivel: null, estado: null, mantenimiento: true },
];

const tiposCancha = ["Todos", "Cristal", "Muro"];

export default function TimelineDeCanchas() {
  const { pathname } = useLocation();
  const showToast = useToast();
  const { profile } = useAuth();
  const [tipo, setTipo] = useState("Todos");
  const [diaIndex, setDiaIndex] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showFecha, setShowFecha] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [form, setForm] = useState({ cliente: "", cancha: courts[0].name, hora: "" });

  function crearReserva(e) {
    e.preventDefault();
    if (!form.cliente || !form.hora) return;
    setShowNueva(false);
    showToast(`Reserva creada para ${form.cliente}`);
    setForm({ cliente: "", cancha: courts[0].name, hora: "" });
  }

  function cancelarTurno() {
    showToast(`Turno de ${detalle.cliente} cancelado`, "error");
    setDetalle(null);
  }

  return (
    <div className="bg-background text-on-surface font-body-md h-screen flex overflow-hidden">
      <header className="md:hidden bg-surface flex justify-between items-center px-container-margin py-stack-sm w-full top-0 z-50">
        <div className="flex items-center gap-4">
          <img
            alt="Foto de perfil del usuario"
            className="w-8 h-8 rounded-full object-cover border border-border-subtle"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZjrmE2e-ejnL-i7kfh6UuJNahu5C-apyEjBc-QOY8Aej8cFuK3NM9FTUonLLIgHkzKw7INXDiXI2QtftCVed1Ph1_F8LtoDuWs6urAdPyyzQ7iIZMp7iBMnaJgJHlvbR8VQLK5-aQuUdZF1Wu9SAwUIwyIXapCbWTo4Y11Ss63y-pjVrEAEyrN-5fZNBJ_trkawYzFkVbQLF4ttgTdUzi7Sd-ezURco6avkdoSbpBAK40ZFm6gIU"
          />
          <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Padel Pro</span>
        </div>
        <button
          onClick={() => setShowNotifs(true)}
          className="text-primary p-2 hover:bg-surface-container-high active:scale-90 transition-all rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <nav className="hidden md:flex flex-col w-64 bg-surface border-r border-border-subtle h-full py-stack-md flex-shrink-0">
        <div className="px-stack-md mb-stack-lg">
          <span className="text-headline-lg font-headline-lg font-bold text-on-surface">Padel Pro</span>
        </div>
        <div className="flex flex-col gap-2 px-inline-gutter flex-grow">
          {adminNav.map((item) => {
            const active = item.to === pathname;
            const classes =
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 " +
              (active ? "bg-primary text-on-primary shadow-sm hover:opacity-90" : "text-secondary hover:bg-surface-container-high");
            const content = (
              <>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-caps text-label-caps">{item.label}</span>
              </>
            );
            if (item.action === "settings") {
              return (
                <button key={item.key} onClick={() => setShowSettings(true)} className={classes + " w-full text-left"}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={item.key} to={item.to} className={classes}>
                {content}
              </Link>
            );
          })}
        </div>
        <div className="px-inline-gutter pt-4">
          <SidebarProfileMenu
            nombre={profile?.nombre || "Admin User"}
            subtitulo={profile?.telefono || "Club Central"}
            avatarUrl={profile?.avatar_url || AVATAR_ADMIN}
          />
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-shrink-0 flex items-center justify-between px-stack-lg py-stack-md bg-surface border-b border-border-subtle z-20 relative flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDiaIndex((i) => Math.max(0, i - 1))}
              disabled={diaIndex === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border-subtle hover:bg-surface-container-high active:scale-90 transition-all disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-secondary">chevron_left</span>
            </button>
            <div className="flex flex-col">
              <span className="text-headline-lg font-headline-lg text-on-surface">{dias[diaIndex].label}</span>
              <span className="text-label-muted font-label-muted text-text-secondary">{dias[diaIndex].sub}</span>
            </div>
            <button
              onClick={() => setDiaIndex((i) => Math.min(dias.length - 1, i + 1))}
              disabled={diaIndex === dias.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border-subtle hover:bg-surface-container-high active:scale-90 transition-all disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-secondary">chevron_right</span>
            </button>
            <button
              onClick={() => setShowFecha(true)}
              className="ml-4 px-4 py-2 rounded-full border border-border-subtle flex items-center gap-2 hover:bg-surface-container-high active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-secondary text-sm">calendar_today</span>
              <span className="font-label-caps text-label-caps text-on-surface">Seleccionar Fecha</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container-low p-1 rounded-full border border-border-subtle">
              {tiposCancha.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={
                    "px-4 py-1.5 rounded-full font-label-caps text-label-caps transition-all " +
                    (tipo === t ? "bg-primary-container text-on-primary-container shadow-sm" : "text-secondary hover:bg-surface-container-high")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNueva(true)}
              className="flex items-center gap-2 px-4 py-2 bg-on-surface text-on-primary rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="font-label-caps text-label-caps">Nueva Reserva</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-surface-bright relative">
          <div className="grid-timeline min-w-[1000px]">
            <div className="corner-cell border-b border-r border-border-subtle"></div>
            {courts.map((c) => {
              const dimmed = tipo !== "Todos" && c.tipo !== tipo;
              return (
                <div
                  key={c.name}
                  className={
                    "header-row border-b border-r border-border-subtle flex flex-col items-center justify-center py-2 bg-surface transition-opacity " +
                    (dimmed ? "opacity-30" : "opacity-100")
                  }
                >
                  <span className="text-body-md font-body-md font-semibold text-on-surface">{c.name}</span>
                  <span className="text-label-muted font-label-muted text-text-secondary">{c.type}</span>
                </div>
              );
            })}

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">08:00</span>
            </div>
            <div
              onClick={() => setShowNueva(true)}
              className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors relative group"
            >
              <div className="hidden group-hover:flex absolute inset-0 items-center justify-center text-primary font-label-caps text-label-caps opacity-50">+ Crear</div>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">08:30</span>
            </div>
            <div className="border-b border-r border-border-subtle relative">
              <div
                onClick={() => setDetalle(bookings[0])}
                className="absolute top-1 bottom-[-119px] left-1 right-1 bg-surface-container-highest rounded-lg border border-border-subtle p-3 flex flex-col justify-between shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer z-10"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-caps text-label-caps text-on-surface font-bold truncate">Martín Perez</span>
                    <span className="material-symbols-outlined text-secondary text-sm">more_horiz</span>
                  </div>
                  <span className="text-label-muted font-label-muted text-text-secondary block">08:30 - 10:00 (90m)</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="px-2 py-1 bg-on-surface text-on-primary rounded font-label-caps text-[10px] uppercase tracking-widest">Nivel 4</span>
                  <div className="flex items-center gap-1 text-status-pending">
                    <span className="material-symbols-outlined text-[14px]">payments</span>
                    <span className="font-label-caps text-[10px]">SEÑA PAGADA</span>
                  </div>
                </div>
              </div>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">09:00</span>
            </div>
            <div className="border-b border-r border-border-subtle"></div>
            <div className="border-b border-r border-border-subtle relative">
              <div
                onClick={() => setDetalle(bookings[1])}
                className="absolute top-1 bottom-[-119px] left-1 right-1 bg-primary-container rounded-lg border border-primary p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer z-10"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-caps text-label-caps text-on-surface font-bold truncate">Lucía Gómez</span>
                    <span className="material-symbols-outlined text-on-surface text-sm">more_horiz</span>
                  </div>
                  <span className="text-label-muted font-label-muted text-on-surface/80 block">09:00 - 10:30 (90m)</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="px-2 py-1 bg-on-surface text-on-primary rounded font-label-caps text-[10px] uppercase tracking-widest">Nivel 6</span>
                  <div className="flex items-center gap-1 text-status-ok">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span className="font-label-caps text-[10px]">TOTAL PAGADO</span>
                  </div>
                </div>
              </div>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle relative">
              <div
                onClick={() => setDetalle(bookings[3])}
                className="absolute top-1 bottom-[-179px] left-1 right-1 bg-inverse-surface rounded-lg border border-border-subtle p-3 flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer z-10"
              >
                <span className="material-symbols-outlined text-inverse-on-surface mb-2">construction</span>
                <span className="font-label-caps text-label-caps text-inverse-on-surface text-center">En Mantenimiento</span>
              </div>
            </div>

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">09:30</span>
            </div>
            <div className="border-b border-r border-border-subtle"></div>
            <div className="border-b border-r border-border-subtle"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle relative">
              <div
                onClick={() => setDetalle(bookings[2])}
                className="absolute top-1 bottom-[-119px] left-1 right-1 bg-surface-container-highest rounded-lg border border-border-subtle p-3 flex flex-col justify-between shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer z-10"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-caps text-label-caps text-on-surface font-bold truncate">Torneo Interno</span>
                    <span className="material-symbols-outlined text-secondary text-sm">more_horiz</span>
                  </div>
                  <span className="text-label-muted font-label-muted text-text-secondary block">09:30 - 11:00 (90m)</span>
                </div>
                <div className="flex justify-end items-end">
                  <div className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span className="font-label-caps text-[10px]">BLOQUEADO</span>
                  </div>
                </div>
              </div>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle"></div>

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">10:00</span>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle"></div>

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">10:30</span>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div className="border-b border-r border-border-subtle"></div>

            <div className="time-col border-b border-r border-border-subtle flex items-start justify-center pt-2">
              <span className="text-label-muted font-label-muted text-text-secondary">11:00</span>
            </div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>
            <div onClick={() => setShowNueva(true)} className="border-b border-r border-border-subtle hover:bg-surface-container-low cursor-pointer transition-colors"></div>

            <div className="absolute left-[80px] right-0 h-px bg-primary z-20 pointer-events-none flex items-center" style={{ top: "calc(60px * 2.5 + 44px)" }}>
              <div className="w-2 h-2 rounded-full bg-primary -ml-1"></div>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden flex justify-around items-end pb-6 pt-2 px-6 w-full fixed bottom-0 z-50 rounded-t-xl bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-t border-border-subtle dark:border-outline-variant shadow-lg">
        {adminMobileNav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={
                active
                  ? "flex items-center justify-center bg-primary dark:bg-primary-fixed text-on-primary dark:text-on-primary-fixed rounded-full w-12 h-12 mb-2 shadow-md scale-110 transition-transform duration-300 ease-out"
                  : "flex items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant w-12 h-12 hover:text-primary transition-all"
              }
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
            </Link>
          );
        })}
      </nav>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} anchor="bottom-left" />

      <Modal open={showFecha} onClose={() => setShowFecha(false)} title="Seleccionar Fecha">
        <div className="flex flex-col gap-2">
          {dias.map((d, i) => (
            <button
              key={d.label}
              onClick={() => {
                setDiaIndex(i);
                setShowFecha(false);
              }}
              className={
                "flex items-center justify-between px-4 py-3 rounded-xl transition-colors " +
                (i === diaIndex ? "bg-primary-container text-on-primary-container font-bold" : "hover:bg-surface-container-low text-on-surface")
              }
            >
              <span>{d.label}</span>
              <span className="text-text-secondary text-label-muted font-label-muted">{d.sub}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showNueva} onClose={() => setShowNueva(false)} title="Nueva Reserva">
        <form onSubmit={crearReserva} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-on-surface uppercase">Cliente</label>
            <input
              required
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              placeholder="Nombre del cliente"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-on-surface uppercase">Cancha</label>
            <select
              value={form.cancha}
              onChange={(e) => setForm({ ...form, cancha: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary"
            >
              {courts.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-on-surface uppercase">Horario</label>
            <input
              required
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
              placeholder="Ej: 12:00 - 13:30"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Crear Reserva
          </button>
        </form>
      </Modal>

      <Modal
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title={detalle?.cliente || ""}
        footer={
          !detalle?.mantenimiento && (
            <button
              onClick={cancelarTurno}
              className="w-full py-3 rounded-full bg-status-error/10 text-status-error font-bold hover:bg-status-error/20 active:scale-[0.98] transition-all"
            >
              Cancelar Turno
            </button>
          )
        }
      >
        {detalle && (
          <div className="flex flex-col gap-3 text-body-md font-body-md">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {detalle.hora}
            </div>
            {detalle.nivel && (
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                {detalle.nivel}
              </div>
            )}
            {detalle.estado && (
              <div className={"flex items-center gap-2 " + detalle.estadoColor}>
                <span className="material-symbols-outlined text-[18px]">{detalle.estadoIcon}</span>
                {detalle.estado}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
