import Modal from "./Modal.jsx";

const notifications = [
  { icon: "sports_tennis", title: "Tu partido empieza pronto", desc: "Cancha 3 - Hoy 20:30hs", time: "Hace 10 min" },
  { icon: "chat_bubble", title: "Nuevo mensaje en el chat", desc: "Lucas: ¿Alguien lleva pelotas?", time: "Hace 1 hora" },
  { icon: "payments", title: "Pago confirmado", desc: "Seña de $3.600 acreditada", time: "Ayer" },
];

export default function NotificationsModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Notificaciones">
      <div className="flex flex-col gap-3">
        {notifications.map((n, i) => (
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
    </Modal>
  );
}
