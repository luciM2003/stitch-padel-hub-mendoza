import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { fmtFecha } from "../lib/format.js";

const TIPO_LABEL = { advertencia: "Advertencia", suspension_temporal: "Suspensión temporal", suspension_permanente: "Suspensión permanente" };

export default function PerfilTorneosSection({ userId }) {
  const [rankings, setRankings] = useState([]);
  const [historial, setHistorial] = useState({});
  const [sanciones, setSanciones] = useState([]);
  const [companeros, setCompaneros] = useState([]);
  const [racha, setRacha] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !userId) {
      setLoading(false);
      return;
    }

    async function cargar() {
      setLoading(true);

      const { data: rankingRows } = await supabase.from("rankings").select("*, categoria:categorias(nombre)").eq("profile_id", userId);
      setRankings(rankingRows || []);

      if (rankingRows?.length) {
        const historialPorRanking = {};
        for (const r of rankingRows) {
          const { data: h } = await supabase.from("ranking_historial").select("puntos, fecha").eq("ranking_id", r.id).order("fecha", { ascending: true }).limit(10);
          historialPorRanking[r.id] = h || [];
        }
        setHistorial(historialPorRanking);
      }

      const { data: sancionesRows } = await supabase
        .from("sanciones")
        .select("*")
        .eq("profile_id", userId)
        .eq("visible_jugador", true)
        .order("fecha_inicio", { ascending: false });
      setSanciones(sancionesRows || []);

      const { data: misInscripciones } = await supabase.from("inscripcion_jugadores").select("inscripcion_id").eq("profile_id", userId);
      const inscripcionIds = (misInscripciones || []).map((i) => i.inscripcion_id);

      if (inscripcionIds.length) {
        const { data: todasParejas } = await supabase
          .from("inscripcion_jugadores")
          .select("inscripcion_id, profile_id, jugador:profiles(nombre)")
          .in("inscripcion_id", inscripcionIds)
          .neq("profile_id", userId);
        const conteo = new Map();
        for (const row of todasParejas || []) {
          const key = row.profile_id;
          const actual = conteo.get(key) || { nombre: row.jugador?.nombre || "Jugador", veces: 0 };
          actual.veces += 1;
          conteo.set(key, actual);
        }
        setCompaneros([...conteo.values()].sort((a, b) => b.veces - a.veces).slice(0, 4));

        const { data: partidos } = await supabase
          .from("torneo_partidos")
          .select("id, pareja1_inscripcion_id, pareja2_inscripcion_id, resultados(ganador_inscripcion_id, created_at)")
          .or(`pareja1_inscripcion_id.in.(${inscripcionIds.join(",")}),pareja2_inscripcion_id.in.(${inscripcionIds.join(",")})`)
          .eq("estado", "finalizado");

        const jugados = (partidos || [])
          .map((p) => {
            const resultado = Array.isArray(p.resultados) ? p.resultados[0] : p.resultados;
            if (!resultado?.ganador_inscripcion_id) return null;
            const miInscripcionEnEstePartido = inscripcionIds.includes(p.pareja1_inscripcion_id) ? p.pareja1_inscripcion_id : p.pareja2_inscripcion_id;
            return { fecha: resultado.created_at, gane: resultado.ganador_inscripcion_id === miInscripcionEnEstePartido };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (jugados.length) {
          let count = 0;
          const primero = jugados[0].gane;
          for (const j of jugados) {
            if (j.gane === primero) count++;
            else break;
          }
          setRacha({ gane: primero, cantidad: count });
        }
      }

      setLoading(false);
    }
    cargar();
  }, [userId]);

  if (!isSupabaseConfigured || loading) return null;
  if (!rankings.length && !sanciones.length && !companeros.length) return null;

  return (
    <section className="flex flex-col gap-stack-md">
      <h3 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Torneos</h3>

      {racha && (
        <div className={"rounded-xl p-4 flex items-center gap-3 " + (racha.gane ? "bg-status-ok/10" : "bg-status-error/10")}>
          <span className={"material-symbols-outlined " + (racha.gane ? "text-status-ok" : "text-status-error")}>
            {racha.gane ? "local_fire_department" : "trending_down"}
          </span>
          <p className="text-body-md font-body-md text-on-surface">
            Racha actual: <strong>{racha.cantidad}</strong> {racha.gane ? "victorias consecutivas" : "derrotas consecutivas"}
          </p>
        </div>
      )}

      {rankings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rankings.map((r) => {
            const puntos = historial[r.id] || [];
            return (
              <div key={r.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-label-caps font-label-caps text-text-secondary uppercase">
                      Ranking {r.tipo === "oficial" ? "Oficial" : "del Club"} · {r.categoria?.nombre}
                    </p>
                    <p className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-text-primary">
                      #{r.posicion || "-"} <span className="text-body-md font-body-md text-text-secondary font-normal">({r.puntos} pts)</span>
                    </p>
                  </div>
                </div>
                {puntos.length > 1 && <Sparkline valores={puntos.map((p) => Number(p.puntos))} />}
              </div>
            );
          })}
        </div>
      )}

      {companeros.length > 0 && (
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4">
          <p className="text-label-caps font-label-caps text-text-secondary uppercase mb-2">Compañeros frecuentes</p>
          <div className="flex flex-wrap gap-2">
            {companeros.map((c, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-surface-container-high text-label-caps font-label-caps text-text-primary">
                {c.nombre} ({c.veces})
              </span>
            ))}
          </div>
        </div>
      )}

      {sanciones.length > 0 && (
        <div className="flex flex-col gap-2">
          {sanciones.map((s) => (
            <div key={s.id} className="bg-status-error/10 border border-status-error/30 rounded-xl p-4">
              <p className="text-label-caps font-label-caps text-status-error uppercase font-bold">{TIPO_LABEL[s.tipo]}</p>
              <p className="text-body-md font-body-md text-text-primary mt-1">{s.motivo}</p>
              <p className="text-label-muted font-label-muted text-text-secondary mt-1">
                Desde {fmtFecha(s.fecha_inicio)}
                {s.fecha_fin ? ` hasta ${fmtFecha(s.fecha_fin)}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Sparkline({ valores }) {
  const w = 200;
  const h = 40;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const puntos = valores.map((v, i) => `${(i / (valores.length - 1)) * w},${h - ((v - min) / rango) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" points={puntos} />
    </svg>
  );
}
