import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import PlayerSidebar from "../components/PlayerSidebar.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const AVATAR_DEMO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDV9jtoStxOAlRpzXXf43OWAdu-_YJgJTKcwBpyVSH7eBsS_7k_aRDnPaueHGU_niW3hlbMK5dQF_aazzy694sdIe_cyNu4yhtYovlwgAGgEg0GG0Jkudx9_7aHZZpmR_5W6SntsEJdlPrDpTm_qLhsZUJsSkTKCtK_ySYPtEVtY9vpvgCBJ4vIpZRoThwCrR2QDvW0oC39a8CZgk01xCBtX_a61u71fvQd7O285RvLd920ty27NA8";

const sedesBase = [
  {
    nombre: "Kondor Sede",
    distancia: "A 2.5 km • 6 Canchas",
    rating: "4.8",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpcKn0qimTLTen2Vm1tJkjiOzyUVRrhpd4XibL4sWwm8eyxpFLy9knvljBuS3dyq0CSgoes7_LcANlA6Ec2WEoMK_IoUtmE85xKshhyfKevW2_DgMcTawoVK79yo9tQEXck6eiFHr03VN-QDU1AKxExqD-jp4UTYGmoAZtmM4tMTx8LIyIkU9lazWMPtit-iJJwJ29sacGXRWWKdscmac48ArMd_1Dgx3gmDXoRRlwn2Y236aE7b0",
  },
  {
    nombre: "Padel Duendes",
    distancia: "A 4.1 km • 4 Canchas",
    rating: "4.5",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDss6FyvqNfNVu_HZrJSmuUJtacSPw0hpDAfxPUsvj8HqyHi9Ik7v-IS_Pdxa8Jjo7WcHRx2uNQ9OqZlgrsGcd-uG7bHXYQVyw7pc3NHMEIEJqASAyZHa2aKVivBfTgf0oNpKjL1bn3LE7--LIC-nxzpZ4_ETz2nYSf5OBB0obJ3Oc6RAkQBBiT8Fi6RbO_7tYtlK9YHUgfgq75mcc4c7gh_SYTHFkVOmR-834-TNqFstj0MuGo_kM",
  },
  {
    nombre: "Club Central Padel",
    distancia: "A 5.8 km • 8 Canchas",
    rating: "4.7",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgrdVEm58zQL4fazTcgnupwdYeiRJZzUDPD3dvqwig1_x5eVpYC21OTYfXFB5hP78ijA-IOmYIFcHu6vKFCgBjKMWS3Ay-7l0FIvPL3sIRdt3LKC24sfco3sniLyMq6tbuK63Da2UDKQNGNjGfuBIDWPXRuN-hMs6elbDd2OmnEA5B2RH5C4jNgVbGsbHxkFTfal46G_wbsG_G4v69U2eYR2tfKr_T59pjqjpko-QXsNKsX4_t02Q",
  },
  {
    nombre: "Kondor Sede Norte",
    distancia: "A 6.3 km • 5 Canchas",
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIYfa94opgRV4Xln3lR0x0FFs3Of7PUNoR1EgSqnnaknKX8GsfrACUyuS4-2w8SMjH_9alAmk3UHzBjKaN27Eo39Qt0JP8B7ITVXhOmVW719Sm4VhPZjkmaSjvOTOj2KzP6VCjw7CuqH0-Pw9KvTUEISU-l73sTdRISzN3h_irbu31ZyqpCICW7b6HILJ7sbnSyH-63JknDVosaWvB2_qwGZUBEyRzp3qCnMdoIZDyqfpX9_V9mh4",
  },
];

export default function HomeJugador() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const sedes = showAll ? sedesBase : sedesBase.slice(0, 2);
  const primerNombre = (profile?.nombre || "Mateo").trim().split(" ")[0];

  return (
    <div className="md:flex">
      <PlayerSidebar />
      <div className="flex-1 min-w-0 bg-background text-on-background min-h-screen pb-24 md:pb-0">
        <header className="flex justify-between items-center px-container-margin py-stack-md w-full bg-surface sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border border-border-subtle">
              <img alt="Perfil de usuario" className="w-full h-full object-cover" src={profile?.avatar_url || AVATAR_DEMO} />
            </div>
            <div>
              <p className="text-label-muted font-label-muted text-secondary">Buen día,</p>
              <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-text-primary">Hola, {primerNombre} 👋</h1>
            </div>
          </div>
          <button
            onClick={() => setShowNotifs(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high active:scale-90 transition-all text-primary relative"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
              notifications
            </span>
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-status-error rounded-full animate-pulse-soft"></span>
          </button>
        </header>

        <main className="px-container-margin flex flex-col gap-stack-lg max-w-6xl mx-auto mt-4">
          <section className="flex flex-col gap-stack-sm">
            <div className="bg-ink-fixed rounded-4xl p-6 md:p-10 text-on-ink-fixed relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-2xl hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-shadow duration-300">
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 pointer-events-none blur-3xl"
                style={{ background: "radial-gradient(circle, #D4F84A 0%, transparent 70%)" }}
              ></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <span className="inline-block px-3 py-1 bg-surface-container-highest/20 rounded-full text-label-caps font-label-caps text-on-ink-fixed backdrop-blur-sm mb-2">
                    Próxima Reserva
                  </span>
                  <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-ink-fixed">Hoy 20:30hs</h2>
                </div>
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    sports_tennis
                  </span>
                </div>
              </div>
              <div className="relative z-10 bg-inverse-surface/80 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-secondary-fixed-dim/20 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                      location_on
                    </span>
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-semibold text-on-ink-fixed">Kondor Sede</p>
                    <p className="text-label-muted font-label-muted text-secondary-fixed-dim">Cancha 3 • Dobles</p>
                  </div>
                </div>
                <button
                  className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-full text-label-caps font-label-caps font-bold hover:bg-inverse-primary active:scale-95 transition-all"
                  onClick={() => navigate("/detalle-del-partido")}
                >
                  Ver Detalle
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-inline-gutter">
            <button
              className="md:col-span-2 bg-primary-container rounded-3xl p-5 flex flex-col items-start justify-between h-36 md:h-44 hover:scale-[0.98] active:scale-95 transition-transform"
              onClick={() => navigate("/selector-de-horarios")}
            >
              <div className="w-10 h-10 bg-text-primary rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                  add
                </span>
              </div>
              <div className="text-left">
                <h3 className="text-body-md font-body-md font-bold text-text-primary">Reservar ahora</h3>
                <p className="text-label-muted font-label-muted text-on-surface-variant mt-1">Canchas libres</p>
              </div>
            </button>
            <button
              className="md:col-span-2 bg-surface-container-low rounded-3xl p-5 flex flex-col items-start justify-between h-36 md:h-44 border border-border-subtle hover:bg-surface-container-high transition-colors active:scale-95"
              onClick={() => navigate("/partidos-abiertos")}
            >
              <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center mb-4 text-text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  groups
                </span>
              </div>
              <div className="text-left">
                <h3 className="text-body-md font-body-md font-bold text-text-primary">Partidos Abiertos</h3>
                <p className="text-label-muted font-label-muted text-secondary mt-1">Únete a jugar</p>
              </div>
            </button>
          </section>

          <section className="flex flex-col gap-stack-sm mb-8">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-body-lg font-body-lg font-bold text-text-primary">Sedes cercanas</h2>
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-label-caps font-label-caps text-secondary hover:text-text-primary transition-colors"
              >
                {showAll ? "Ver menos" : "Ver todas"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-inline-gutter">
              {sedes.map((sede, i) => (
                <div
                  key={sede.nombre}
                  className="animate-item bg-surface rounded-2xl overflow-hidden border border-border-subtle group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
                  style={{ animationDelay: `${i * 70}ms` }}
                  onClick={() => navigate("/detalle-del-complejo")}
                >
                  <div className="h-32 w-full relative overflow-hidden">
                    <img alt={sede.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={sede.img} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-status-ok" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-label-caps font-label-caps text-text-primary">{sede.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="text-body-md font-body-md font-bold text-text-primary group-hover:text-primary transition-colors">{sede.nombre}</h3>
                    <p className="text-label-muted font-label-muted text-secondary">{sede.distancia}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
        <BottomNav />
      </div>
    </div>
  );
}
