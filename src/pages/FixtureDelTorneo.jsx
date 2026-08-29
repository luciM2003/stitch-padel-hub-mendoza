import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { fmtFechaHora } from "../lib/format.js";
import { guardarZonas, guardarLlaveEliminacion, avanzarGanador, recalcularDemora } from "../lib/bracket.js";
import { notificarVarios } from "../lib/notify.js";

const ESTADO_STYLE = {
  programado: "bg-surface-container-high text-text-secondary",
  en_curso: "bg-status-pending/10 text-status-pending",
  finalizado: "bg-status-ok/10 text-status-ok",
  walkover: "bg-surface-container-high text-text-secondary",
};

export default function FixtureDelTorneo() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useAuth();

  const [torneo, setTorneo] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState({});
  const [canchas, setCanchas] = useState([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cargandoFixture, setCargandoFixture] = useState(false);
  const [resultadoTarget, setResultadoTarget] = useState(null);
  const [sets, setSets] = useState([{ p1: "", p2: "" }, { p1: "", p2: "" }, { p1: "", p2: "" }]);
  const [demoraTarget, setDemoraTarget] = useState(null);
  const [minutosDemora, setMinutosDemora] = useState("15");

  const cargarTorneo = useCallback(async () => {
    setLoading(true);
    const { data: t } = await supabase
      .from("torneos")
      .select("*, club_id, torneo_categorias(id, formato, cupo_parejas, categoria:categorias(nombre))")
      .eq("id", torneoId)
      .single();
    setTorneo(t);
    if (t?.torneo_categorias?.length) setCategoriaActiva((prev) => prev || t.torneo_categorias[0].id);

    if (t && user) {
      const { data: adminRow } = await supabase.from("club_admins").select("club_id").eq("profile_id", user.id).eq("club_id", t.club_id).maybeSingle();
      setEsAdmin(Boolean(adminRow));
    }
    if (t?.sede_id) {
      const { data: c } = await supabase.from("canchas").select("id, nombre").eq("sede_id", t.sede_id).eq("activa", true).order("nombre");
      setCanchas(c || []);
    }
    setLoading(false);
  }, [torneoId, user]);

  const cargarPartidos = useCallback(async () => {
    if (!categoriaActiva) return;
    const { data: p } = await supabase
      .from("torneo_partidos")
      .select("*, resultados(sets, ganador_inscripcion_id)")
      .eq("torneo_categoria_id", categoriaActiva)
      .order("ronda", { ascending: true });
    setPartidos(p || []);

    const inscripcionIds = [...new Set((p || []).flatMap((m) => [m.pareja1_inscripcion_id, m.pareja2_inscripcion_id]).filter(Boolean))];
    if (inscripcionIds.length) {
      const { data: ij } = await supabase.from("inscripcion_jugadores").select("inscripcion_id, jugador:profiles(nombre)").in("inscripcion_id", inscripcionIds);
      const mapa = {};
      for (const row of ij || []) {
        mapa[row.inscripcion_id] = [...(mapa[row.inscripcion_id] || []), row.jugador?.nombre].filter(Boolean);
      }
      const nombres = {};
      for (const id of inscripcionIds) nombres[id] = (mapa[id] || []).join(" / ") || "Pareja";
      setEquipos(nombres);
    } else {
      setEquipos({});
    }
  }, [categoriaActiva]);

  useEffect(() => {
    cargarTorneo();
  }, [cargarTorneo]);
  useEffect(() => {
    cargarPartidos();
  }, [cargarPartidos]);

  const rondas = useMemo(() => {
    const grupos = new Map();
    for (const p of partidos) {
      const key = p.fase;
      if (!grupos.has(key)) grupos.set(key, { fase: key, ronda: p.ronda, partidos: [] });
      grupos.get(key).partidos.push(p);
    }
    return [...grupos.values()].sort((a, b) => a.ronda - b.ronda);
  }, [partidos]);

  async function generarFixture() {
    setCargandoFixture(true);
    try {
      const { data: inscripciones } = await supabase
        .from("inscripciones")
        .select("id")
        .eq("torneo_categoria_id", categoriaActiva)
        .eq("estado", "confirmada");
      const ids = (inscripciones || []).map((i) => i.id);
      if (ids.length < 2) {
        showToast("Necesitás al menos 2 parejas confirmadas para generar el fixture", "error");
        return;
      }
      const tc = torneo.torneo_categorias.find((x) => x.id === categoriaActiva);
      const opciones = {
        canchaIds: canchas.map((c) => c.id),
        fechaInicio: `${torneo.fecha_inicio}T09:00:00`,
        duracionMin: 90,
      };
      if (tc.formato === "zonas_y_llave") {
        await guardarZonas(categoriaActiva, ids, 4, opciones);
        showToast("Zonas generadas. Cuando terminen, generá la llave con los clasificados.");
      } else {
        await guardarLlaveEliminacion(categoriaActiva, ids, opciones);
        showToast("¡Llave generada!");
      }
      if (!canchas.length) {
        showToast("Tu sede todavía no tiene canchas cargadas — los partidos quedaron sin cancha asignada.", "info");
      }
      cargarPartidos();
    } catch (err) {
      showToast(err.message || "No se pudo generar el fixture", "error");
    } finally {
      setCargandoFixture(false);
    }
  }

  function abrirResultado(partido) {
    setResultadoTarget(partido);
    setSets([{ p1: "", p2: "" }, { p1: "", p2: "" }, { p1: "", p2: "" }]);
  }

  async function guardarResultado(e) {
    e.preventDefault();
    const setsValidos = sets.filter((s) => s.p1 !== "" && s.p2 !== "").map((s) => ({ pareja1: Number(s.p1), pareja2: Number(s.p2) }));
    if (!setsValidos.length) return;
    const setsGanadosP1 = setsValidos.filter((s) => s.pareja1 > s.pareja2).length;
    const setsGanadosP2 = setsValidos.filter((s) => s.pareja2 > s.pareja1).length;
    const ganadorId = setsGanadosP1 > setsGanadosP2 ? resultadoTarget.pareja1_inscripcion_id : resultadoTarget.pareja2_inscripcion_id;

    await supabase.from("resultados").insert({ torneo_partido_id: resultadoTarget.id, sets: setsValidos, ganador_inscripcion_id: ganadorId, cargado_por: user.id });
    await supabase.from("torneo_partidos").update({ estado: "finalizado" }).eq("id", resultadoTarget.id);
    await avanzarGanador(resultadoTarget.id, ganadorId);
    showToast("Resultado cargado");
    setResultadoTarget(null);
    cargarPartidos();
  }

  function abrirDemora(partido) {
    setDemoraTarget(partido);
    setMinutosDemora("15");
  }

  async function aplicarDemora(e) {
    e.preventDefault();
    const minutos = Number(minutosDemora);
    if (!minutos) return;
    const cambios = recalcularDemora(partidos, demoraTarget.id, minutos);
    await supabase.from("torneo_partidos").update({ horario_real: new Date().toISOString() }).eq("id", demoraTarget.id);
    for (const c of cambios) {
      await supabase.from("torneo_partidos").update({ horario_programado: c.horario_programado }).eq("id", c.id);
    }
    if (cambios.length) {
      const idsAfectados = cambios.map((c) => c.id);
      const { data: afectados } = await supabase
        .from("torneo_partidos")
        .select("pareja1_inscripcion_id, pareja2_inscripcion_id")
        .in("id", idsAfectados);
      const inscripcionesAfectadas = [...new Set((afectados || []).flatMap((a) => [a.pareja1_inscripcion_id, a.pareja2_inscripcion_id]).filter(Boolean))];
      const { data: jugadores } = await supabase.from("inscripcion_jugadores").select("profile_id").in("inscripcion_id", inscripcionesAfectadas);
      const profileIds = [...new Set((jugadores || []).map((j) => j.profile_id))];
      await notificarVarios(profileIds, {
        tipo: "cambio_horario",
        titulo: "Cambio de horario",
        mensaje: `Tu partido se reprogramó ${minutos} minutos por una demora en la cancha.`,
      });
    }
    showToast(`Demora aplicada, ${cambios.length} partido(s) reprogramado(s)`);
    setDemoraTarget(null);
    cargarPartidos();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-secondary">Cargando fixture...</div>;
  if (!torneo) return <div className="min-h-screen flex items-center justify-center text-text-secondary">No se encontró el torneo.</div>;

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface flex items-center gap-4 px-container-margin py-stack-sm sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface truncate">{torneo.nombre} — Fixture</h1>
      </header>

      <main className="px-container-margin max-w-6xl mx-auto flex flex-col gap-stack-md mt-4">
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

        {esAdmin && (
          <div className="flex justify-end">
            <button
              onClick={generarFixture}
              disabled={cargandoFixture}
              className="px-5 py-2 rounded-full bg-primary-container text-text-primary font-bold hover:opacity-90 active:scale-95 transition-all text-label-caps font-label-caps disabled:opacity-50"
            >
              {cargandoFixture ? "Generando..." : "Generar fixture con inscriptos confirmados"}
            </button>
          </div>
        )}

        {rondas.length === 0 && <p className="text-center text-text-secondary py-16">Todavía no se generó el fixture de esta categoría.</p>}

        <div className="flex gap-inline-gutter overflow-x-auto pb-4">
          {rondas.map((ronda) => (
            <div key={ronda.fase} className="flex flex-col gap-3 min-w-[260px] shrink-0">
              <h3 className="text-label-caps font-label-caps text-text-secondary uppercase text-center">{ronda.fase}</h3>
              {ronda.partidos.map((p) => {
                const resultado = Array.isArray(p.resultados) ? p.resultados[0] : p.resultados;
                const ganador = resultado?.ganador_inscripcion_id;
                return (
                  <div key={p.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 flex flex-col gap-2">
                    <Equipo nombre={equipos[p.pareja1_inscripcion_id] || (p.pareja1_inscripcion_id ? "..." : "BYE")} ganador={ganador === p.pareja1_inscripcion_id} />
                    <div className="border-t border-border-subtle"></div>
                    <Equipo nombre={equipos[p.pareja2_inscripcion_id] || (p.pareja2_inscripcion_id ? "..." : "BYE")} ganador={ganador === p.pareja2_inscripcion_id} />
                    <div className="flex justify-between items-center mt-1 gap-2">
                      <span className={"px-2 py-0.5 rounded-full text-label-caps font-label-caps uppercase shrink-0 " + ESTADO_STYLE[p.estado]}>{p.estado}</span>
                      <span className="text-label-muted font-label-muted text-text-secondary text-right">
                        {p.cancha_id && <>{canchas.find((c) => c.id === p.cancha_id)?.nombre || "Cancha"} · </>}
                        {p.horario_programado ? fmtFechaHora(p.horario_programado) : "Sin horario"}
                      </span>
                    </div>
                    {esAdmin && p.estado !== "finalizado" && p.estado !== "walkover" && p.pareja1_inscripcion_id && p.pareja2_inscripcion_id && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => abrirResultado(p)} className="flex-1 py-2 rounded-full bg-primary-fixed text-on-primary-fixed text-label-caps font-label-caps font-bold hover:opacity-90 active:scale-95 transition-all">
                          Cargar resultado
                        </button>
                        {p.cancha_id && (
                          <button onClick={() => abrirDemora(p)} className="py-2 px-3 rounded-full border border-border-subtle text-label-caps font-label-caps hover:bg-surface-container-high transition-colors">
                            Demora
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      <Modal open={Boolean(resultadoTarget)} onClose={() => setResultadoTarget(null)} title="Cargar Resultado">
        <form onSubmit={guardarResultado} className="flex flex-col gap-3">
          <p className="text-body-md font-body-md text-text-secondary mb-1">
            {resultadoTarget && `${equipos[resultadoTarget.pareja1_inscripcion_id]} vs ${equipos[resultadoTarget.pareja2_inscripcion_id]}`}
          </p>
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-label-caps font-label-caps text-text-secondary w-16">Set {i + 1}</span>
              <input type="number" min="0" value={s.p1} onChange={(e) => setSets(sets.map((x, j) => (j === i ? { ...x, p1: e.target.value } : x)))} className="input w-20 text-center" />
              <span className="text-text-secondary">-</span>
              <input type="number" min="0" value={s.p2} onChange={(e) => setSets(sets.map((x, j) => (j === i ? { ...x, p2: e.target.value } : x)))} className="input w-20 text-center" />
            </div>
          ))}
          <button type="submit" className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Guardar Resultado
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(demoraTarget)} onClose={() => setDemoraTarget(null)} title="Marcar demora">
        <form onSubmit={aplicarDemora} className="flex flex-col gap-3">
          <p className="text-body-md font-body-md text-text-secondary">Los partidos siguientes en la misma cancha se reprograman automáticamente.</p>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Minutos de demora</label>
            <input type="number" min="1" value={minutosDemora} onChange={(e) => setMinutosDemora(e.target.value)} className="input" />
          </div>
          <button type="submit" className="w-full bg-primary-container text-text-primary font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Aplicar y notificar
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Equipo({ nombre, ganador }) {
  return (
    <div className={"flex items-center justify-between " + (ganador ? "font-bold text-text-primary" : "text-text-secondary")}>
      <span className="truncate">{nombre}</span>
      {ganador && <span className="material-symbols-outlined text-status-ok text-[18px]">check_circle</span>}
    </div>
  );
}
