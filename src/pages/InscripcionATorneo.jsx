import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { fmt } from "../lib/format.js";
import { crearPreferenciaMP, simularPagoAprobado } from "../lib/mercadopago.js";
import { notificar } from "../lib/notify.js";

const ESTADO_PAGO_STYLE = { pendiente: "text-status-pending", pagado: "text-status-ok", reembolsado: "text-text-secondary" };
const ESTADO_PAGO_LABEL = { pendiente: "Pago pendiente", pagado: "Pagado", reembolsado: "Reembolsado" };

export default function InscripcionATorneo() {
  const { torneoId } = useParams();
  const [searchParams] = useSearchParams();
  const torneoCategoriaId = searchParams.get("categoria");
  const navigate = useNavigate();
  const showToast = useToast();
  const { user, profile } = useAuth();

  const [tc, setTc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState("pareja");
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [companero, setCompanero] = useState(null);
  const [esperando, setEsperando] = useState([]);
  const [miInscripcion, setMiInscripcion] = useState(null);
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: tcRow } = await supabase
      .from("torneo_categorias")
      .select("*, categoria:categorias(nombre), torneo:torneos(id, nombre, precio_inscripcion, comision_pct, estado)")
      .eq("id", torneoCategoriaId)
      .single();
    setTc(tcRow);

    const { data: miFilasTodas } = await supabase
      .from("inscripcion_jugadores")
      .select("*, inscripcion:inscripciones(id, estado, torneo_categoria_id)")
      .eq("profile_id", user.id);
    const miFilas = (miFilasTodas || []).filter((f) => f.inscripcion?.torneo_categoria_id === torneoCategoriaId);

    if (miFilas?.length) {
      const inscripcionId = miFilas[0].inscripcion.id;
      const { data: todas } = await supabase
        .from("inscripcion_jugadores")
        .select("*, jugador:profiles(nombre)")
        .eq("inscripcion_id", inscripcionId);
      setMiInscripcion({ inscripcionId, estado: miFilas[0].inscripcion.estado, jugadores: todas || [] });
    } else {
      setMiInscripcion(null);
      const { data: enEspera } = await supabase
        .from("inscripciones")
        .select("id, inscripcion_jugadores(profile_id, jugador:profiles(nombre, nivel))")
        .eq("torneo_categoria_id", torneoCategoriaId)
        .eq("estado", "en_espera")
        .eq("origen", "buscar_companero");
      setEsperando(enEspera || []);
    }
    setLoading(false);
  }, [torneoCategoriaId, user]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function buscarJugador(texto) {
    setBusqueda(texto);
    setCompanero(null);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    const { data } = await supabase.from("profiles").select("id, nombre, nivel").ilike("nombre", `%${texto}%`).neq("id", user.id).limit(6);
    setResultados(data || []);
  }

  async function crearConPareja() {
    if (!companero) return;
    setProcesando(true);
    const { data: insc, error } = await supabase
      .from("inscripciones")
      .insert({ torneo_categoria_id: torneoCategoriaId, estado: "pendiente", origen: "pareja", created_by: user.id })
      .select()
      .single();
    if (error) {
      showToast(error.message, "error");
      setProcesando(false);
      return;
    }
    await supabase.from("inscripcion_jugadores").insert([
      { inscripcion_id: insc.id, profile_id: user.id, es_titular: true },
      { inscripcion_id: insc.id, profile_id: companero.id, es_titular: false },
    ]);
    await notificar({
      profileId: companero.id,
      tipo: "pago",
      titulo: "Te anotaron a un torneo",
      mensaje: `${profile?.nombre || "Un jugador"} te sumó a ${tc.torneo.nombre} (${tc.categoria.nombre}). Confirmá tu pago para asegurar el lugar.`,
    });
    showToast("¡Inscripción creada! Tu compañero recibió un aviso para pagar su parte.");
    setProcesando(false);
    cargar();
  }

  async function sumarmeAEspera(inscripcionId) {
    setProcesando(true);
    const { error } = await supabase.from("inscripcion_jugadores").insert({ inscripcion_id: inscripcionId, profile_id: user.id, es_titular: false });
    if (error) {
      showToast(error.message, "error");
      setProcesando(false);
      return;
    }
    await supabase.from("inscripciones").update({ estado: "pendiente" }).eq("id", inscripcionId);
    showToast("¡Te sumaste a la pareja! Ahora podés pagar tu parte.");
    setProcesando(false);
    cargar();
  }

  async function publicarBusqueda() {
    setProcesando(true);
    const { data: insc, error } = await supabase
      .from("inscripciones")
      .insert({ torneo_categoria_id: torneoCategoriaId, estado: "en_espera", origen: "buscar_companero", created_by: user.id })
      .select()
      .single();
    if (error) {
      showToast(error.message, "error");
      setProcesando(false);
      return;
    }
    await supabase.from("inscripcion_jugadores").insert({ inscripcion_id: insc.id, profile_id: user.id, es_titular: true });
    showToast("¡Publicado! Te avisamos cuando alguien se sume.");
    setProcesando(false);
    cargar();
  }

  async function checkYConfirmar(inscripcionId) {
    const { data: filas } = await supabase.from("inscripcion_jugadores").select("estado_pago").eq("inscripcion_id", inscripcionId);
    if (filas?.length === 2 && filas.every((f) => f.estado_pago === "pagado")) {
      await supabase.from("inscripciones").update({ estado: "confirmada" }).eq("id", inscripcionId);
    }
  }

  async function pagarConMercadoPago(miFilaId, inscripcionId) {
    setProcesando(true);
    try {
      await crearPreferenciaMP({ monto: tc.torneo.precio_inscripcion, concepto: tc.torneo.nombre });
      const res = await simularPagoAprobado();
      const comision = (tc.torneo.precio_inscripcion * tc.torneo.comision_pct) / 100;
      await supabase.from("pagos").insert({
        inscripcion_jugador_id: miFilaId,
        monto: tc.torneo.precio_inscripcion,
        comision_monto: comision,
        metodo: "mercadopago",
        estado: "aprobado",
        mp_payment_id: res.mp_payment_id,
      });
      await supabase.from("inscripcion_jugadores").update({ estado_pago: "pagado" }).eq("id", miFilaId);
      await checkYConfirmar(inscripcionId);
      showToast("¡Pago aprobado! (simulado — integración real de Mercado Pago pendiente)");
      cargar();
    } catch (err) {
      showToast(err.message || "No se pudo procesar el pago", "error");
    } finally {
      setProcesando(false);
    }
  }

  async function pagarPorTransferencia(miFilaId) {
    if (!comprobanteUrl.trim()) return;
    setProcesando(true);
    const comision = (tc.torneo.precio_inscripcion * tc.torneo.comision_pct) / 100;
    await supabase.from("pagos").insert({
      inscripcion_jugador_id: miFilaId,
      monto: tc.torneo.precio_inscripcion,
      comision_monto: comision,
      metodo: "transferencia",
      estado: "pendiente",
      comprobante_url: comprobanteUrl.trim(),
    });
    showToast("Comprobante enviado. El club va a confirmar tu pago.");
    setComprobanteUrl("");
    setProcesando(false);
    cargar();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-secondary">Cargando...</div>;
  if (!tc) return <div className="min-h-screen flex items-center justify-center text-text-secondary">No se encontró la categoría del torneo.</div>;

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface flex items-center gap-4 px-container-margin py-stack-sm sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Inscripción</h1>
          <p className="text-label-muted font-label-muted text-text-secondary">
            {tc.torneo.nombre} • {tc.categoria.nombre}
          </p>
        </div>
      </header>

      <main className="px-container-margin max-w-xl mx-auto flex flex-col gap-stack-lg mt-4">
        {!miInscripcion && (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setModo("pareja")}
                className={"flex-1 py-3 rounded-full text-label-caps font-label-caps transition-all " + (modo === "pareja" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary")}
              >
                Ya tengo pareja
              </button>
              <button
                onClick={() => setModo("buscar")}
                className={"flex-1 py-3 rounded-full text-label-caps font-label-caps transition-all " + (modo === "buscar" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary")}
              >
                Busco compañero
              </button>
            </div>

            {modo === "pareja" && (
              <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 flex flex-col gap-3 relative">
                <label className="text-label-caps font-label-caps text-text-primary uppercase">Buscar compañero por nombre</label>
                <input value={companero ? companero.nombre : busqueda} onChange={(e) => buscarJugador(e.target.value)} placeholder="Escribí un nombre..." className="input" />
                {resultados.length > 0 && !companero && (
                  <div className="border border-border-subtle rounded-lg overflow-hidden">
                    {resultados.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setCompanero(r);
                          setResultados([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-surface-container-low border-b border-border-subtle last:border-b-0"
                      >
                        {r.nombre || "Sin nombre"} {r.nivel ? `· Nivel ${r.nivel}` : ""}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  disabled={!companero || procesando}
                  onClick={crearConPareja}
                  className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Crear inscripción con {companero ? companero.nombre : "..."}
                </button>
              </div>
            )}

            {modo === "buscar" && (
              <div className="flex flex-col gap-3">
                {esperando.length === 0 && <p className="text-center text-text-secondary py-6">Nadie está buscando compañero todavía en esta categoría.</p>}
                {esperando.map((e) => {
                  const titular = e.inscripcion_jugadores?.[0];
                  return (
                    <div key={e.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="text-body-md font-body-md font-bold text-text-primary">{titular?.jugador?.nombre || "Jugador"}</h4>
                        <p className="text-label-muted font-label-muted text-text-secondary">{titular?.jugador?.nivel ? `Nivel ${titular.jugador.nivel}` : "Busca compañero"}</p>
                      </div>
                      <button
                        disabled={procesando}
                        onClick={() => sumarmeAEspera(e.id)}
                        className="px-5 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      >
                        Sumarme
                      </button>
                    </div>
                  );
                })}
                <button
                  disabled={procesando}
                  onClick={publicarBusqueda}
                  className="w-full py-3 rounded-full border border-dashed border-border-subtle text-text-secondary hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  Publicarme buscando compañero
                </button>
              </div>
            )}
          </>
        )}

        {miInscripcion && (
          <div className="flex flex-col gap-stack-md">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5">
              <h3 className="text-body-lg font-body-lg font-bold text-text-primary mb-3">Tu pareja</h3>
              {miInscripcion.jugadores.map((j) => (
                <div key={j.id} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-b-0">
                  <span className="text-body-md font-body-md text-text-primary">
                    {j.jugador?.nombre || "Jugador"} {j.profile_id === user.id ? "(vos)" : ""}
                  </span>
                  <span className={"text-label-caps font-label-caps font-bold " + ESTADO_PAGO_STYLE[j.estado_pago]}>{ESTADO_PAGO_LABEL[j.estado_pago]}</span>
                </div>
              ))}
              <p className="text-label-muted font-label-muted text-text-secondary mt-3">
                Estado de la inscripción: <strong className="text-text-primary">{miInscripcion.estado}</strong>
              </p>
            </div>

            {(() => {
              const miFila = miInscripcion.jugadores.find((j) => j.profile_id === user.id);
              if (!miFila || miFila.estado_pago === "pagado") return null;
              return (
                <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-body-lg font-body-lg font-bold text-text-primary">Tu parte</h3>
                    <p className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-text-primary mt-1">{fmt(tc.torneo.precio_inscripcion)}</p>
                  </div>
                  <button
                    disabled={procesando}
                    onClick={() => pagarConMercadoPago(miFila.id, miInscripcion.inscripcionId)}
                    className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Pagar con Mercado Pago
                  </button>
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-border-subtle"></div>
                    <span className="mx-3 text-label-muted font-label-muted text-text-secondary">o transferencia</span>
                    <div className="flex-grow border-t border-border-subtle"></div>
                  </div>
                  <input
                    value={comprobanteUrl}
                    onChange={(e) => setComprobanteUrl(e.target.value)}
                    placeholder="Link o referencia del comprobante"
                    className="input"
                  />
                  <button
                    disabled={procesando || !comprobanteUrl.trim()}
                    onClick={() => pagarPorTransferencia(miFila.id)}
                    className="w-full border border-border-subtle text-text-primary font-body-md font-bold py-3 rounded-full hover:bg-surface-container-high active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Envié la transferencia
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
