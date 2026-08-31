import { useEffect, useState } from "react";
import DropdownPanel from "./DropdownPanel.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

const notificationsMock = [
  { icon: "sports_tennis", title: "Tu partido empieza pronto", desc: "Cancha 3 - Hoy 20:30hs", time: "Hace 10 min" },
  { icon: "chat_bubble", title: "Nuevo mensaje en el chat", desc: "Lucas: ¿Alguien lleva pelotas?", time: "Hace 1 hora" },
  { icon: "payments", title: "Pago confirmado", desc: "Seña de $3.600 acreditada", time: "Ayer" },
];

const ICONO_POR_TIPO = {
  cierre_inscripcion: "event_busy",
  proximo_partido: "sports_tennis",
  cambio_horario: "schedule",
  cambio_cancha: "location_on",
  pago: "payments",
  sancion: "gavel",
};

export default function NotificationsModal({ open, onClose }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !isSupabaseConfigured || !user) return;
    async function cargar() {
      setLoading(true);
      const { data } = await supabase.from("notificaciones").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(20);
      setNotifs(data || []);
      setLoading(false);
      const sinLeer = (data || []).filter((n) => !n.leida).map((n) => n.id);
      if (sinLeer.length) {
        await supabase.from("notificaciones").update({ leida: true }).in("id", sinLeer);
      }
    }
    cargar();
  }, [open, user]);

  const usandoMock = !isSupabaseConfigured;
  const items = usandoMock
    ? notificationsMock
    : notifs.map((n) => ({ icon: ICONO_POR_TIPO[n.tipo] || "notifications", title: n.titulo, desc: n.mensaje, time: tiempoRelativo(n.created_at) }));

  return (
    <DropdownPanel open={open} onClose={onClose} title="Notificaciones" anchor="top-right">
      <div className="flex flex-col gap-3">
        {!usandoMock && loading && <p className="text-center text-text-secondary py-6">Cargando...</p>}
        {!usandoMock && !loading && items.length === 0 && <p className="text-center text-text-secondary py-6">No tenés notificaciones.</p>}
        {items.map((n, i) => (
          <div
            key={i}
            className="animate-item flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-body-md font-body-md font-semibold text-on-surface">{n.title}</p>
              <p className="text-label-muted font-label-muted text-text-secondary">{n.desc}</p>
            </div>
            <span className="text-[11px] text-text-secondary whitespace-nowrap">{n.time}</span>
          </div>
        ))}
      </div>
    </DropdownPanel>
  );
}

function tiempoRelativo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "Ayer" : `Hace ${dias} días`;
}
