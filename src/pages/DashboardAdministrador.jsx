import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationsModal from "../components/NotificationsModal.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import SidebarProfileMenu from "../components/SidebarProfileMenu.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useClubAdmin } from "../hooks/useClubAdmin.js";
import { supabase } from "../lib/supabaseClient.js";
import { fmtFecha } from "../lib/format.js";
import { adminNav, adminMobileNav } from "../config/nav.js";

const ESTADO_LABEL = { borrador: "Borrador", abierto: "Inscripciones abiertas", en_curso: "En curso", finalizado: "Finalizado", cancelado: "Cancelado" };
const ESTADO_STYLE = {
  borrador: "bg-surface-container-high text-text-secondary",
  abierto: "bg-status-ok/10 text-status-ok",
  en_curso: "bg-primary-container text-text-primary",
  finalizado: "bg-surface-container-high text-text-secondary",
  cancelado: "bg-status-error/10 text-status-error",
};

const AVATAR_ADMIN =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBFzjDKTmd9DbUJw1ck2b4jD2cXRZLvH3fxeUkKXF8oG-OUZS1rtx45lAZdl3ZfFP5JhmZbG1a6r6ToL0iciFdMx3GqkLNSYWXOi_zlRbCXeyiaBRVMu3o3aLrdDRWfc6c9QvoSgZuGtjVlxN463aC1up9a-z7fWA-hMv2O3jJ-GilisFghTlMQzqZG1vg6Tnx8WrQTCsvZHXbEo-7rNtE_voFZO5NKhuGvRJSggnRyK_IAUY_ondY";

export default function DashboardAdministrador() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { club } = useClubAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    if (!club) return;
    supabase
      .from("torneos")
      .select("id, nombre, estado, fecha_inicio, torneo_categorias(id)")
      .eq("club_id", club.id)
      .order("fecha_inicio", { ascending: false })
      .limit(5)
      .then(({ data }) => setTorneos(data || []));
  }, [club]);

  const torneosActivos = torneos.filter((t) => t.estado === "abierto" || t.estado === "en_curso").length;

  return (
    <div className="bg-background text-text-primary font-body-md min-h-screen flex antialiased">
      <aside className={"bg-surface-container-lowest border-r border-border-subtle h-screen sticky top-0 flex-col hidden md:flex z-40 transition-all duration-300 " + (collapsed ? "w-20" : "w-64")}>
        <div className="p-stack-md flex items-center justify-between">
          {!collapsed && <span className="font-headline-lg text-headline-lg font-bold tracking-tighter text-on-surface">Padel Pro</span>}
          <button className="text-text-secondary hover:text-text-primary" onClick={() => setCollapsed((c) => !c)}>
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        </div>
        <nav className="flex-1 px-inline-gutter py-stack-sm space-y-2 overflow-y-auto">
          {adminNav.map((item) => {
            const active = item.to && pathname === item.to;
            const classes =
              "flex items-center gap-4 p-3 rounded-lg font-label-caps text-label-caps transition-all active:scale-95 " +
              (active
                ? "bg-primary-container text-on-primary-container"
                : "text-text-secondary hover:bg-surface-container-low hover:text-text-primary");
            const content = (
              <>
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
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
        </nav>
        <div className="p-stack-md border-t border-border-subtle mt-auto">
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0 mx-auto">
              <img className="w-full h-full object-cover" src={AVATAR_ADMIN} alt="Admin" />
            </div>
          ) : (
            <SidebarProfileMenu nombre={profile?.nombre || "Admin User"} subtitulo={profile?.telefono || "admin@padelpro.com"} avatarUrl={profile?.avatar_url || AVATAR_ADMIN} />
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-surface sticky top-0 z-30 px-container-margin py-stack-md flex justify-between items-end border-b border-border-subtle md:border-none">
          <div>
            <h1 className="font-headline-lg text-headline-lg md:text-headline-xl md:font-headline-xl text-on-surface mb-1">¡Qué hacés, Admin!</h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Hoy es <span className="font-semibold text-text-primary">Jueves, 24 de Octubre</span>. Dale que venimos bien.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowNotifs(true)}
              className="w-12 h-12 rounded-full bg-surface-container-lowest border border-border-subtle flex items-center justify-center text-text-primary hover:bg-surface-container-low active:scale-90 transition-all relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-3 h-3 bg-primary-container rounded-full border-2 border-surface-container-lowest animate-pulse-soft"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-container-margin md:p-stack-lg space-y-stack-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-inline-gutter">
            {[
              { label: "Ocupación Hoy", icon: "monitoring", value: "85%", size: "56px", color: "text-primary-fixed" },
              { label: "Ingresos del Día", icon: "payments", value: "$450k", size: "48px", color: "text-on-ink-fixed" },
              { label: "Reservas Activas", icon: "calendar_today", value: "12", size: "56px", color: "text-primary-fixed" },
              { label: "Torneos Activos", icon: "emoji_events", value: String(torneosActivos), size: "56px", color: "text-on-ink-fixed" },
            ].map((m, i) => (
              <div
                key={m.label}
                className="animate-item bg-inverse-surface rounded-kondor p-stack-md flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all"></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <h3 className="font-label-caps text-label-caps text-on-ink-fixed/70 uppercase">{m.label}</h3>
                  <span className={"material-symbols-outlined " + m.color}>{m.icon}</span>
                </div>
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className={"font-headline-xl leading-none font-extrabold " + m.color} style={{ fontSize: m.size }}>
                    {m.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-inline-gutter items-start">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-kondor p-stack-md shadow-sm border border-border-subtle">
              <div className="flex justify-between items-center mb-stack-md">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Próximos Turnos</h2>
                <button
                  onClick={() => navigate("/timeline-de-canchas")}
                  className="font-label-caps text-label-caps text-primary hover:text-primary-container active:scale-95 transition-all uppercase"
                >
                  Ver Todos
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary font-semibold uppercase">Hora</th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary font-semibold uppercase">Cancha</th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary font-semibold uppercase">Cliente</th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-text-secondary font-semibold uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md">
                    <tr className="border-b border-border-subtle/50 hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4 font-semibold">18:00</td>
                      <td className="py-4 px-4">Cancha 1 (Cristal)</td>
                      <td className="py-4 px-4">Martín P.</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-status-ok/10 text-status-ok font-label-caps text-[10px] uppercase">Confirmado</span>
                      </td>
                    </tr>
                    <tr className="border-b border-border-subtle/50 hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4 font-semibold">18:30</td>
                      <td className="py-4 px-4">Cancha 3 (Muro)</td>
                      <td className="py-4 px-4">Sofía L.</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-status-pending/10 text-status-pending font-label-caps text-[10px] uppercase">Pendiente P.</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4 font-semibold">19:30</td>
                      <td className="py-4 px-4">Cancha 2 (Cristal)</td>
                      <td className="py-4 px-4">Lucas G.</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-status-ok/10 text-status-ok font-label-caps text-[10px] uppercase">Confirmado</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-kondor p-stack-md shadow-sm border border-border-subtle h-full flex flex-col">
              <div className="flex justify-between items-center mb-stack-md">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Tus Torneos</h2>
                <button
                  onClick={() => navigate("/admin/torneos")}
                  className="font-label-caps text-label-caps text-primary hover:text-primary-container active:scale-95 transition-all uppercase"
                >
                  Ver Todos
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {torneos.length === 0 && (
                  <p className="text-body-md font-body-md text-text-secondary py-6 text-center">Todavía no creaste ningún torneo.</p>
                )}
                {torneos.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate("/admin/torneos")}
                    className="text-left bg-surface-container-low hover:bg-surface-container-high rounded-lg p-3 transition-colors"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-body-md font-body-md font-bold text-on-surface truncate">{t.nombre}</span>
                      <span className={"shrink-0 px-2 py-0.5 rounded-full text-[10px] font-label-caps uppercase " + ESTADO_STYLE[t.estado]}>
                        {ESTADO_LABEL[t.estado]}
                      </span>
                    </div>
                    <p className="font-label-muted text-label-muted text-text-secondary mt-1">
                      {fmtFecha(t.fecha_inicio)} • {(t.torneo_categorias || []).length} categorías
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md fixed bottom-0 w-full z-50 rounded-t-xl border-t border-border-subtle dark:border-outline-variant shadow-lg flex justify-around items-end pb-6 pt-2 px-6">
        {adminMobileNav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={
                active
                  ? "flex items-center justify-center bg-primary dark:bg-primary-fixed text-on-primary dark:text-on-primary-fixed rounded-full w-12 h-12 mb-2 shadow-md scale-110 transition-transform duration-300 ease-out"
                  : "flex flex-col items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant w-12 h-12 hover:text-primary transition-all"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} anchor="bottom-left" />
    </div>
  );
}
