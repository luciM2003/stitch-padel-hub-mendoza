import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import PlayerSidebar from "../components/PlayerSidebar.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";

const historial = [
  { sede: "Club Central Padel", fecha: "12 Oct", hora: "18:00 - 19:30", cancha: "Cancha 2" },
  { sede: "Kondor Sede", fecha: "5 Oct", hora: "20:00 - 21:30", cancha: "Cancha 1" },
];

export default function MisReservas() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [tab, setTab] = useState("proximas");
  const [showNotifs, setShowNotifs] = useState(false);
  const [invitar, setInvitar] = useState(null);

  function copiarEnlace() {
    const link = "https://padelhub.app/invite/" + Math.random().toString(36).slice(2, 8);
    navigator.clipboard?.writeText(link).catch(() => {});
    showToast("Enlace copiado al portapapeles");
    setInvitar(null);
  }

  return (
    <div className="md:flex">
      <PlayerSidebar />
      <div className="flex-1 min-w-0 bg-background text-on-background antialiased min-h-screen pb-32 md:pb-8">
      <header className="bg-surface text-primary sticky top-0 z-40 w-full flex justify-between items-center px-container-margin py-stack-sm">
        <div className="flex items-center gap-4">
          <img
            alt="User profile photo"
            className="w-10 h-10 rounded-full object-cover border border-border-subtle"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAK8gAzOIJP8zQu1gbJRVX6xFNLzKNW0HpMmL83eb2lAMfuCZfjgMQa161dlhR5a_NiLdhzQOUS13pYsGis2GTM6qUrdiNh_aHVdE6WPaCkogzCGH4_s3yk2VhswnsFdBdghXOSe6e1Sz7KbdlzEB2wx9yT3oStqTFOHeYR7wCZCQQ3FFISCX0M7qEdQva-uy4AjnpVvF8BlXuPMxhs9PA2mzaMP8ITA-R_eC7XvX_WSWpDMGK8tc"
          />
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface tracking-tight">Mis Reservas</h1>
        </div>
        <button
          onClick={() => setShowNotifs(true)}
          className="hover:bg-surface-container-high transition-colors w-10 h-10 rounded-full flex items-center justify-center opacity-80 hover:scale-95 active:scale-90 transition-all text-primary"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="px-container-margin mt-stack-md max-w-3xl mx-auto">
        <div className="flex gap-4 mb-stack-lg overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setTab("proximas")}
            className={
              "transition-all active:scale-95 " +
              (tab === "proximas"
                ? "px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps whitespace-nowrap"
                : "px-6 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps whitespace-nowrap hover:bg-surface-container-high")
            }
          >
            Próximas
          </button>
          <button
            onClick={() => setTab("historial")}
            className={
              "transition-all active:scale-95 " +
              (tab === "historial"
                ? "px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps whitespace-nowrap"
                : "px-6 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps whitespace-nowrap hover:bg-surface-container-high")
            }
          >
            Historial
          </button>
        </div>

        {tab === "proximas" ? (
          <div className="flex flex-col gap-stack-md animate-item">
            <div className="bg-on-surface text-surface-container-lowest rounded-[32px] overflow-hidden relative group">
              <div className="h-48 relative overflow-hidden">
                <img
                  alt="Kondor Sede Court"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIYfa94opgRV4Xln3lR0x0FFs3Of7PUNoR1EgSqnnaknKX8GsfrACUyuS4-2w8SMjH_9alAmk3UHzBjKaN27Eo39Qt0JP8B7ITVXhOmVW719Sm4VhPZjkmaSjvOTOj2KzP6VCjw7CuqH0-Pw9KvTUEISU-l73sTdRISzN3h_irbu31ZyqpCICW7b6HILJ7sbnSyH-63JknDVosaWvB2_qwGZUBEyRzp3qCnMdoIZDyqfpX9_V9mh4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-label-caps font-label-caps flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  En 2 horas
                </div>
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-white mb-1">Kondor Sede Norte</h2>
                  <p className="text-body-md font-body-md text-surface-dim opacity-90 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    Cancha 3 - Indoor
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-surface-variant/20">
                  <div>
                    <p className="text-label-caps font-label-caps text-surface-dim opacity-70 mb-1">FECHA</p>
                    <p className="text-body-lg font-body-lg text-white">Hoy, 18 Oct</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label-caps font-label-caps text-surface-dim opacity-70 mb-1">HORA</p>
                    <p className="text-body-lg font-body-lg text-white">19:00 - 20:30</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    className="flex-1 bg-surface-container-low/10 text-white rounded-full py-3 px-4 text-body-md font-body-md font-semibold hover:bg-surface-container-low/20 active:scale-95 transition-all border border-surface-variant/20"
                    onClick={() => navigate("/detalle-del-partido")}
                  >
                    Ver Detalle
                  </button>
                  <button
                    onClick={() => setInvitar("Kondor Sede Norte")}
                    className="flex-1 bg-primary-fixed text-on-primary-fixed rounded-full py-3 px-4 text-body-md font-body-md font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">person_add</span>
                    Invitar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-[32px] overflow-hidden">
              <div className="h-32 relative overflow-hidden">
                <img
                  alt="Club Central Court"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgrdVEm58zQL4fazTcgnupwdYeiRJZzUDPD3dvqwig1_x5eVpYC21OTYfXFB5hP78ijA-IOmYIFcHu6vKFCgBjKMWS3Ay-7l0FIvPL3sIRdt3LKC24sfco3sniLyMq6tbuK63Da2UDKQNGNjGfuBIDWPXRuN-hMs6elbDd2OmnEA5B2RH5C4jNgVbGsbHxkFTfal46G_wbsG_G4v69U2eYR2tfKr_T59pjqjpko-QXsNKsX4_t02Q"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-white mb-1">Club Central Padel</h2>
                  <p className="text-body-md font-body-md text-surface-dim opacity-90 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    Cancha 1 - Outdoor
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-border-subtle">
                  <div>
                    <p className="text-label-caps font-label-caps text-secondary mb-1">FECHA</p>
                    <p className="text-body-lg font-body-lg text-on-surface">Sáb, 21 Oct</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label-caps font-label-caps text-secondary mb-1">HORA</p>
                    <p className="text-body-lg font-body-lg text-on-surface">10:00 - 11:30</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    className="flex-1 bg-surface text-on-surface rounded-full py-3 px-4 text-body-md font-body-md font-semibold border border-border-subtle hover:bg-surface-container-low active:scale-95 transition-all"
                    onClick={() => navigate("/detalle-del-partido")}
                  >
                    Ver Detalle
                  </button>
                  <button
                    onClick={() => setInvitar("Club Central Padel")}
                    className="flex-1 bg-on-surface text-surface-container-lowest rounded-full py-3 px-4 text-body-md font-body-md font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Invitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-stack-md animate-item">
            {historial.map((h, i) => (
              <div
                key={i}
                className="animate-item bg-surface-container-lowest border border-border-subtle rounded-2xl p-5 flex items-center justify-between hover:border-outline-variant transition-colors"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <div>
                    <p className="text-body-md font-body-md font-bold text-on-surface">{h.sede}</p>
                    <p className="text-label-muted font-label-muted text-text-secondary">
                      {h.fecha} • {h.hora} • {h.cancha}
                    </p>
                  </div>
                </div>
                <span className="text-label-caps font-label-caps text-text-secondary uppercase">Finalizada</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />

      <Modal open={!!invitar} onClose={() => setInvitar(null)} title="Invitar jugadores">
        <p className="text-body-md font-body-md text-text-secondary mb-4">
          Compartí este enlace para invitar gente a tu reserva en <strong>{invitar}</strong>.
        </p>
        <div className="flex items-center gap-2 bg-surface-container-low border border-border-subtle rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-text-secondary">link</span>
          <span className="text-body-md font-body-md text-text-secondary truncate flex-1">padelhub.app/invite/xxxxx</span>
        </div>
        <button
          onClick={copiarEnlace}
          className="w-full mt-4 bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Copiar enlace
        </button>
      </Modal>

      <BottomNav />
      </div>
    </div>
  );
}
