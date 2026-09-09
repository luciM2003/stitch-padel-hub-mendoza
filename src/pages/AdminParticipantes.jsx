import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { fmt } from "../lib/format.js";
import { useToast } from "../components/Toast.jsx";
import { checkYConfirmar } from "../lib/inscripciones.js";

const ESTADO_INSC_STYLE = {
  pendiente: "bg-status-pending/10 text-status-pending",
  confirmada: "bg-status-ok/10 text-status-ok",
  en_espera: "bg-surface-container-high text-text-secondary",
  cancelada: "bg-status-error/10 text-status-error",
};
const ESTADO_INSC_LABEL = { pendiente: "Pendiente de pago", confirmada: "Confirmada", en_espera: "Buscando compañero", cancelada: "Cancelada" };
const ESTADO_PAGO_LABEL = { pendiente: "Sin pagar", pagado: "Pagado", reembolsado: "Reembolsado" };

export default function AdminParticipantes() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [torneo, setTorneo] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data: t } = await supabase
      .from("torneos")
      .select("id, nombre, precio_inscripcion, torneo_categorias(id, categoria:categorias(nombre))")
      .eq("id", torneoId)
      .single();
    setTorneo(t);
    if (t?.torneo_categorias?.length) setCategoriaActiva((prev) => prev || t.torneo_categorias[0].id);
    setLoading(false);
  }, [torneoId]);

  const cargarInscripciones = useCallback(async () => {
    if (!categoriaActiva) return;
    const { data: insc } = await supabase
      .from("inscripciones")
      .select(
        "id, estado, origen, created_at, inscripcion_jugadores(id, profile_id, es_titular, estado_pago, jugador:profiles(nombre))"
      )
      .eq("torneo_categoria_id", categoriaActiva)
      .order("created_at", { ascending: false });

    const ijIds = (insc || []).flatMap((i) => i.inscripcion_jugadores.map((j) => j.id));
    let pagosPorIj = {};
    if (ijIds.length) {
      const { data: pagos } = await supabase
        .from("pagos")
        .select("id, inscripcion_jugador_id, metodo, estado, comprobante_url, monto, created_at")
        .in("inscripcion_jugador_id", ijIds)
        .order("created_at", { ascending: false });
      for (const p of pagos || []) {
        if (!pagosPorIj[p.inscripcion_jugador_id]) pagosPorIj[p.inscripcion_jugador_id] = p;
      }
    }
    setInscripciones((insc || []).map((i) => ({ ...i, pagosPorIj })));
  }, [categoriaActiva]);

  useEffect(() => {
    cargar();
  }, [cargar]);
  useEffect(() => {
    cargarInscripciones();
  }, [cargarInscripciones]);

  async function confirmarPago(ij, inscripcionId) {
    const pago = ij.pagosPorIj?.[ij.id];
    if (pago && pago.estado !== "aprobado") {
      await supabase.from("pagos").update({ estado: "aprobado" }).eq("id", pago.id);
    } else if (!pago) {
      await supabase.from("pagos").insert({
        inscripcion_jugador_id: ij.id,
        monto: torneo.precio_inscripcion,
        metodo: "transferencia",
        estado: "aprobado",
      });
    }
    await supabase.from("inscripcion_jugadores").update({ estado_pago: "pagado" }).eq("id", ij.id);
    await checkYConfirmar(inscripcionId);
    showToast("Pago confirmado");
    cargarInscripciones();
  }

  async function cancelarInscripcion(inscripcionId) {
    await supabase.from("inscripciones").update({ estado: "cancelada" }).eq("id", inscripcionId);
    showToast("Inscripción cancelada", "error");
    cargarInscripciones();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-secondary">Cargando participantes...</div>;
  if (!torneo) return <div className="min-h-screen flex items-center justify-center text-text-secondary">No se encontró el torneo.</div>;

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface flex items-center gap-4 px-container-margin py-stack-sm sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface truncate">{torneo.nombre} — Participantes</h1>
      </header>

      <main className="px-container-margin max-w-4xl mx-auto flex flex-col gap-stack-md mt-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {(torneo.torneo_categorias || []).map((tc) => (
            <button
              key={tc.id}
              onClick={() => setCategoriaActiva(tc.id)}
              className={
                "px-5 py-2 rounded-full text-label-caps font-label-caps shrink-0 transition-all " +
                (categoriaActiva === tc.id ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary hover:bg-surface-container-high")
              }
            >
              {tc.categoria?.nombre}
            </button>
          ))}
        </div>

        {inscripciones.length === 0 && <p className="text-center text-text-secondary py-16">Todavía no hay inscriptos en esta categoría.</p>}

        <div className="flex flex-col gap-3">
          {inscripciones.map((insc) => (
            <div key={insc.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className={"px-3 py-1 rounded-full text-label-caps font-label-caps uppercase " + ESTADO_INSC_STYLE[insc.estado]}>
                  {ESTADO_INSC_LABEL[insc.estado]}
                </span>
                {insc.estado !== "cancelada" && (
                  <button
                    onClick={() => cancelarInscripcion(insc.id)}
                    className="text-label-caps font-label-caps text-status-error hover:underline"
                  >
                    Cancelar inscripción
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {insc.inscripcion_jugadores.map((ij) => {
                  const pago = insc.pagosPorIj?.[ij.id];
                  return (
                    <div key={ij.id} className="flex justify-between items-center gap-3 py-2 border-b border-border-subtle last:border-b-0">
                      <div>
                        <p className="text-body-md font-body-md font-bold text-text-primary">
                          {ij.jugador?.nombre || "Jugador"} {ij.es_titular ? "" : "(invitado)"}
                        </p>
                        {pago && (
                          <p className="text-label-muted font-label-muted text-text-secondary">
                            {pago.metodo === "transferencia" ? "Transferencia" : "Mercado Pago"}
                            {pago.estado === "pendiente" ? " — comprobante enviado" : ""}
                            {pago.comprobante_url && (
                              <>
                                {" · "}
                                <a href={pago.comprobante_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                  Ver comprobante
                                </a>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={ij.estado_pago === "pagado" ? "text-status-ok font-bold text-label-caps font-label-caps" : "text-status-pending font-bold text-label-caps font-label-caps"}>
                          {ESTADO_PAGO_LABEL[ij.estado_pago]}
                        </span>
                        {ij.estado_pago !== "pagado" && (
                          <button
                            onClick={() => confirmarPago(ij, insc.id)}
                            className="px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-caps font-label-caps font-bold hover:opacity-90 active:scale-95 transition-all"
                          >
                            Confirmar pago
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
