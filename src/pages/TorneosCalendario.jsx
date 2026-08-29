import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import PlayerSidebar from "../components/PlayerSidebar.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { fmt, fmtFecha } from "../lib/format.js";

const ESTADO_STYLE = {
  abierto: "bg-status-ok/10 text-status-ok",
  en_curso: "bg-primary-container text-text-primary",
  finalizado: "bg-surface-container-high text-text-secondary",
  cancelado: "bg-status-error/10 text-status-error",
};
const ESTADO_LABEL = { abierto: "Inscripciones abiertas", en_curso: "En curso", finalizado: "Finalizado", cancelado: "Cancelado" };

export default function TorneosCalendario() {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    async function cargar() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("torneos")
        .select("*, sede:sedes(nombre), club:clubs(nombre), torneo_categorias(id, categoria:categorias(nombre))")
        .neq("estado", "borrador")
        .order("fecha_inicio", { ascending: true });
      setTorneos(data || []);
      setLoading(false);
    }
    cargar();
  }, []);

  const sedes = useMemo(() => [...new Set(torneos.map((t) => t.sede?.nombre).filter(Boolean))], [torneos]);
  const categorias = useMemo(
    () => [...new Set(torneos.flatMap((t) => (t.torneo_categorias || []).map((tc) => tc.categoria?.nombre)).filter(Boolean))],
    [torneos]
  );

  const filtrados = torneos.filter((t) => {
    if (filtroSede && t.sede?.nombre !== filtroSede) return false;
    if (filtroCategoria && !(t.torneo_categorias || []).some((tc) => tc.categoria?.nombre === filtroCategoria)) return false;
    return true;
  });

  return (
    <div className="md:flex">
      <PlayerSidebar />
      <div className="flex-1 min-w-0 bg-background text-on-background min-h-screen pb-24 md:pb-0">
        <header className="flex justify-between items-center px-container-margin py-stack-md w-full bg-surface sticky top-0 z-40">
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-text-primary">Torneos</h1>
          <button
            onClick={() => setShowNotifs(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high active:scale-90 transition-all text-primary"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </header>

        <main className="px-container-margin flex flex-col gap-stack-md max-w-6xl mx-auto mt-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            <select value={filtroSede} onChange={(e) => setFiltroSede(e.target.value)} className="input w-auto shrink-0">
              <option value="">Todas las sedes</option>
              {sedes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="input w-auto shrink-0">
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {!isSupabaseConfigured && (
            <p className="text-center text-text-secondary py-4">El backend todavía se está configurando — pronto vas a ver acá los torneos disponibles.</p>
          )}
          {loading && <p className="text-center text-text-secondary py-12">Cargando torneos...</p>}
          {!loading && isSupabaseConfigured && filtrados.length === 0 && <p className="text-center text-text-secondary py-12">No hay torneos que coincidan con estos filtros.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-inline-gutter pb-8">
            {filtrados.map((t, i) => (
              <div
                key={t.id}
                onClick={() => navigate(`/torneos/${t.id}`)}
                className="animate-item bg-surface-container-lowest border border-border-subtle rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={"self-start px-3 py-1 rounded-full text-label-caps font-label-caps uppercase " + ESTADO_STYLE[t.estado]}>
                  {ESTADO_LABEL[t.estado]}
                </span>
                <h3 className="text-body-lg font-body-lg font-bold text-text-primary">{t.nombre}</h3>
                <p className="text-label-muted font-label-muted text-text-secondary">
                  {t.club?.nombre} • {t.sede?.nombre}
                </p>
                <p className="text-label-muted font-label-muted text-text-secondary">Desde {fmtFecha(t.fecha_inicio)}</p>
                <div className="flex flex-wrap gap-1">
                  {(t.torneo_categorias || []).slice(0, 3).map((tc) => (
                    <span key={tc.id} className="px-2 py-0.5 rounded-full bg-surface-container-high text-label-caps font-label-caps text-text-secondary">
                      {tc.categoria?.nombre}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border-subtle mt-1">
                  <span className="text-body-md font-body-md font-bold text-text-primary">{fmt(t.precio_inscripcion)}</span>
                  <span className="text-label-caps font-label-caps text-primary flex items-center gap-1">
                    Ver más <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
        <BottomNav />
      </div>
    </div>
  );
}
