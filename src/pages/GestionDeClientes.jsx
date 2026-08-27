import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import { useToast } from "../components/Toast.jsx";

const sidebarLinks = [
  { icon: "dashboard", label: "Dashboard", to: "/dashboard-administrador" },
  { icon: "sports_tennis", label: "Canchas", to: "/timeline-de-canchas" },
  { icon: "groups", label: "Clientes", to: "/gestion-de-clientes" },
  { icon: "payments", label: "Pagos", to: "/caja-y-cobros" },
  { icon: "settings", label: "Ajustes", action: "settings" },
];

const mobileNavItems = [
  { icon: "home", to: "/dashboard-administrador" },
  { icon: "sports_tennis", to: "/timeline-de-canchas" },
  { icon: "event_note", to: "/caja-y-cobros" },
  { icon: "person", to: "/gestion-de-clientes" },
];

const WhatsAppIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const clientesIniciales = [
  {
    id: 1,
    nombre: "Carlos Ruiz",
    telefono: "+34 600 123 456",
    nivel: "4.5",
    partidos: 42,
    estado: "ok",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKCwcn9u00UUakWfn5L2aQeQ2VeHJ35q_heUlRgoxtuJr319Orw7sNpbZW7sgOT09SII1Bp7_dKzc7jdbOO2AExsPXX9a2971MwfCdBOr1iqx5ec5KIBP_PGlgbQzYySsW4kST__eOiW2KP2DqFcvDU7eIGm5BNXIXky07sNq-LeDR638CnVwLE7xnjghN9LAMS2uf0IfutMgKeanwJLCWeB3PGq627Ei53naaLlbAEgejIlwiuNo",
  },
  {
    id: 2,
    nombre: "Laura Gómez",
    telefono: "+34 611 987 654",
    nivel: "3.0",
    partidos: 15,
    estado: "deuda",
    deuda: "€45",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJMx4GQzIDRBczVahkKTwTD4sAsHPuef5wM-ulP2Q9niMCfxBZ58xw5ZhbZt9t3TsRdBrEy6_0IaTiG40RQSdYF0cd-_JGngUY3eRKtlznEyW3fzOX6T_0U_gPcpKL6Xod3p1WZgES9z9k0ngkCfNutlCGoruCH5mtGNECeKVqzehFCA6tFuEBolsfH78MEyoqYkwbLI3cRMcRGKOp3Nn4-ETHyjczyC6ZxX6Xkw9jPAFKMFjYpfs",
  },
  {
    id: 3,
    nombre: "Martín Perez",
    telefono: "+34 622 456 789",
    nivel: "4.0",
    partidos: 28,
    estado: "ok",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa9zY_TNKk3b_Tzan5pjLRL4etN9haLKbjul-jFC7YL8b-Oz6oJ4N4z6YLogWy8Qxog9_T9SCAfk8Xfs6hQZ8cea6AD6wDjknfD7fJnMhOGLR5EOQL7UKAl1xCQy1C3uis_5b3mBVh0BF4J564l421TlwY5xcFM35h6Z1pD4SYsNwERYoJR3cMqZEdxor4NZbc9aoU1AQq3JlhuIhGFTdABzevBlyK4Z7XN7oOr2hByQFORPHYG8I",
  },
  {
    id: 4,
    nombre: "Sofía Blanco",
    telefono: "+34 633 111 222",
    nivel: "5.0",
    partidos: 60,
    estado: "ok",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOhYhXwnF6yUIfmhh4TGIpSUli6KUi2oIkfllyeFD7-tnIrIGdHg7cpEPy8qCzBY8ZVVicSE2M9Wwcvhunmls1szmlTCPQkOjgY9l0zXMms6y-GiqEegBNiQ95lZ_3rxEuEOSqtzV9gFN34s1POQZrOcHoLH_wu9iNwC0Va9T1LSFo8ni-NQnT9EZ0PxzumjgFxTnOIg0dDAHlN22zTUfVEm4N5Gy4HBvydk-9Ln4FtLYYsORBODg",
  },
  {
    id: 5,
    nombre: "Nicolás Vega",
    telefono: "+34 644 333 555",
    nivel: "2.5",
    partidos: 8,
    estado: "deuda",
    deuda: "€20",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqID13P7I4HnmzBoxGAswbC6EMW9V7wV3G8qsJycqiNPBeJ_BUhmvvARuMsgvBSWzldeFehnGeIkSjsLIJ_O4jdHIIsmP_atttX6Hy9YJgHsSnrnxblvDkCJzbKQK5s8vlbI3sFMDcvp9JbseUGZ_VrgAl2emLUfqaeXwmkGpLSpBNlTWaexWlsHjxbrfivaRKdyWjZyy_10Z1lOgu4eLEUJ_K-R2l5h750YTJmfgE1u1pDpi_a_8",
  },
];

export default function GestionDeClientes() {
  const { pathname } = useLocation();
  const showToast = useToast();
  const [clientes, setClientes] = useState(clientesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNuevo, setShowNuevo] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", telefono: "", nivel: "" });
  const [pagina, setPagina] = useState(1);
  const PAGE_SIZE = 3;

  const nivelRango = (n) => (n >= 5 ? "3" : n >= 3.5 ? "2" : "1");

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda);
      const matchNivel = !filtroNivel || nivelRango(parseFloat(c.nivel)) === filtroNivel;
      const matchEstado = !filtroEstado || c.estado === (filtroEstado === "ok" ? "ok" : "deuda");
      return matchBusqueda && matchNivel && matchEstado;
    });
  }, [clientes, busqueda, filtroNivel, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const clientesPagina = clientesFiltrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  function actualizarBusqueda(v) {
    setBusqueda(v);
    setPagina(1);
  }

  function actualizarFiltroNivel(v) {
    setFiltroNivel(v);
    setPagina(1);
  }

  function actualizarFiltroEstado(v) {
    setFiltroEstado(v);
    setPagina(1);
  }

  function abrirNuevo() {
    setEditando(null);
    setForm({ nombre: "", telefono: "", nivel: "" });
    setShowNuevo(true);
  }

  function abrirEditar(c) {
    setEditando(c.id);
    setForm({ nombre: c.nombre, telefono: c.telefono, nivel: c.nivel });
    setShowNuevo(true);
  }

  function guardarCliente(e) {
    e.preventDefault();
    if (!form.nombre || !form.telefono) return;
    if (editando) {
      setClientes((prev) => prev.map((c) => (c.id === editando ? { ...c, ...form } : c)));
      showToast("Cliente actualizado");
    } else {
      setClientes((prev) => [
        {
          id: Date.now(),
          nombre: form.nombre,
          telefono: form.telefono,
          nivel: form.nivel || "1.0",
          partidos: 0,
          estado: "ok",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKCwcn9u00UUakWfn5L2aQeQ2VeHJ35q_heUlRgoxtuJr319Orw7sNpbZW7sgOT09SII1Bp7_dKzc7jdbOO2AExsPXX9a2971MwfCdBOr1iqx5ec5KIBP_PGlgbQzYySsW4kST__eOiW2KP2DqFcvDU7eIGm5BNXIXky07sNq-LeDR638CnVwLE7xnjghN9LAMS2uf0IfutMgKeanwJLCWeB3PGq627Ei53naaLlbAEgejIlwiuNo",
        },
        ...prev,
      ]);
      showToast("Cliente agregado");
    }
    setShowNuevo(false);
  }

  function abrirWhatsApp(telefono) {
    const numero = telefono.replace(/[^\d]/g, "");
    window.open(`https://wa.me/${numero}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="bg-background text-text-primary font-body-md min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface z-40 sticky top-0">
        <div className="flex items-center gap-inline-gutter">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-border-subtle">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW_6NGqbmbshoPKoC-QQborubi7Z-KwDp1rOvmaqQDYhGDTICGkeguWyaTxUx4gjBl3NZYFGXD84pw3gpsStkO4s4GJGl7G48buD51vmvPyaVeG8T0GsFU0ovnl3NG4F-QFUwn2wBj4zrSTcNAdXLVAwqsN9ScS1-HbofNq7lvLsivKAduRfZOYTZ1VF1wAu98wLepkCXCH285JIVpmU9dWLe_OMwgnlmsr4wTNNt2l76E0Aan-fk"
            />
          </div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Padel Pro</h1>
        </div>
        <button
          onClick={() => setShowNotifs(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all text-primary"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border-subtle h-screen sticky top-0 p-container-margin shrink-0">
        <div className="mb-stack-lg flex items-center gap-inline-gutter px-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-border-subtle">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg1e_SufaXHcQvaemwes3rzhpDMqxGuW_b-KdY6jGxyPzrelSFkyeOjlQLrQS4j7OCPaurlEL2s_0p8w4u6fu8KyHJgCcijbd761sc23VmUY_g6cdDY7dJ5gPpR1O7DUxG76IYnOSHCfHQfiGFdDd4FzJCxfL-DdhgB6TMNdjxb1koI58RKBv0eoGNNqLsGahDBU9__Jjrqk9ZwC79wQnuLS0LahIjYNCR8qbK3HcFiawSDagFsKM"
            />
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Padel Pro</h1>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {sidebarLinks.map((item) => {
            const active = item.to === pathname;
            const classes =
              "flex items-center gap-inline-gutter px-4 py-3 rounded-lg transition-all active:scale-95 " +
              (active ? "bg-surface-container-high text-primary font-bold" : "text-secondary hover:bg-surface-container-high");
            const content = (
              <>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md">{item.label}</span>
              </>
            );
            if (item.action === "settings") {
              return (
                <button key={item.label} onClick={() => setShowSettings(true)} className={classes + " w-full text-left"}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={item.label} to={item.to} className={classes}>
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-container-margin md:p-stack-lg overflow-x-hidden mb-24 md:mb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-stack-md">
            <div>
              <h2 className="text-headline-xl font-headline-xl text-text-primary mb-2">Gestión de Clientes</h2>
              <p className="text-body-md font-body-md text-text-secondary">Administra jugadores, niveles y estado de cuenta.</p>
            </div>
            <button
              onClick={abrirNuevo}
              className="bg-primary-container text-text-primary font-body-md font-bold px-6 py-3 rounded-full hover:bg-primary-fixed-dim active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Nuevo Cliente
            </button>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-border-subtle flex flex-col md:flex-row gap-4 mb-stack-md">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
              <input
                className="w-full bg-surface pl-12 pr-4 py-3 rounded-lg border border-border-subtle focus:outline-none focus:border-primary-container font-body-md text-text-primary placeholder:text-text-secondary"
                placeholder="Buscar por nombre, teléfono o email..."
                type="text"
                value={busqueda}
                onChange={(e) => actualizarBusqueda(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filtroNivel}
                onChange={(e) => actualizarFiltroNivel(e.target.value)}
                className="bg-surface px-4 py-3 rounded-lg border border-border-subtle font-body-md text-text-primary focus:outline-none focus:border-primary-container"
              >
                <option value="">Nivel (Todos)</option>
                <option value="1">Principiante (1.0-3.0)</option>
                <option value="2">Intermedio (3.5-4.5)</option>
                <option value="3">Avanzado (5.0-7.0)</option>
              </select>
              <select
                value={filtroEstado}
                onChange={(e) => actualizarFiltroEstado(e.target.value)}
                className="bg-surface px-4 py-3 rounded-lg border border-border-subtle font-body-md text-text-primary focus:outline-none focus:border-primary-container"
              >
                <option value="">Estado de Pago</option>
                <option value="ok">Al Día</option>
                <option value="debt">Con Deuda</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-inline-gutter">
            {clientesFiltrados.length === 0 && <p className="text-center text-text-secondary py-12">No se encontraron clientes.</p>}
            {clientesPagina.map((c, i) => (
              <div
                key={c.id}
                className={
                  "animate-item bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md " +
                  (c.estado === "deuda" ? "hover:border-error/30" : "hover:border-primary-container")
                }
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                    <img alt={c.nombre} className="w-full h-full object-cover" src={c.img} />
                  </div>
                  <div>
                    <h3 className="text-body-lg font-body-lg font-bold text-text-primary">{c.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: "16px" }}>
                        phone
                      </span>
                      <span className="text-label-muted font-label-muted text-text-secondary">{c.telefono}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6 flex-1 justify-start md:justify-around w-full md:w-auto">
                  <div className="text-center">
                    <span className="block text-label-caps font-label-caps text-text-secondary uppercase mb-1">Nivel</span>
                    <span className="bg-surface-container-high px-3 py-1 rounded-full text-body-md font-bold text-text-primary">{c.nivel}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-label-caps font-label-caps text-text-secondary uppercase mb-1">Partidos</span>
                    <span className="text-body-md font-bold text-text-primary">{c.partidos}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-label-caps font-label-caps text-text-secondary uppercase mb-1">Estado</span>
                    {c.estado === "ok" ? (
                      <span className="inline-flex items-center gap-1 text-status-ok bg-status-ok/10 px-3 py-1 rounded-full text-label-caps font-label-caps">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                          check_circle
                        </span>
                        AL DÍA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-status-error bg-status-error/10 px-3 py-1 rounded-full text-label-caps font-label-caps">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                          warning
                        </span>
                        DEUDA {c.deuda}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-border-subtle pt-4 md:pt-0 mt-4 md:mt-0">
                  <button
                    onClick={() => abrirWhatsApp(c.telefono)}
                    className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 active:scale-90 transition-all"
                    title="Contactar por WhatsApp"
                  >
                    <WhatsAppIcon />
                  </button>
                  <button
                    onClick={() => abrirEditar(c)}
                    className="w-10 h-10 rounded-full bg-surface-container-high text-text-primary flex items-center justify-center hover:bg-surface-variant active:scale-90 transition-all"
                    title="Editar Perfil"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                      edit
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="mt-stack-md flex justify-center items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-surface-container-high active:scale-90 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  chevron_left
                </span>
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPagina(n)}
                  className={
                    "w-10 h-10 rounded-full font-body-md font-bold flex items-center justify-center transition-all active:scale-90 " +
                    (n === paginaActual ? "bg-primary-container text-text-primary" : "border border-border-subtle text-text-secondary hover:bg-surface-container-high")
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-surface-container-high active:scale-90 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  chevron_right
                </span>
              </button>
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden flex justify-around items-end pb-6 pt-2 px-6 w-full fixed bottom-0 z-50 rounded-t-xl bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-t border-border-subtle dark:border-outline-variant shadow-lg">
        {mobileNavItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.icon}
              to={item.to}
              className={
                active
                  ? "flex items-center justify-center bg-primary dark:bg-primary-fixed text-on-primary dark:text-on-primary-fixed rounded-full w-12 h-12 mb-2 shadow-md scale-110 transition-transform duration-300 ease-out"
                  : "flex items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant w-12 h-12 hover:text-primary transition-all"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      <Modal open={showNuevo} onClose={() => setShowNuevo(false)} title={editando ? "Editar Cliente" : "Nuevo Cliente"}>
        <form onSubmit={guardarCliente} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Teléfono</label>
            <input
              required
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Nivel</label>
            <input
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              placeholder="Ej: 3.5"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-container text-text-primary font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {editando ? "Guardar Cambios" : "Agregar Cliente"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
