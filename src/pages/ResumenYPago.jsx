import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";

const BASE_TURNO = 4500;

const fmt = (n) => "$" + n.toLocaleString("es-AR");

export default function ResumenYPago() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const sede = state?.sede || "Kondor Sede";
  const cancha = state?.cancha || "Cancha 3";
  const fechaHora = state?.fechaLabel && state?.hora ? `${state.fechaLabel} - ${state.hora}hs` : "21 Ago - 20:30hs";
  const [showExtras, setShowExtras] = useState(false);
  const [extras, setExtras] = useState([
    { id: 1, nombre: "Alquiler de paleta x2", precio: 3000, incluido: true },
    { id: 2, nombre: "Tubo de pelotas x3", precio: 4500, incluido: true },
  ]);

  const total = useMemo(() => BASE_TURNO + extras.filter((e) => e.incluido).reduce((s, e) => s + e.precio, 0), [extras]);
  const sena = Math.round(total * 0.3);
  const resto = total - sena;

  function toggleExtra(id) {
    setExtras((prev) => prev.map((e) => (e.id === id ? { ...e, incluido: !e.incluido } : e)));
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md bg-surface-container-lowest min-h-screen flex flex-col shadow-sm pb-32 relative overflow-hidden">
        <header className="flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface-container-lowest sticky top-0 z-10 border-b border-border-subtle">
          <button
            aria-label="Volver"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high active:scale-90 transition-all text-on-surface"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
              arrow_back
            </span>
          </button>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface flex-1 text-center pr-10">Resumen</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-container-margin py-stack-md space-y-stack-md">
          <section className="bg-inverse-surface text-on-ink-fixed rounded-xl p-6 shadow-lg relative overflow-hidden animate-item">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-label-muted font-label-muted text-primary-fixed mb-1 uppercase tracking-wider">Sede</p>
                  <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-white">{sede}</h2>
                </div>
                <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-label-caps font-label-caps">Confirmar</div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                <div>
                  <p className="text-label-muted font-label-muted text-secondary-fixed-dim mb-1">Cancha</p>
                  <p className="text-body-md font-body-md font-medium text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">sports_tennis</span> {cancha}
                  </p>
                </div>
                <div>
                  <p className="text-label-muted font-label-muted text-secondary-fixed-dim mb-1">Fecha y Hora</p>
                  <p className="text-body-md font-body-md font-medium text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">event</span> {fechaHora}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl border border-border-subtle p-5 animate-item" style={{ animationDelay: "60ms" }}>
            <h3 className="text-body-lg font-body-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_circle</span> Extras
            </h3>
            <ul className="space-y-3">
              {extras
                .filter((e) => e.incluido)
                .map((e) => (
                  <li key={e.id} className="flex justify-between items-center text-body-md font-body-md">
                    <span className="text-on-surface-variant">{e.nombre}</span>
                    <span className="font-medium">{fmt(e.precio)}</span>
                  </li>
                ))}
              {extras.every((e) => !e.incluido) && <li className="text-text-secondary text-body-md">Sin extras seleccionados</li>}
            </ul>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <button
                onClick={() => setShowExtras(true)}
                className="w-full py-2 flex items-center justify-center gap-2 text-primary text-label-caps font-label-caps uppercase hover:bg-surface-container active:scale-95 transition-all rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span> Modificar Extras
              </button>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl border border-border-subtle p-5 animate-item" style={{ animationDelay: "120ms" }}>
            <h3 className="text-body-lg font-body-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span> Medio de Pago
            </h3>
            <div className="flex items-center justify-between p-3 border-2 border-primary rounded-lg bg-surface-bright">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#009EE3] rounded flex items-center justify-center text-white font-bold text-xs">MP</div>
                <div>
                  <p className="text-body-md font-body-md font-medium text-on-surface">Mercado Pago</p>
                  <p className="text-label-muted font-label-muted text-text-secondary">Saldo o Tarjetas</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              </div>
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 w-full max-w-md bg-surface-container-lowest border-t border-border-subtle shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="px-container-margin py-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-body-md font-body-md text-on-surface-variant">Total Turno + Extras</span>
              <span className="text-body-md font-body-md font-semibold text-text-secondary transition-all">{fmt(total)}</span>
            </div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-body-lg font-body-lg font-bold text-on-surface">Seña (30%)</span>
              <span className="text-headline-lg-mobile font-headline-lg-mobile text-primary transition-all">{fmt(sena)}</span>
            </div>
            <button
              onClick={() => navigate("/mis-reservas")}
              className="w-full bg-primary-container text-on-primary-container font-headline-lg-mobile text-[18px] py-4 rounded-full flex justify-center items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              Pagar Seña y Confirmar
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-center text-label-muted font-label-muted text-text-secondary mt-3">El resto ({fmt(resto)}) se abona en el club.</p>
          </div>
        </div>
      </div>

      <Modal open={showExtras} onClose={() => setShowExtras(false)} title="Modificar Extras">
        <div className="flex flex-col gap-3">
          {extras.map((e) => (
            <label
              key={e.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-pointer"
            >
              <div>
                <p className="text-body-md font-body-md font-medium text-on-surface">{e.nombre}</p>
                <p className="text-label-muted font-label-muted text-text-secondary">{fmt(e.precio)}</p>
              </div>
              <input
                type="checkbox"
                checked={e.incluido}
                onChange={() => toggleExtra(e.id)}
                className="w-5 h-5 accent-primary"
              />
            </label>
          ))}
        </div>
        <button
          onClick={() => setShowExtras(false)}
          className="w-full mt-5 bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Listo
        </button>
      </Modal>
    </div>
  );
}
