import { Link, useLocation } from "react-router-dom";

const items = [
  { key: "home", to: "/home-jugador", icon: "home" },
  { key: "play", to: "/partidos-abiertos", icon: "sports_tennis" },
  { key: "events", to: "/mis-reservas", icon: "event_note" },
  { key: "profile", to: "/perfil-de-usuario", icon: "person" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden flex justify-around items-end pb-6 pt-2 px-6 w-full fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-t border-border-subtle dark:border-outline-variant shadow-lg">
      {items.map((item) => {
        const active = pathname === item.to;
        return (
          <Link key={item.key} to={item.to} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
            <div
              className={
                active
                  ? "flex items-center justify-center bg-primary dark:bg-primary-fixed text-on-primary dark:text-on-primary-fixed rounded-full w-12 h-12 mb-2 shadow-md scale-110 transition-all duration-300 ease-out"
                  : "flex items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant w-12 h-12 hover:text-primary hover:scale-105 transition-all duration-200"
              }
            >
              <span
                className="material-symbols-outlined transition-all duration-200"
                style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
              >
                {item.icon}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
