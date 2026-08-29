import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast.jsx";

export default function DetalleDelPartido() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [unido, setUnido] = useState(false);

  function unirse() {
    setUnido(true);
    showToast("¡Te uniste al partido!");
  }

  async function compartir() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Partido de Padel", url });
        return;
      } catch {
        return;
      }
    }
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast("Enlace copiado al portapapeles");
  }

  return (
    <div className="bg-surface text-on-surface antialiased pb-32 min-h-screen">
      <header className="md:hidden flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface z-50 sticky top-0">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined text-text-primary">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Detalle Partido</h1>
        <button onClick={compartir} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all">
          <span className="material-symbols-outlined text-text-primary">share</span>
        </button>
      </header>
      <header className="hidden md:flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface border-b border-border-subtle z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined text-text-primary">arrow_back</span>
          </button>
          <span className="text-headline-lg font-headline-lg font-bold text-on-surface">Padel Pro</span>
        </div>
        <div className="flex items-center gap-6">
          <span onClick={compartir} className="material-symbols-outlined text-text-primary cursor-pointer hover:text-primary transition-colors">share</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto md:mt-8">
        <section className="relative w-full h-[353px] md:h-[442px] md:rounded-xl overflow-hidden shadow-sm">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7w_FlGQ3chxlsOdgh1i3saXIonGTX1NUOy7hrtzjFmDEMDp9tvrgn6CYQ1Q2RXjQYuLO-a-jc_ku-6ZlwSxHcQyA-Ux_Qx2gZSHzBU_Z_ptRw2cTm4bvLjCWoAZqDauO8Ec4qg-4beKFEHMVN3gVVWpO_ehCOPFy-aFvf8hCrujKqqCGLJOjLwSpLHdNVe6iMC_XRMbNZiU8MyBbBjI2GD6ZyBYriiiKCIxrE9PC-LcPTKwRl_wA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-container-margin md:p-stack-lg w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full mb-3 text-white">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span className="text-label-caps font-label-caps uppercase text-white">Kondor Sede</span>
            </div>
            <h2 className="text-headline-xl font-headline-xl text-white mb-1">Cancha 2</h2>
          </div>
        </section>

        <div className="px-container-margin py-stack-lg md:px-0">
          <div className="flex flex-wrap gap-4 items-center bg-surface-container-high p-4 rounded-xl mb-stack-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p className="text-label-caps font-label-caps text-text-secondary uppercase">Fecha y Hora</p>
                <p className="text-body-md font-body-md font-semibold text-on-surface">Viernes 25 Ago, 19:30hs</p>
              </div>
            </div>
            <div className="w-px h-10 bg-border-subtle hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div>
                <p className="text-label-caps font-label-caps text-text-secondary uppercase">Duración</p>
                <p className="text-body-md font-body-md font-semibold text-on-surface">90 min</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-stack-lg">
            <div className="border border-border-subtle p-4 rounded-xl flex items-start gap-4 bg-surface">
              <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
              <div>
                <h3 className="text-label-caps font-label-caps text-text-secondary uppercase mb-1">Nivel Requerido</h3>
                <p className="text-body-lg font-body-lg font-semibold text-on-surface">Nivel 4.5+</p>
                <p className="text-label-muted font-label-muted text-text-secondary">Intermedio / Avanzado</p>
              </div>
            </div>
            <div className="border border-border-subtle p-4 rounded-xl flex items-start gap-4 bg-surface">
              <span className="material-symbols-outlined text-primary text-[28px]">payments</span>
              <div>
                <h3 className="text-label-caps font-label-caps text-text-secondary uppercase mb-1">Precio</h3>
                <p className="text-body-lg font-body-lg font-semibold text-on-surface">$3.000</p>
                <p className="text-label-muted font-label-muted text-text-secondary">por persona</p>
              </div>
            </div>
          </div>

          <section className="mb-stack-lg">
            <div className="flex justify-between items-end mb-stack-sm">
              <h3 className="text-headline-lg-mobile font-headline-lg-mobile font-bold">Jugadores ({unido ? 3 : 2}/4)</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-high rounded-xl p-4 flex flex-col items-center justify-center text-center border border-transparent">
                <img
                  className="w-16 h-16 rounded-full object-cover mb-3"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa9zY_TNKk3b_Tzan5pjLRL4etN9haLKbjul-jFC7YL8b-Oz6oJ4N4z6YLogWy8Qxog9_T9SCAfk8Xfs6hQZ8cea6AD6wDjknfD7fJnMhOGLR5EOQL7UKAl1xCQy1C3uis_5b3mBVh0BF4J564l421TlwY5xcFM35h6Z1pD4SYsNwERYoJR3cMqZEdxor4NZbc9aoU1AQq3JlhuIhGFTdABzevBlyK4Z7XN7oOr2hByQFORPHYG8I"
                />
                <span className="text-body-md font-body-md font-semibold text-on-surface">Mateo R.</span>
                <span className="text-label-muted font-label-muted text-text-secondary mt-1 bg-surface px-2 py-0.5 rounded-full">Nivel 4.5</span>
              </div>
              <div className="bg-surface-container-high rounded-xl p-4 flex flex-col items-center justify-center text-center border border-transparent">
                <img
                  className="w-16 h-16 rounded-full object-cover mb-3"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOhYhXwnF6yUIfmhh4TGIpSUli6KUi2oIkfllyeFD7-tnIrIGdHg7cpEPy8qCzBY8ZVVicSE2M9Wwcvhunmls1szmlTCPQkOjgY9l0zXMms6y-GiqEegBNiQ95lZ_3rxEuEOSqtzV9gFN34s1POQZrOcHoLH_wu9iNwC0Va9T1LSFo8ni-NQnT9EZ0PxzumjgFxTnOIg0dDAHlN22zTUfVEm4N5Gy4HBvydk-9Ln4FtLYYsORBODg"
                />
                <span className="text-body-md font-body-md font-semibold text-on-surface">Lucas G.</span>
                <span className="text-label-muted font-label-muted text-text-secondary mt-1 bg-surface px-2 py-0.5 rounded-full">Nivel 5.0</span>
              </div>
              {unido ? (
                <div className="bg-surface-container-high rounded-xl p-4 flex flex-col items-center justify-center text-center border border-transparent">
                  <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-3 font-bold">
                    M
                  </div>
                  <span className="text-body-md font-body-md font-semibold text-on-surface">Vos</span>
                  <span className="text-label-muted font-label-muted text-text-secondary mt-1 bg-surface px-2 py-0.5 rounded-full">Anotado</span>
                </div>
              ) : (
                <button
                  onClick={unirse}
                  className="bg-surface border border-dashed border-border-subtle rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary-container/10 active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary mb-3">
                    <span className="material-symbols-outlined text-[24px]">person_add</span>
                  </div>
                  <span className="text-body-md font-body-md text-text-secondary">Lugar Libre</span>
                </button>
              )}
              <button
                onClick={unido ? undefined : unirse}
                disabled={unido}
                className="bg-surface border border-dashed border-border-subtle rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary-container/10 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary mb-3">
                  <span className="material-symbols-outlined text-[24px]">person_add</span>
                </div>
                <span className="text-body-md font-body-md text-text-secondary">Lugar Libre</span>
              </button>
            </div>
          </section>

          <section className="border border-border-subtle rounded-xl p-4 mb-8 bg-surface">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">chat_bubble</span>
                <h4 className="text-body-lg font-body-lg font-semibold">Chat del Partido</h4>
              </div>
              <span className="bg-surface-container-high text-label-caps font-label-caps px-2 py-1 rounded text-on-surface">1 NUEVO</span>
            </div>
            <div className="flex gap-3 items-start bg-surface-container-low p-3 rounded-lg">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_i112hRrb-zifleG5pKWW8HajxgWCktVKp8k5nbtlAoSpACJ4FjarDk2dqwQpXlbTfTturlu8-TVemVhqzDvMrqAUEIhLe0O_jq4lPVWkC3jCCPUoa_nHBY-PeNTeeCHMu2qW-JUgQECkfMuZDX48u1dw4coqDRXcK-vzsNlgdpop45QxEg_Ts1F-mpmvJdeMVBSgODd_OJHssIvTbmZdZmA-ojKyEtS7SM76jeoCwM4KCoU9k6E"
              />
              <div>
                <p className="text-label-caps font-label-caps text-text-secondary mb-0.5">Mateo R.</p>
                <p className="text-body-md font-body-md text-on-surface">Llevo pelotas nuevas! Nos vemos 19:15?</p>
              </div>
            </div>
            <button
              className="w-full mt-3 text-center text-label-caps font-label-caps text-primary uppercase hover:underline"
              onClick={() => navigate("/chat-del-partido")}
            >
              Abrir Chat Completo
            </button>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-container-margin bg-surface/90 backdrop-blur-md border-t border-border-subtle z-40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="hidden sm:block">
          <p className="text-label-caps font-label-caps text-text-secondary uppercase">Total a pagar ahora</p>
          <p className="text-headline-lg font-headline-lg font-bold text-on-surface">$3.000</p>
        </div>
        <button
          disabled={unido}
          onClick={unirse}
          className="w-full sm:w-auto bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase py-4 px-8 rounded-full shadow-lg hover:bg-inverse-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span>{unido ? "¡Anotado!" : "Unirme al Partido"}</span>
          <span className="material-symbols-outlined">{unido ? "check_circle" : "sports_tennis"}</span>
        </button>
      </div>
    </div>
  );
}
