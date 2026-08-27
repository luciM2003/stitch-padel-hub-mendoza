import { Link, useLocation } from "react-router-dom";

const items = [
  { key: "home", to: "/home-jugador", icon: "home", label: "Inicio" },
  { key: "play", to: "/partidos-abiertos", icon: "sports_tennis", label: "Partidos" },
  { key: "events", to: "/mis-reservas", icon: "event_note", label: "Mis Reservas" },
  { key: "profile", to: "/perfil-de-usuario", icon: "person", label: "Perfil" },
];

export default function PlayerSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border-subtle h-screen sticky top-0 shrink-0 py-stack-md px-inline-gutter">
      <div className="flex items-center gap-3 mb-stack-lg px-3">
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            sports_tennis
          </span>
        </div>
        <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Padel Pro</span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 " +
                (active ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:bg-surface-container-high")
              }
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              <span className="font-label-caps text-label-caps">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 px-3 py-3 border-t border-border-subtle pt-4">
        <img
          className="w-10 h-10 rounded-full object-cover border border-border-subtle"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV9jtoStxOAlRpzXXf43OWAdu-_YJgJTKcwBpyVSH7eBsS_7k_aRDnPaueHGU_niW3hlbMK5dQF_aazzy694sdIe_cyNu4yhtYovlwgAGgEg0GG0Jkudx9_7aHZZpmR_5W6SntsEJdlPrDpTm_qLhsZUJsSkTKCtK_ySYPtEVtY9vpvgCBJ4vIpZRoThwCrR2QDvW0oC39a8CZgk01xCBtX_a61u71fvQd7O285RvLd920ty27NA8"
        />
        <div className="overflow-hidden">
          <p className="font-label-caps text-label-caps text-text-primary truncate">Mateo R.</p>
          <p className="font-label-muted text-label-muted text-text-secondary truncate">Nivel 4.5</p>
        </div>
      </div>
    </aside>
  );
}
