import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import PlayerSidebar from "../components/PlayerSidebar.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import PerfilTorneosSection from "../components/PerfilTorneosSection.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const actividadBase = [
  {
    icon: "sports_score",
    title: "Victoria vs. Diego L.",
    desc: "Club Padel Madrid • 6-4, 7-5",
    time: "Ayer",
    extra: "+25 pts",
    extraColor: "text-primary",
    to: "/detalle-del-partido",
  },
  {
    icon: "event_available",
    title: "Cancha reservada",
    desc: "Indoor Pro Center • Cancha 3",
    time: "Hace 2 días",
    to: "/detalle-del-complejo",
  },
  {
    icon: "sports_score",
    title: "Derrota vs. Carlos M.",
    desc: "Sunset Padel Club • 3-6, 4-6",
    time: "Hace 4 días",
    extra: "-10 pts",
    extraColor: "text-status-error",
    opaco: true,
    to: "/detalle-del-partido",
  },
];

const actividadExtra = [
  {
    icon: "sports_score",
    title: "Victoria vs. Sofía P.",
    desc: "Kondor Sede • 6-2, 6-3",
    time: "1 semana atrás",
    extra: "+22 pts",
    extraColor: "text-primary",
    to: "/detalle-del-partido",
  },
  {
    icon: "event_available",
    title: "Cancha reservada",
    desc: "Club Central Padel • Cancha 1",
    time: "2 semanas atrás",
    to: "/detalle-del-complejo",
  },
];

export default function PerfilDeUsuario() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const actividad = showMore ? [...actividadBase, ...actividadExtra] : actividadBase;

  return (
    <div className="md:flex">
      <PlayerSidebar />
      <div className="flex-1 min-w-0 bg-background text-on-background font-body-md min-h-screen pb-24 md:pb-0">
      <header className="bg-surface flex justify-between items-center px-container-margin py-stack-sm w-full z-40 sticky top-0">
        <div
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-inline-gutter hover:bg-surface-container-high transition-colors rounded-full p-1 cursor-pointer"
        >
          <img
            className="w-10 h-10 rounded-full object-cover shadow-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGbta5o8gUiEawdwajMDy3rHHNWbD86sdpjUMRRokj-RZZme5yQk6M51mwshb8feTD620s2gyWjISWIQvZxWTaQ_KCoMihM_40Tym58o6AgN8UPQTBnpsjXnx-FMPUuYRBN6OrV6UxQy3GwVy4uhduUvP_ASUOy7oT1CUkkjcSzmViP-y4lopXKqQT3pylR_p02DK-SH1HsOdKK757a4Ec4WXD0AGXMeXgjxpd7T3-z1yPB5nhrGg"
          />
        </div>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Padel Pro</h1>
        <button
          aria-label="Configuración"
          onClick={() => setShowSettings(true)}
          className="hover:bg-surface-container-high transition-colors rounded-full p-2 flex items-center justify-center opacity-80 hover:opacity-100 active:scale-90 transition-all text-secondary"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="px-container-margin py-stack-md max-w-6xl mx-auto flex flex-col gap-stack-lg lg:flex-row lg:items-start">
        <div className="flex flex-col gap-stack-lg lg:w-[320px] lg:shrink-0 lg:sticky lg:top-24">
          <section className="flex flex-col items-center text-center gap-stack-sm mt-4 lg:mt-0 animate-item">
            <div className="relative">
              <img
                className="w-32 h-32 rounded-full object-cover border-4 border-surface-container shadow-md"
                src={
                  profile?.avatar_url ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdl56wQuhbAKUQoVNMPDfngkjD8_5iUylW7Eeviwugi4w3ABvUJLF4v0HeP7s5-OMnNgfDgPbTkzYm5kfUO9ep2E2HTvGYjzGQJ9PzKqWgyQ8taSiJbHj7PWM-N6oME4oBMfpUJQgXusHOTxcjLnfTR7BWCuVB95ECesDjdy1tXedzfxWxrZBZDbbVWM0DM7BqZZZk232FMBKd99jSUq7V37z0HoBnOnbX-1O1u5ZJNQEaIjvdjYw"
                }
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary font-headline-lg-mobile text-headline-lg-mobile font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-surface-container-lowest">
                {profile?.nivel || "4.5"}
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">{profile?.nombre || "Mateo R."}</h2>
              <p className="text-body-md font-body-md text-text-secondary mt-1 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Madrid, ES
              </p>
            </div>
            <div className="flex gap-inline-gutter mt-2">
              <span className="bg-surface-container px-4 py-1 rounded-full text-label-caps font-label-caps text-on-surface uppercase border border-border-subtle">Agresivo</span>
              <span className="bg-surface-container px-4 py-1 rounded-full text-label-caps font-label-caps text-on-surface uppercase border border-border-subtle">Diestro</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 animate-item" style={{ animationDelay: "80ms" }}>
            <div className="bg-inverse-surface text-on-ink-fixed rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="z-10 relative">
                <span className="material-symbols-outlined text-on-ink-fixed mb-2 opacity-70" style={{ fontVariationSettings: "'FILL' 1" }}>
                  sports_tennis
                </span>
                <h3 className="text-label-caps font-label-caps text-secondary-fixed uppercase tracking-wider">Partidos</h3>
              </div>
              <div className="text-headline-xl font-headline-xl font-extrabold z-10 relative mt-4">142</div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-surface-variant rounded-full opacity-10"></div>
            </div>
            <div className="bg-inverse-surface text-on-ink-fixed rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="z-10 relative">
                <span className="material-symbols-outlined text-primary-fixed mb-2 opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>
                  emoji_events
                </span>
                <h3 className="text-label-caps font-label-caps text-primary-fixed uppercase tracking-wider">% de Victorias</h3>
              </div>
              <div className="text-headline-xl font-headline-xl font-extrabold z-10 relative mt-4">
                68<span className="text-body-lg font-body-lg ml-1 text-secondary-fixed-dim">%</span>
              </div>
            </div>
            <div className="col-span-2 bg-surface-container-lowest border border-border-subtle rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-label-caps font-label-caps text-secondary uppercase tracking-wider">Forma Reciente</h3>
                <span className="text-label-muted font-label-muted text-text-secondary">Últimos 5</span>
              </div>
              <div className="flex justify-between items-center px-2">
                {["W", "W", "L", "W", "W"].map((r, i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && <div className="w-4 h-px bg-border-subtle"></div>}
                    <div
                      className={
                        "w-10 h-10 rounded-full text-on-primary flex items-center justify-center font-bold font-body-md text-body-md shadow-sm hover:scale-110 transition-transform " +
                        (r === "W" ? "bg-status-ok" : "bg-status-error opacity-80")
                      }
                    >
                      {r}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-stack-lg flex-1 min-w-0">
          <PerfilTorneosSection userId={user?.id} />

          <section className="flex flex-col gap-4">
            <h3 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface mb-2">Actividad Reciente</h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {actividad.map((a, i) => (
                <div
                  key={i}
                  onClick={() => navigate(a.to)}
                  className={
                    "animate-item bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex items-center gap-4 hover:border-primary hover:-translate-y-0.5 transition-all cursor-pointer" +
                    (a.opaco ? " opacity-70" : "")
                  }
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface shrink-0">
                    <span className="material-symbols-outlined">{a.icon}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-body-md font-body-md font-bold text-on-surface truncate">{a.title}</h4>
                    <p className="text-label-muted font-label-muted text-text-secondary truncate">{a.desc}</p>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-label-muted font-label-muted text-text-secondary block">{a.time}</span>
                    {a.extra && <span className={`font-bold text-sm ${a.extraColor}`}>{a.extra}</span>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMore((v) => !v)}
              className="w-full py-4 mt-2 text-label-caps font-label-caps text-on-surface uppercase tracking-widest border border-border-subtle rounded-full hover:bg-surface-container-high active:scale-[0.98] transition-all"
            >
              {showMore ? "Ver menos" : "Ver Todo el Historial"}
            </button>
          </section>
        </div>
      </main>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <BottomNav />
      </div>
    </div>
  );
}
