export const playerNav = [
  { key: "home", to: "/home-jugador", icon: "home", label: "Inicio" },
  { key: "play", to: "/partidos-abiertos", icon: "sports_tennis", label: "Partidos" },
  { key: "torneos", to: "/torneos", icon: "emoji_events", label: "Torneos" },
  { key: "events", to: "/mis-reservas", icon: "event_note", label: "Mis Reservas" },
  { key: "profile", to: "/perfil-de-usuario", icon: "person", label: "Perfil" },
];

export const adminNav = [
  { key: "dashboard", to: "/dashboard-administrador", icon: "dashboard", label: "Panel" },
  { key: "canchas", to: "/timeline-de-canchas", icon: "sports_tennis", label: "Canchas" },
  { key: "clientes", to: "/gestion-de-clientes", icon: "group", label: "Clientes" },
  { key: "caja", to: "/caja-y-cobros", icon: "point_of_sale", label: "Caja y Cobros" },
  { key: "torneos", to: "/admin/torneos", icon: "emoji_events", label: "Torneos" },
  { key: "sponsors", to: "/admin/sponsors", icon: "handshake", label: "Sponsors" },
  { key: "sanciones", to: "/admin/sanciones", icon: "gavel", label: "Sanciones" },
  { key: "settings", icon: "settings", label: "Configuración", action: "settings" },
];

export const adminMobileNav = [
  { key: "dashboard", to: "/dashboard-administrador", icon: "home" },
  { key: "canchas", to: "/timeline-de-canchas", icon: "sports_tennis" },
  { key: "torneos", to: "/admin/torneos", icon: "emoji_events" },
  { key: "caja", to: "/caja-y-cobros", icon: "event_note" },
  { key: "clientes", to: "/gestion-de-clientes", icon: "person" },
];
