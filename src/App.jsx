import { Routes, Route, Link, useLocation } from "react-router-dom";
import LoginRegistro from "./pages/LoginRegistro.jsx";
import HomeJugador from "./pages/HomeJugador.jsx";
import PartidosAbiertos from "./pages/PartidosAbiertos.jsx";
import PerfilDeUsuario from "./pages/PerfilDeUsuario.jsx";
import MisReservas from "./pages/MisReservas.jsx";
import SelectorDeHorarios from "./pages/SelectorDeHorarios.jsx";
import ResumenYPago from "./pages/ResumenYPago.jsx";
import DetalleDelComplejo from "./pages/DetalleDelComplejo.jsx";
import DetalleDelPartido from "./pages/DetalleDelPartido.jsx";
import ChatDelPartido from "./pages/ChatDelPartido.jsx";
import DashboardAdministrador from "./pages/DashboardAdministrador.jsx";
import CajaYCobros from "./pages/CajaYCobros.jsx";
import GestionDeClientes from "./pages/GestionDeClientes.jsx";
import TimelineDeCanchas from "./pages/TimelineDeCanchas.jsx";

const screens = [
  ["/", "Login / Registro"],
  ["/home-jugador", "Home Jugador"],
  ["/partidos-abiertos", "Partidos Abiertos"],
  ["/perfil-de-usuario", "Perfil de Usuario"],
  ["/mis-reservas", "Mis Reservas"],
  ["/selector-de-horarios", "Selector de Horarios"],
  ["/resumen-y-pago", "Resumen y Pago"],
  ["/detalle-del-complejo", "Detalle del Complejo"],
  ["/detalle-del-partido", "Detalle del Partido"],
  ["/chat-del-partido", "Chat del Partido"],
  ["/dashboard-administrador", "Dashboard Administrador"],
  ["/caja-y-cobros", "Caja y Cobros"],
  ["/gestion-de-clientes", "Gestión de Clientes"],
  ["/timeline-de-canchas", "Timeline de Canchas"],
];

function ScreensIndex() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Padel Hub Mendoza — Pantallas</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside">
        {screens.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-primary hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-in">
      <Routes location={location}>
        <Route path="/" element={<LoginRegistro />} />
        <Route path="/screens" element={<ScreensIndex />} />
        <Route path="/home-jugador" element={<HomeJugador />} />
        <Route path="/partidos-abiertos" element={<PartidosAbiertos />} />
        <Route path="/perfil-de-usuario" element={<PerfilDeUsuario />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/selector-de-horarios" element={<SelectorDeHorarios />} />
        <Route path="/resumen-y-pago" element={<ResumenYPago />} />
        <Route path="/detalle-del-complejo" element={<DetalleDelComplejo />} />
        <Route path="/detalle-del-partido" element={<DetalleDelPartido />} />
        <Route path="/chat-del-partido" element={<ChatDelPartido />} />
        <Route path="/dashboard-administrador" element={<DashboardAdministrador />} />
        <Route path="/caja-y-cobros" element={<CajaYCobros />} />
        <Route path="/gestion-de-clientes" element={<GestionDeClientes />} />
        <Route path="/timeline-de-canchas" element={<TimelineDeCanchas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-background">
      <span className="material-symbols-outlined text-6xl text-text-secondary">sports_tennis</span>
      <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Página no encontrada</h1>
      <p className="text-body-md font-body-md text-text-secondary">Esta pantalla todavía no existe.</p>
      <Link to="/" className="mt-2 px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-label-caps text-label-caps">
        Volver al inicio
      </Link>
    </div>
  );
}
