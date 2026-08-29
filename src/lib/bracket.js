import { supabase } from "./supabaseClient.js";

const FASE_POR_TAMANO = { 2: "Final", 4: "Semifinal", 8: "Cuartos de Final", 16: "Octavos de Final", 32: "Dieciseisavos de Final" };

export function nombreFase(equiposEnRonda) {
  return FASE_POR_TAMANO[equiposEnRonda] || `Ronda de ${equiposEnRonda}`;
}

// Reparte partidos entre las canchas disponibles y les asigna un horario, para que el fixture
// nunca quede con "cancha" u "horario" en blanco. Si no hay canchas cargadas, solo deja
// cancha_id en null (torneo_partidos.cancha_id es nullable) pero igual arma el horario.
function asignarCanchaYHorario(cantidad, { canchaIds = [], fechaInicio, duracionMin = 90 } = {}) {
  const inicioBase = fechaInicio ? new Date(fechaInicio) : new Date();
  if (!fechaInicio) inicioBase.setHours(9, 0, 0, 0);
  const numCanchas = canchaIds.length || 1;
  const turnoPorCancha = new Array(numCanchas).fill(0);
  const asignaciones = [];
  for (let i = 0; i < cantidad; i++) {
    const canchaIdx = i % numCanchas;
    const turno = turnoPorCancha[canchaIdx]++;
    const horario = new Date(inicioBase.getTime() + turno * duracionMin * 60000);
    asignaciones.push({ cancha_id: canchaIds[canchaIdx] || null, horario_programado: horario.toISOString() });
  }
  return asignaciones;
}

// Arma las rondas de una llave de eliminación directa a partir de una lista de inscripcion_id.
// Rellena con "bye" (pase libre) hasta la potencia de 2 más cercana. Cada bye se le asigna a
// una pareja distinta (nunca dos byes en el mismo cruce) para que ningún partido de la primera
// ronda quede "null vs null" — un cruce que jamás se podría jugar ni resolver.
export function generarLlaveEliminacion(inscripcionIds) {
  const n = inscripcionIds.length;
  if (n < 2) return [];
  let size = 1;
  while (size < n) size *= 2;
  const byes = size - n;

  const primeraRonda = inscripcionIds.slice(0, byes).map((id) => ({ pareja1_inscripcion_id: id, pareja2_inscripcion_id: null }));
  const sinBye = inscripcionIds.slice(byes);
  for (let i = 0; i < sinBye.length; i += 2) {
    primeraRonda.push({ pareja1_inscripcion_id: sinBye[i], pareja2_inscripcion_id: sinBye[i + 1] });
  }

  const rounds = [{ fase: nombreFase(size), ronda: 1, partidos: primeraRonda }];
  let current = new Array(primeraRonda.length).fill(null);
  let ronda = 2;
  while (current.length >= 2) {
    const partidos = [];
    for (let i = 0; i < current.length; i += 2) {
      partidos.push({ pareja1_inscripcion_id: current[i], pareja2_inscripcion_id: current[i + 1] });
    }
    rounds.push({ fase: nombreFase(current.length), ronda, partidos });
    current = new Array(partidos.length).fill(null);
    ronda++;
  }
  return rounds;
}

// Divide a las parejas en zonas de round-robin (fase de grupos previa a la llave).
export function generarZonas(inscripcionIds, tamanoZona = 4) {
  const zonas = [];
  for (let i = 0; i < inscripcionIds.length; i += tamanoZona) {
    zonas.push(inscripcionIds.slice(i, i + tamanoZona));
  }
  return zonas.map((equipos, zi) => {
    const partidos = [];
    for (let i = 0; i < equipos.length; i++) {
      for (let j = i + 1; j < equipos.length; j++) {
        partidos.push({ pareja1_inscripcion_id: equipos[i], pareja2_inscripcion_id: equipos[j] });
      }
    }
    return { fase: `Zona ${String.fromCharCode(65 + zi)}`, ronda: 1, partidos };
  });
}

export async function guardarZonas(torneoCategoriaId, inscripcionIds, tamanoZona = 4, opciones = {}) {
  const zonas = generarZonas(inscripcionIds, tamanoZona);
  const partidosPlanos = zonas.flatMap((z) => z.partidos.map((p) => ({ ...p, fase: z.fase })));
  const horarios = asignarCanchaYHorario(partidosPlanos.length, opciones);
  const rows = partidosPlanos.map((p, idx) => ({
    torneo_categoria_id: torneoCategoriaId,
    fase: p.fase,
    ronda: 1,
    pareja1_inscripcion_id: p.pareja1_inscripcion_id,
    pareja2_inscripcion_id: p.pareja2_inscripcion_id,
    cancha_id: horarios[idx].cancha_id,
    horario_programado: horarios[idx].horario_programado,
  }));
  const { error } = await supabase.from("torneo_partidos").insert(rows);
  if (error) throw error;
}

// Persiste una llave de eliminación directa: inserta desde la final hacia atrás para poder
// enlazar siguiente_partido_id, y resuelve automáticamente los "bye" como walkover.
export async function guardarLlaveEliminacion(torneoCategoriaId, inscripcionIds, opciones = {}) {
  const rounds = generarLlaveEliminacion(inscripcionIds);
  if (!rounds.length) return [];

  const insertedByRound = [];
  let siguientesIds = null;
  for (let r = rounds.length - 1; r >= 0; r--) {
    const round = rounds[r];
    // El horario solo se conoce de antemano para la primera ronda: las siguientes dependen
    // de cuándo terminen los partidos previos. La cancha en cambio se reparte siempre, para
    // que ninguna tarjeta del fixture quede sin cancha asignada.
    const esPrimeraRonda = round.ronda === 1;
    const horarios = asignarCanchaYHorario(round.partidos.length, opciones);
    const rows = round.partidos.map((p, idx) => ({
      torneo_categoria_id: torneoCategoriaId,
      fase: round.fase,
      ronda: round.ronda,
      pareja1_inscripcion_id: p.pareja1_inscripcion_id,
      pareja2_inscripcion_id: p.pareja2_inscripcion_id,
      cancha_id: horarios[idx].cancha_id,
      horario_programado: esPrimeraRonda ? horarios[idx].horario_programado : null,
      siguiente_partido_id: siguientesIds ? siguientesIds[Math.floor(idx / 2)] : null,
    }));
    const { data, error } = await supabase.from("torneo_partidos").insert(rows).select("id");
    if (error) throw error;
    insertedByRound[r] = data.map((d) => d.id);
    siguientesIds = insertedByRound[r];
  }

  await resolverByes(rounds, insertedByRound);
  return insertedByRound;
}

// Los "bye" (un lado null, el otro con pareja) solo pueden existir en la primera ronda —
// generarLlaveEliminacion garantiza eso. En cualquier ronda posterior, un lado en null
// significa "todavía no se jugó el partido anterior", NO un bye — si acá tratáramos ese
// null como bye, avanzaríamos a un finalista sin que se haya jugado el partido real.
async function resolverByes(rounds, insertedByRound) {
  if (!rounds.length) return;
  const ids = insertedByRound[0];
  const partidos = rounds[0].partidos;
  for (let i = 0; i < partidos.length; i++) {
    const p = partidos[i];
    const esBye = Boolean(p.pareja1_inscripcion_id) !== Boolean(p.pareja2_inscripcion_id);
    if (!esBye) continue;
    const ganador = p.pareja1_inscripcion_id || p.pareja2_inscripcion_id;
    const matchId = ids[i];
    await supabase.from("torneo_partidos").update({ estado: "walkover" }).eq("id", matchId);
    await supabase.from("resultados").insert({ torneo_partido_id: matchId, ganador_inscripcion_id: ganador, sets: [] });
    if (rounds.length > 1) {
      const nextIdx = Math.floor(i / 2);
      const nextMatchId = insertedByRound[1][nextIdx];
      const slot = i % 2 === 0 ? "pareja1_inscripcion_id" : "pareja2_inscripcion_id";
      await supabase.from("torneo_partidos").update({ [slot]: ganador }).eq("id", nextMatchId);
    }
  }
}

// Al cargar un resultado, hace avanzar al ganador al siguiente_partido_id (si existe).
// Completa el primer casillero (pareja1/pareja2) que esté vacío en vez de "adivinar" cuál le
// corresponde por orden — así nunca pisa a una pareja que ya haya avanzado (por ejemplo, por bye).
export async function avanzarGanador(torneoPartidoId, ganadorInscripcionId) {
  const { data: partido, error } = await supabase
    .from("torneo_partidos")
    .select("siguiente_partido_id")
    .eq("id", torneoPartidoId)
    .single();
  if (error || !partido?.siguiente_partido_id) return;

  const { data: siguiente } = await supabase
    .from("torneo_partidos")
    .select("pareja1_inscripcion_id, pareja2_inscripcion_id")
    .eq("id", partido.siguiente_partido_id)
    .single();
  if (!siguiente) return;

  const slot = !siguiente.pareja1_inscripcion_id ? "pareja1_inscripcion_id" : "pareja2_inscripcion_id";
  await supabase.from("torneo_partidos").update({ [slot]: ganadorInscripcionId }).eq("id", partido.siguiente_partido_id);
}

// Reordenamiento por demora: dado un partido demorado X minutos, calcula el nuevo horario
// de los partidos siguientes en la misma cancha (función pura, no toca la base de datos).
export function recalcularDemora(partidos, partidoDemoradoId, minutosDemora) {
  const demorado = partidos.find((p) => p.id === partidoDemoradoId);
  if (!demorado?.horario_programado) return [];
  const afectados = partidos
    .filter(
      (p) =>
        p.cancha_id === demorado.cancha_id &&
        p.id !== demorado.id &&
        p.horario_programado &&
        new Date(p.horario_programado) > new Date(demorado.horario_programado)
    )
    .sort((a, b) => new Date(a.horario_programado) - new Date(b.horario_programado));

  return afectados.map((p) => ({
    id: p.id,
    horario_programado: new Date(new Date(p.horario_programado).getTime() + minutosDemora * 60000).toISOString(),
  }));
}
