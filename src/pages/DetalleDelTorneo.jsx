import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { fmtFecha } from "../lib/format.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

const ESTADO_SOLICITUD_LABEL = { pendiente: "Solicitud enviada", aprobada: "Excepción aprobada", rechazada: "Solicitud rechazada" };

const TIER_STYLE = {
  oro: "bg-rank-gold/10 text-rank-gold border-rank-gold/30",
  plata: "bg-rank-silver/10 text-rank-silver border-rank-silver/30",
  bronce: "bg-rank-bronze/10 text-rank-bronze border-rank-bronze/30",
};

export default function DetalleDelTorneo() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const showToast = useToast();
  const [torneo, setTorneo] = useState(null);
  const [reglamento, setReglamento] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [cupos, setCupos] = useState({});
  const [solicitudes, setSolicitudes] = useState({});
  const [loading, setLoading] = useState(true);
  const [solicitudTarget, setSolicitudTarget] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setLoading(true);
    const { data: t } = await supabase
      .from("torneos")
      .select(
        "*, sede:sedes(nombre, direccion), club:clubs(id, nombre), torneo_categorias(id, formato, cupo_parejas, categoria:categorias(nombre, categoria_global_id))"
      )
      .eq("id", torneoId)
      .single();
    setTorneo(t);

    if (t) {
      const [{ data: reglamentos }, { data: sp }] = await Promise.all([
        supabase.from("reglamentos").select("*").eq("club_id", t.club.id).or(`torneo_id.eq.${torneoId},torneo_id.is.null`),
        supabase.from("sponsors").select("*").eq("club_id", t.club.id).eq("activo", true).or(`torneo_id.eq.${torneoId},torneo_id.is.null`),
      ]);
      // Preferimos el reglamento específico del torneo por sobre el general del club.
      const reglamentoEspecifico = (reglamentos || []).find((r) => r.torneo_id === torneoId);
      setReglamento(reglamentoEspecifico || reglamentos?.[0] || null);
      setSponsors(sp || []);

      const conteos = {};
      for (const tc of t.torneo_categorias || []) {
        const { count } = await supabase
          .from("inscripciones")
          .select("id", { count: "exact", head: true })
          .eq("torneo_categoria_id", tc.id)
          .eq("estado", "confirmada");
        conteos[tc.id] = count || 0;
      }
      setCupos(conteos);

      if (user) {
        const tcIds = (t.torneo_categorias || []).map((tc) => tc.id);
        if (tcIds.length) {
          const { data: sols } = await supabase
            .from("solicitudes_categoria")
            .select("torneo_categoria_id, estado")
            .eq("profile_id", user.id)
            .in("torneo_categoria_id", tcIds);
          const map = {};
          for (const s of sols || []) map[s.torneo_categoria_id] = s.estado;
          setSolicitudes(map);
        }
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torneoId, user?.id]);

  async function enviarSolicitud() {
    if (!solicitudTarget || !user) return;
    setEnviando(true);
    const { error } = await supabase
      .from("solicitudes_categoria")
      .insert({ torneo_categoria_id: solicitudTarget, profile_id: user.id, motivo: motivo.trim() || null });
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("¡Solicitud enviada! El club te va a avisar cuando la revise.");
      setSolicitudTarget(null);
      setMotivo("");
      await cargar();
    }
    setEnviando(false);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-secondary">Cargando torneo...</div>;
  }
  if (!torneo) {
    return <div className="min-h-screen flex items-center justify-center text-text-secondary">No se encontró el torneo.</div>;
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-28">
      <header className="bg-surface flex items-center gap-4 px-container-margin py-stack-sm sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface truncate">{torneo.nombre}</h1>
      </header>

      <main className="px-container-margin max-w-3xl mx-auto flex flex-col gap-stack-lg mt-4">
        <section className="bg-ink-fixed rounded-4xl p-6 md:p-8 text-on-ink-fixed relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #D4F84A 0%, transparent 70%)" }}></div>
          <div className="relative z-10 flex flex-col gap-2">
            <p className="text-label-caps font-label-caps text-secondary-fixed-dim uppercase">{torneo.club?.nombre}</p>
            <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold">{torneo.nombre}</h2>
            <p className="text-body-md font-body-md text-secondary-fixed-dim">
              {torneo.sede?.nombre} • Desde {fmtFecha(torneo.fecha_inicio)}
            </p>
            {torneo.premios && <p className="text-body-md font-body-md mt-2">🏆 {torneo.premios}</p>}
          </div>
        </section>

        <section>
          <h3 className="text-body-lg font-body-lg font-bold text-text-primary mb-3">Categorías</h3>
          <div className="flex flex-col gap-3">
            {(torneo.torneo_categorias || []).map((tc) => {
              const inscriptos = cupos[tc.id] || 0;
              const cupo = tc.cupo_parejas;
              const lleno = cupo && inscriptos >= cupo;
              const cerrado = torneo.estado !== "abierto";
              const esMiCategoria = !profile?.categoria_global_id || profile.categoria_global_id === tc.categoria?.categoria_global_id;
              const estadoSolicitud = solicitudes[tc.id];

              return (
                <div key={tc.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-body-md font-body-md font-bold text-text-primary">{tc.categoria?.nombre}</h4>
                    <p className="text-label-muted font-label-muted text-text-secondary">
                      {inscriptos}
                      {cupo ? ` / ${cupo}` : ""} parejas anotadas
                    </p>
                  </div>

                  {esMiCategoria || estadoSolicitud === "aprobada" ? (
                    <button
                      disabled={lleno || cerrado}
                      onClick={() => navigate(`/torneos/${torneo.id}/inscripcion?categoria=${tc.id}`)}
                      className="px-5 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
                    >
                      {lleno ? "Cupo lleno" : "Inscribirse"}
                    </button>
                  ) : estadoSolicitud ? (
                    <span
                      className={
                        "px-4 py-2 rounded-full text-label-caps font-label-caps font-bold shrink-0 " +
                        (estadoSolicitud === "pendiente" ? "bg-status-pending/10 text-status-pending" : "bg-status-error/10 text-status-error")
                      }
                    >
                      {ESTADO_SOLICITUD_LABEL[estadoSolicitud]}
                    </span>
                  ) : (
                    <button
                      disabled={lleno || cerrado}
                      onClick={() => setSolicitudTarget(tc.id)}
                      className="px-5 py-2 rounded-full border border-primary-fixed text-primary-fixed font-label-caps text-label-caps font-bold hover:bg-primary-fixed/10 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
                    >
                      {lleno ? "Cupo lleno" : "Pedir excepción"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {sponsors.length > 0 && (
          <section>
            <h3 className="text-body-lg font-body-lg font-bold text-text-primary mb-3">Sponsors</h3>
            <div className="flex flex-wrap gap-2">
              {sponsors.map((s) => (
                <span key={s.id} className={"px-3 py-1 rounded-full border text-label-caps font-label-caps " + TIER_STYLE[s.tier]}>
                  {s.nombre}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="flex gap-3">
          <button
            onClick={() => navigate(`/torneos/${torneo.id}/fixture`)}
            className="flex-1 px-5 py-3 rounded-full border border-border-subtle text-text-primary hover:bg-surface-container-high active:scale-95 transition-all text-label-caps font-label-caps"
          >
            Ver fixture
          </button>
          <button
            onClick={() => navigate(`/torneos/${torneo.id}/galeria`)}
            className="flex-1 px-5 py-3 rounded-full border border-border-subtle text-text-primary hover:bg-surface-container-high active:scale-95 transition-all text-label-caps font-label-caps"
          >
            Galería de fotos
          </button>
        </section>

        {reglamento && (
          <section>
            <h3 className="text-body-lg font-body-lg font-bold text-text-primary mb-3">Reglamento</h3>
            <p className="text-body-md font-body-md text-text-secondary whitespace-pre-line bg-surface-container-lowest border border-border-subtle rounded-xl p-4">
              {reglamento.contenido}
            </p>
          </section>
        )}
      </main>

      <Modal open={Boolean(solicitudTarget)} onClose={() => setSolicitudTarget(null)} title="Pedir excepción de categoría">
        <p className="text-body-md font-body-md text-text-secondary mb-4">
          Esta categoría no coincide con la que tenés cargada en tu perfil. Contale al club por qué querés anotarte igual (por ej. jugás con un
          compañero de esa categoría) y el club decide si te habilita.
        </p>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: juego con mi compañero que es de esta categoría"
          rows={3}
          className="input resize-none"
        />
        <button
          disabled={enviando}
          onClick={enviarSolicitud}
          className="w-full mt-4 bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </button>
      </Modal>
    </div>
  );
}
