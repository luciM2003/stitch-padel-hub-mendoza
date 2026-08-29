import { useState } from "react";
import { useNavigate } from "react-router-dom";

const fechasBase = [
  { dia: "Dom", num: 20 },
  { dia: "Lun", num: 21 },
  { dia: "Mar", num: 22 },
  { dia: "Mié", num: 23 },
  { dia: "Jue", num: 24 },
];

const fechasExtra = [
  { dia: "Vie", num: 25 },
  { dia: "Sáb", num: 26 },
  { dia: "Dom", num: 27 },
];

const slots = [
  { hora: "08:00", estado: "ocupado" },
  { hora: "09:30", estado: "ocupado" },
  { hora: "11:00", estado: "libre" },
  { hora: "12:30", estado: "libre" },
  { hora: "14:00", estado: "libre" },
  { hora: "15:30", estado: "libre", promo: true },
  { hora: "17:00", estado: "libre" },
  { hora: "18:30", estado: "ocupado" },
  { hora: "20:00", estado: "ocupado" },
  { hora: "21:30", estado: "libre" },
];

export default function SelectorDeHorarios() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(21);
  const [hora, setHora] = useState("12:30");
  const [verMas, setVerMas] = useState(false);

  const fechas = verMas ? [...fechasBase, ...fechasExtra] : fechasBase;
  const diaSeleccionado = [...fechasBase, ...fechasExtra].find((f) => f.num === fecha)?.dia || fechasBase[0].dia;

  function confirmarHorario() {
    navigate("/resumen-y-pago", {
      state: { fechaLabel: `${diaSeleccionado} ${fecha}`, hora, cancha: "Cancha 1 - Techada", sede: "Kondor Sede" },
    });
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center font-body-md">
    <div className="w-full max-w-md bg-surface-container-lowest min-h-screen flex flex-col pb-[100px] shadow-sm relative">
      <header className="flex items-center justify-between px-container-margin py-stack-md">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface active:scale-90 transition-transform"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">Horarios</h1>
        <div className="w-10 h-10"></div>
      </header>

      <main className="flex-1 px-container-margin">
        <section className="mb-stack-lg animate-item">
          <div className="flex items-center justify-between mb-stack-sm">
            <h2 className="font-body-lg text-body-lg font-semibold">Agosto 2026</h2>
            <button onClick={() => setVerMas((v) => !v)} className="text-primary font-label-caps text-label-caps hover:underline">
              {verMas ? "VER MENOS" : "VER CALENDARIO"}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {fechas.map((f, i) => {
              const active = fecha === f.num;
              return (
                <button
                  key={f.num}
                  onClick={() => setFecha(f.num)}
                  className={
                    "animate-item flex flex-col items-center justify-center min-w-[72px] h-[90px] rounded-xl shrink-0 transition-all active:scale-95 " +
                    (active
                      ? "bg-primary-fixed text-on-primary-fixed shadow-sm scale-105"
                      : "bg-surface-container-lowest border border-border-subtle hover:border-primary")
                  }
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className={"font-label-muted text-label-muted uppercase mb-1" + (active ? "" : " text-text-secondary")}>{f.dia}</span>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile">{f.num}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-stack-lg flex gap-4 items-center bg-inverse-surface text-on-ink-fixed p-4 rounded-xl animate-item" style={{ animationDelay: "80ms" }}>
          <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden shrink-0 relative">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0WaB8rfzp47GmDKBYBeks3laLezMr3z8fICWkhGeoGiKHptih3hTImVRH-2jwbpgLqRpni96oASvjsw6-Kr3c9VZs49tJ5j5RShRS2VmCqAj5Tlbvh-QuyiKD7z2-Oxo473nobxF5c7avClhdDNKkmJIGJeqvJByrL-7YkmwJxp6j4MCu7HBOQSjzgVF4GyxcWMry4_VPZM-7UycshgSspA33WsM2pFIDQCzL-Hf3uK5JPP2JW8M"
            />
          </div>
          <div>
            <h3 className="font-body-lg text-body-lg font-semibold text-white">Cancha 1 - Techada</h3>
            <p className="font-label-muted text-label-muted text-on-ink-fixed/70 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">sports_tennis</span>
              Dobles • Cristal
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-stack-sm">
            <h2 className="font-body-lg text-body-lg font-semibold">Turnos Disponibles</h2>
            <span className="font-label-muted text-label-muted text-text-secondary">Sesiones de 90 min</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {slots.map((s, i) => {
              if (s.estado === "ocupado") {
                return (
                  <div
                    key={s.hora}
                    className="animate-item flex flex-col p-4 rounded-xl bg-surface-container-high border border-surface-container-highest opacity-60 cursor-not-allowed"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="font-body-lg text-body-lg font-semibold text-text-secondary">{s.hora}</span>
                    <span className="font-label-caps text-label-caps text-text-secondary mt-1">OCUPADO</span>
                  </div>
                );
              }
              const selected = hora === s.hora;
              return (
                <button
                  key={s.hora}
                  onClick={() => setHora(s.hora)}
                  className={
                    "animate-item flex flex-col p-4 rounded-xl text-left transition-all active:scale-95 relative overflow-hidden " +
                    (selected
                      ? "bg-primary-fixed border border-primary-fixed text-on-primary-fixed shadow-md scale-[1.02]"
                      : s.promo
                      ? "bg-surface-container-lowest border border-primary-fixed/50 hover:border-primary-fixed"
                      : "bg-surface-container-lowest border border-border-subtle hover:border-primary")
                  }
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {s.promo && !selected && (
                    <div className="absolute -top-2 -right-2 bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-label-caps text-[10px]">
                      PROMO
                    </div>
                  )}
                  <span className={"font-body-lg text-body-lg font-semibold" + (selected ? "" : " text-on-surface")}>{s.hora}</span>
                  <span className={"font-label-caps text-label-caps mt-1" + (selected ? " opacity-90" : " text-text-secondary")}>
                    {selected ? "SELECCIONADO" : "LIBRE"}
                  </span>
                  {selected && (
                    <span className="material-symbols-outlined absolute top-4 right-4 text-[20px] animate-bounce-in">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 w-full max-w-md p-container-margin bg-surface-bright/90 backdrop-blur-md border-t border-border-subtle z-40">
        <button
          disabled={!hora}
          onClick={confirmarHorario}
          className="w-full bg-primary-fixed text-on-primary-fixed font-body-lg text-body-lg font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Siguiente: Extras
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
    </div>
  );
}
