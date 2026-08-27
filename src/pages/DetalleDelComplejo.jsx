import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast.jsx";

const tipos = ["Todos", "Techada", "Blindex", "Muro"];

const imagenes = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDMXfsZLQR0if5I6K4mD6ILzTxcKwhF9Wt5J-K00xhYbBUmXYo6XOQtritXv5XXUtheSbaCOZRU-C-EwChC40m3fbTJlcDsPae0T99dq174XEN3N7pxfqobbUkSKiP9k3O6S_md9OsyB2Ip1Eyi_Vlg4-lZC2h-gPu8f2xhffbtpd1o84qTX-kcE_JZR0JbvxxFknrEp0brNhsc0vSyowWcJp8w19DPQwMH1_iVXNj5jiyipW9amOc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAg5tkOwDzs9jzmdLWHoFIJq69wWZi73txiU1sdCsra3Fv04nSgnq4LcZoXSKcEHfJtKz3wpEs2G5tX8N3D1BK0yFvpKZ27wxIlox1kIlpekWv7MEPoYgGmiS6Lw0N_t3Z-bRBb_DUSyhS0d3UvCCTFY3dgl4aWQMLaat9Du2_QP3J3todq6hFKcYI6o-sPVVekjuV5lOJb8GE6sX1BOKlOu6SbRljZ7dflhyeR9ANGI30Dm2bWlPY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBHpKsl1VQscoeMJhaKKt5pqe7Kit0J_56vbs4eYM_t7PgohbabsVjPTFYkkHhNQk06sfM-mYmEnrFvszYTSUUuL64PVaKPwlI3m0zWqok9OloF7XXNrXvdO0ahh7qHOE0ced05Vsd15y2MtPOALYQvx459H99NIEoUdFYZNPKc1mZrsCZBl-5vjWoSeGTi3SVPHl9MMwdjpFKzrhTl2CRIvORFq4J3BMaYcoLYKdnox_8SCrZhqd4",
];

const canchas = [
  {
    nombre: "Cancha 1",
    tipo: "Techada • Panorámica",
    estado: "Libre",
    estadoColor: "bg-status-ok/10 text-status-ok",
    turno: "Próx. turno: 18:00",
    img: imagenes[1],
  },
  {
    nombre: "Cancha 2",
    tipo: "Blindex • Descubierta",
    estado: "Ocupada",
    estadoColor: "bg-status-pending/10 text-status-pending",
    turno: "Libre 20:30",
    img: imagenes[2],
  },
  {
    nombre: "Cancha 3",
    tipo: "Muro • Techada",
    estado: "Libre",
    estadoColor: "bg-status-ok/10 text-status-ok",
    turno: "Próx. turno: 17:00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXj-XDeD9GyINKtDVmbyu5QWJ7FQEDoYQNu6-PHunwwfI1tR-ET08iAcUIcmeXEAi_Ji18FhNJ27Xj347nuCK5lLZX75OhgzphkbBvB4djidFliErumkoMKJSViC9vmHwB8WA74hkWHA0m0ZUFJbNaWsoU8943EzZaMy4wJT55X5TzR5d5m8-V0OiuL8kFhOlnwpYWRpgigml1OCVdnQP_PjJZ8PHT1B-CQghWG1jlBRPZRW-OCtw",
  },
];

export default function DetalleDelComplejo() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [tipo, setTipo] = useState("Todos");
  const [fav, setFav] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  async function compartir() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Kondor Sede", url });
        return;
      } catch {
        return;
      }
    }
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast("Enlace copiado al portapapeles");
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md px-container-margin py-stack-sm flex items-center justify-between">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant active:scale-90 transition-all"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setFav((f) => !f)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant active:scale-90 transition-all"
          >
            <span
              className={"material-symbols-outlined transition-transform " + (fav ? "scale-110" : "")}
              style={{ fontVariationSettings: `'FILL' ${fav ? 1 : 0}`, color: fav ? "#EB5757" : undefined }}
            >
              favorite
            </span>
          </button>
          <button
            onClick={compartir}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <main>
        <section className="w-full h-72 md:h-96 relative overflow-hidden">
          <img key={imgIndex} className="w-full h-full object-cover animate-fade-in" src={imagenes[imgIndex]} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {imagenes.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={
                  "h-1.5 rounded-full transition-all " + (i === imgIndex ? "w-6 bg-primary-fixed" : "w-1.5 bg-surface-container-high opacity-50")
                }
              ></button>
            ))}
          </div>
        </section>

        <section className="px-container-margin md:max-w-3xl md:mx-auto -mt-6 relative z-10 animate-item">
          <div className="flex justify-between items-end mb-2">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Kondor Sede</h1>
            <div className="flex items-center space-x-1 bg-surface-container-highest px-3 py-1 rounded-full">
              <span className="font-label-caps text-label-caps text-on-surface">4.9</span>
              <span className="material-symbols-outlined text-[#F2C94C] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
          </div>
          <div className="flex items-center text-text-secondary space-x-2 mb-stack-md">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="font-body-md text-body-md">Mendoza, Argentina</span>
          </div>
          <p className="font-body-md text-body-md text-secondary mb-stack-md">
            Premium indoor facility with 6 professional glass courts, pro-shop, and cafe. Top-tier lighting and climate control.
          </p>
        </section>

        <section className="pl-container-margin md:max-w-3xl md:mx-auto mb-stack-md">
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pr-container-margin py-2">
            {tipos.map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={
                  "whitespace-nowrap px-6 py-2.5 rounded-full font-label-caps text-label-caps transition-all active:scale-95 " +
                  (tipo === t
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="px-container-margin md:max-w-3xl md:mx-auto space-y-4">
          {canchas
            .filter((c) => tipo === "Todos" || c.tipo.startsWith(tipo))
            .map((c, i) => (
              <div
                key={c.nombre}
                onClick={() => navigate("/selector-de-horarios")}
                className="animate-item bg-surface-container-lowest rounded-xl p-4 flex gap-4 items-center border border-border-subtle shadow-sm hover:border-outline-variant hover:shadow-md transition-all cursor-pointer group"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={c.img} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-body-md text-body-md font-bold text-on-surface">{c.nombre}</h3>
                    <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${c.estadoColor}`}>{c.estado}</span>
                  </div>
                  <p className="font-label-muted text-label-muted text-secondary mb-2">{c.tipo}</p>
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <span className="font-label-muted text-label-muted text-on-surface">{c.turno}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface group-hover:bg-primary-fixed group-hover:text-on-primary-fixed transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            ))}
          {canchas.filter((c) => tipo === "Todos" || c.tipo.startsWith(tipo)).length === 0 && (
            <p className="text-center text-text-secondary py-12">No hay canchas de este tipo en esta sede.</p>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-border-subtle p-container-margin z-50 flex items-center justify-between md:max-w-3xl md:mx-auto md:right-0">
        <div>
          <p className="font-label-caps text-label-caps text-secondary mb-1">Desde</p>
          <p className="font-body-md text-body-md font-bold text-on-surface">
            $12.000 <span className="font-label-muted text-label-muted text-secondary font-normal">/turno</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/selector-de-horarios")}
          className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-8 py-4 rounded-full flex items-center space-x-2 hover:bg-primary-fixed-dim active:scale-95 transition-all"
        >
          <span>Seleccionar Horario</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
