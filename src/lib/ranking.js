import { supabase } from "./supabaseClient.js";

// Escala de puntos v1 (configurable a futuro desde el panel de club).
export const PUNTOS_FASE = {
  "Final": { ganador: 100, perdedor: 70 },
  "Semifinal": { perdedor: 50 },
  "Cuartos de Final": { perdedor: 30 },
  "Octavos de Final": { perdedor: 15 },
  "Dieciseisavos de Final": { perdedor: 8 },
};
export const PUNTOS_PARTICIPACION = 5;

// Recorre el fixture ya finalizado de una torneo_categoria, asigna puntos de ranking de club
// a cada jugador involucrado y guarda un snapshot en ranking_historial. No toca el ranking
// "oficial" (ese se carga manualmente por el admin, ver DESIGN NOTES del plan).
export async function finalizarTorneoCategoria(torneoCategoriaId, torneoId) {
  const { data: categoriaRow, error: catError } = await supabase
    .from("torneo_categorias")
    .select("categoria_id")
    .eq("id", torneoCategoriaId)
    .single();
  if (catError || !categoriaRow) throw new Error("No se encontró la categoría del torneo");
  const categoriaId = categoriaRow.categoria_id;

  const { data: partidos, error } = await supabase
    .from("torneo_partidos")
    .select("id, fase, pareja1_inscripcion_id, pareja2_inscripcion_id, resultados(ganador_inscripcion_id)")
    .eq("torneo_categoria_id", torneoCategoriaId);
  if (error) throw error;

  const puntosPorInscripcion = new Map();
  const sumar = (inscripcionId, puntos) => {
    if (!inscripcionId || !puntos) return;
    puntosPorInscripcion.set(inscripcionId, (puntosPorInscripcion.get(inscripcionId) || 0) + puntos);
  };

  for (const p of partidos || []) {
    const ganadorId = Array.isArray(p.resultados) ? p.resultados[0]?.ganador_inscripcion_id : p.resultados?.ganador_inscripcion_id;
    if (!ganadorId) continue;
    const perdedorId = p.pareja1_inscripcion_id === ganadorId ? p.pareja2_inscripcion_id : p.pareja1_inscripcion_id;

    sumar(p.pareja1_inscripcion_id, PUNTOS_PARTICIPACION);
    sumar(p.pareja2_inscripcion_id, PUNTOS_PARTICIPACION);

    const escala = PUNTOS_FASE[p.fase];
    if (!escala) continue;
    if (p.fase === "Final") {
      sumar(ganadorId, escala.ganador);
      sumar(perdedorId, escala.perdedor);
    } else {
      sumar(perdedorId, escala.perdedor);
    }
  }

  const inscripcionIds = [...puntosPorInscripcion.keys()];
  if (!inscripcionIds.length) return;

  const { data: ijRows } = await supabase
    .from("inscripcion_jugadores")
    .select("inscripcion_id, profile_id")
    .in("inscripcion_id", inscripcionIds);

  const puntosPorJugador = new Map();
  for (const row of ijRows || []) {
    const pts = puntosPorInscripcion.get(row.inscripcion_id) || 0;
    puntosPorJugador.set(row.profile_id, (puntosPorJugador.get(row.profile_id) || 0) + pts);
  }

  for (const [profileId, puntosGanados] of puntosPorJugador) {
    const { data: existente } = await supabase
      .from("rankings")
      .select("id, puntos")
      .eq("categoria_id", categoriaId)
      .eq("profile_id", profileId)
      .eq("tipo", "club")
      .maybeSingle();

    let rankingId = existente?.id;
    const nuevosPuntos = Number(existente?.puntos || 0) + puntosGanados;

    if (existente) {
      await supabase.from("rankings").update({ puntos: nuevosPuntos, updated_at: new Date().toISOString() }).eq("id", existente.id);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("rankings")
        .insert({ categoria_id: categoriaId, profile_id: profileId, tipo: "club", puntos: nuevosPuntos })
        .select("id")
        .single();
      if (insertError) throw insertError;
      rankingId = inserted.id;
    }

    await supabase.from("ranking_historial").insert({ ranking_id: rankingId, torneo_id: torneoId, puntos: nuevosPuntos });
  }

  await recomputarPosiciones(categoriaId, "club");
  return categoriaId;
}

export async function recomputarPosiciones(categoriaId, tipo) {
  const { data: rows } = await supabase
    .from("rankings")
    .select("id, puntos")
    .eq("categoria_id", categoriaId)
    .eq("tipo", tipo)
    .order("puntos", { ascending: false });

  await Promise.all((rows || []).map((r, idx) => supabase.from("rankings").update({ posicion: idx + 1 }).eq("id", r.id)));
}

// Ascensos/descensos v1: da de alta al jugador en el ranking de la categoría vecina (orden+1 / orden-1)
// del club, en base a su posición final. No lo "saca" de la categoría actual: el jugador queda
// habilitado en ambas hasta que el club decida en qué categoría lo inscribe la próxima vez.
export async function evaluarAscensosDescensos(categoriaId, clubId, { ascienden = 2, descienden = 2 } = {}) {
  const { data: categorias } = await supabase.from("categorias").select("id, orden").eq("club_id", clubId).order("orden");
  const actual = categorias?.find((c) => c.id === categoriaId);
  if (!actual) return;

  const superior = categorias.find((c) => c.orden === actual.orden + 1);
  const inferior = categorias.find((c) => c.orden === actual.orden - 1);

  const { data: tabla } = await supabase
    .from("rankings")
    .select("profile_id, posicion")
    .eq("categoria_id", categoriaId)
    .eq("tipo", "club")
    .order("posicion");
  if (!tabla?.length) return;

  // Si la tabla es chica, evitamos que el mismo jugador quede en el grupo de ascenso y en el
  // de descenso a la vez (ej. categoría con solo 3 anotados y ascienden=descienden=2).
  const desciendenSinSolapar = Math.max(0, Math.min(descienden, tabla.length - ascienden));

  const altas = [];
  if (superior) {
    for (const j of tabla.slice(0, ascienden)) {
      altas.push(supabase.from("rankings").upsert(
        { categoria_id: superior.id, profile_id: j.profile_id, tipo: "club", puntos: 0 },
        { onConflict: "categoria_id,profile_id,tipo", ignoreDuplicates: true }
      ));
    }
  }
  if (inferior && desciendenSinSolapar > 0) {
    for (const j of tabla.slice(-desciendenSinSolapar)) {
      altas.push(supabase.from("rankings").upsert(
        { categoria_id: inferior.id, profile_id: j.profile_id, tipo: "club", puntos: 0 },
        { onConflict: "categoria_id,profile_id,tipo", ignoreDuplicates: true }
      ));
    }
  }
  await Promise.all(altas);
}
