import { supabase } from "./supabaseClient.js";

// Si ambos jugadores de una inscripción ya están marcados como "pagado", la pasa a "confirmada".
export async function checkYConfirmar(inscripcionId) {
  const { data: filas } = await supabase.from("inscripcion_jugadores").select("estado_pago").eq("inscripcion_id", inscripcionId);
  if (filas?.length === 2 && filas.every((f) => f.estado_pago === "pagado")) {
    await supabase.from("inscripciones").update({ estado: "confirmada" }).eq("id", inscripcionId);
  }
}
