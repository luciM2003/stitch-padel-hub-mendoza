import { supabase } from "./supabaseClient.js";

// TODO: WhatsApp Business API / push reales. Por ahora solo insertamos la notificación
// in-app en la tabla `notificaciones` (canal_enviado queda marcado como stub) y el usuario
// la ve dentro de la app; el envío por WhatsApp/push efectivo se conecta más adelante.

export async function notificar({ profileId, tipo, titulo, mensaje, canal = "whatsapp_stub" }) {
  const { error } = await supabase.from("notificaciones").insert({
    profile_id: profileId,
    tipo,
    titulo,
    mensaje,
    canal_enviado: canal,
  });
  if (error) console.error("No se pudo crear la notificación:", error.message);
}

export async function notificarVarios(profileIds, { tipo, titulo, mensaje, canal = "whatsapp_stub" }) {
  await Promise.all(profileIds.map((profileId) => notificar({ profileId, tipo, titulo, mensaje, canal })));
}
