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
// (por sede) a cada jugador involucrado, guarda un snapshot en ranking_historial, y suma los
// mismos puntos al ranking oficial de toda la app (vía categoria_global_id, para que puntúe
// junto con torneos de otros clubes en la misma categoría/género).
export async function finalizarTorneoCategoria(torneoCategoriaId, torneoId, sedeId) {
  const { data: categoriaRow, error: catError } = await supabase
    .from("torneo_categorias")
    .select("categoria_id, categoria:categorias(categoria_global_id)")
    .eq("id", torneoCategoriaId)
    .single();
  if (catError || !categoriaRow) throw new Error("No se encontró la categoría del torneo");
  const categoriaId = categoriaRow.categoria_id;
  const categoriaGlobalId = categoriaRow.categoria?.categoria_global_id || null;

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
      .eq("sede_id", sedeId)
      .maybeSingle();

    let rankingId = existente?.id;
    const nuevosPuntos = Number(existente?.puntos || 0) + puntosGanados;

    if (existente) {
      await supabase.from("rankings").update({ puntos: nuevosPuntos, updated_at: new Date().toISOString() }).eq("id", existente.id);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("rankings")
        .insert({ categoria_id: categoriaId, profile_id: profileId, tipo: "club", sede_id: sedeId, puntos: nuevosPuntos })
        .select("id")
        .single();
      if (insertError) throw insertError;
      rankingId = inserted.id;
    }

    await supabase.from("ranking_historial").insert({ ranking_id: rankingId, torneo_id: torneoId, puntos: nuevosPuntos });

    if (categoriaGlobalId) {
      const { data: oficialExistente } = await supabase
        .from("ranking_oficial")
        .select("id, puntos")
        .eq("categoria_global_id", categoriaGlobalId)
        .eq("profile_id", profileId)
        .maybeSingle();
      const nuevosPuntosOficial = Number(oficialExistente?.puntos || 0) + puntosGanados;
      if (oficialExistente) {
        await supabase.from("ranking_oficial").update({ puntos: nuevosPuntosOficial, updated_at: new Date().toISOString() }).eq("id", oficialExistente.id);
      } else {
        await supabase.from("ranking_oficial").insert({ categoria_global_id: categoriaGlobalId, profile_id: profileId, puntos: nuevosPuntosOficial });
      }
    }
  }

  await recomputarPosiciones(categoriaId, "club", sedeId);
  if (categoriaGlobalId) await recomputarPosicionesOficial(categoriaGlobalId);
  return categoriaId;
}

export async function recomputarPosiciones(categoriaId, tipo, sedeId) {
  let query = supabase.from("rankings").select("id, puntos").eq("categoria_id", categoriaId).eq("tipo", tipo).order("puntos", { ascending: false });
  query = sedeId ? query.eq("sede_id", sedeId) : query.is("sede_id", null);
  const { data: rows } = await query;

  await Promise.all((rows || []).map((r, idx) => supabase.from("rankings").update({ posicion: idx + 1 }).eq("id", r.id)));
}

export async function recomputarPosicionesOficial(categoriaGlobalId) {
  const { data: rows } = await supabase
    .from("ranking_oficial")
    .select("id, puntos")
    .eq("categoria_global_id", categoriaGlobalId)
    .order("puntos", { ascending: false });

  await Promise.all((rows || []).map((r, idx) => supabase.from("ranking_oficial").update({ posicion: idx + 1 }).eq("id", r.id)));
}

// Ascensos/descensos v1: da de alta al jugador en el ranking de la categoría vecina (orden+1 / orden-1,
// misma sede y mismo género) del club, en base a su posición final. No lo "saca" de la categoría
// actual: el jugador queda habilitado en ambas hasta que el club decida en qué categoría lo
// inscribe la próxima vez.
export async function evaluarAscensosDescensos(categoriaId, clubId, sedeId, { ascienden = 2, descienden = 2 } = {}) {
  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, orden, categoria_global:categorias_globales(genero)")
    .eq("club_id", clubId)
    .order("orden");
  const actual = categorias?.find((c) => c.id === categoriaId);
  if (!actual) return;
  const genero = actual.categoria_global?.genero;
  const mismoGenero = (c) => (genero ? c.categoria_global?.genero === genero : true);

  const superior = categorias.find((c) => c.orden === actual.orden + 1 && mismoGenero(c));
  const inferior = categorias.find((c) => c.orden === actual.orden - 1 && mismoGenero(c));

  const { data: tabla } = await supabase
    .from("rankings")
    .select("profile_id, posicion")
    .eq("categoria_id", categoriaId)
    .eq("tipo", "club")
    .eq("sede_id", sedeId)
    .order("posicion");
  if (!tabla?.length) return;

  // Si la tabla es chica, evitamos que el mismo jugador quede en el grupo de ascenso y en el
  // de descenso a la vez (ej. categoría con solo 3 anotados y ascienden=descienden=2).
  const desciendenSinSolapar = Math.max(0, Math.min(descienden, tabla.length - ascienden));

  const altas = [];
  if (superior) {
    for (const j of tabla.slice(0, ascienden)) {
      altas.push(supabase.from("rankings").upsert(
        { categoria_id: superior.id, profile_id: j.profile_id, tipo: "club", sede_id: sedeId, puntos: 0 },
        { onConflict: "categoria_id,profile_id,tipo,sede_id", ignoreDuplicates: true }
      ));
    }
  }
  if (inferior && desciendenSinSolapar > 0) {
    for (const j of tabla.slice(-desciendenSinSolapar)) {
      altas.push(supabase.from("rankings").upsert(
        { categoria_id: inferior.id, profile_id: j.profile_id, tipo: "club", sede_id: sedeId, puntos: 0 },
        { onConflict: "categoria_id,profile_id,tipo,sede_id", ignoreDuplicates: true }
      ));
    }
  }
  await Promise.all(altas);
}
