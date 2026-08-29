import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import { useToast } from "../components/Toast.jsx";
import { adminNav, adminMobileNav } from "../config/nav.js";

const transaccionesIniciales = [
  { hora: "14:30", concepto: "Turno 1.5hs - Juan Pérez", cancha: "Cancha 2 (Techada)", metodo: "Mercado Pago", icono: "qr_code_scanner", monto: 12000 },
  { hora: "13:45", concepto: "Bebidas (2x Gatorade, 1x Agua)", cancha: "-", metodo: "Efectivo", icono: "payments", monto: 4500 },
  { hora: "13:00", concepto: "Turno 1hs - María Gómez", cancha: "Cancha 1 (Panorámica)", metodo: "Débito", icono: "credit_card", monto: 9000 },
  { hora: "12:15", concepto: "Seña Turno 18hs - Carlos Ruiz", cancha: "Cancha 3", metodo: "Transferencia", icono: "qr_code_scanner", monto: 5000, pendiente: true },
];

const transaccionesExtra = [
  { hora: "11:40", concepto: "Turno 1hs - Sofía Blanco", cancha: "Cancha 4 (Muro)", metodo: "Efectivo", icono: "payments", monto: 8000 },
  { hora: "10:55", concepto: "Alquiler de paletas x2", cancha: "-", metodo: "Mercado Pago", icono: "qr_code_scanner", monto: 3000 },
  { hora: "10:10", concepto: "Turno 1.5hs - Nicolás Vega", cancha: "Cancha 5 (Muro)", metodo: "Débito", icono: "credit_card", monto: 11000 },
];

const fmt = (n) => "$" + n.toLocaleString("es-AR");

export default function CajaYCobros() {
  const { pathname } = useLocation();
  const showToast = useToast();
  const [transacciones, setTransacciones] = useState(transaccionesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showIngreso, setShowIngreso] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [verMasHistorial, setVerMasHistorial] = useState(false);
  const [form, setForm] = useState({ concepto: "", monto: "", metodo: "Efectivo" });
  const [filtroMetodo, setFiltroMetodo] = useState("Todos");
  const [showFiltro, setShowFiltro] = useState(false);

  const filtradas = useMemo(
    () =>
      transacciones.filter(
        (t) => t.concepto.toLowerCase().includes(busqueda.toLowerCase()) && (filtroMetodo === "Todos" || t.metodo === filtroMetodo)
      ),
    [transacciones, busqueda, filtroMetodo]
  );

  const resumenPorMetodo = useMemo(() => {
    const total = transacciones.reduce((s, t) => s + t.monto, 0);
    const sumaDe = (metodos) => transacciones.filter((t) => metodos.includes(t.metodo)).reduce((s, t) => s + t.monto, 0);
    const porcentaje = (monto) => (total ? Math.round((monto / total) * 100) : 0);
    const efectivo = sumaDe(["Efectivo"]);
    const mercadoPago = sumaDe(["Mercado Pago"]);
    const tarjetas = sumaDe(["Débito", "Transferencia"]);
    return {
      efectivo: { monto: efectivo, pct: porcentaje(efectivo) },
      mercadoPago: { monto: mercadoPago, pct: porcentaje(mercadoPago) },
      tarjetas: { monto: tarjetas, pct: porcentaje(tarjetas) },
    };
  }, [transacciones]);

  function descargarReporte() {
    const header = "Hora,Concepto,Cancha,Metodo,Monto\n";
    const rows = transacciones.map((t) => `${t.hora},"${t.concepto}",${t.cancha},${t.metodo},${t.monto}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-caja.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Reporte descargado");
  }

  function cerrarCaja() {
    setShowCerrar(false);
    showToast("Caja cerrada correctamente");
  }

  function agregarIngreso(e) {
    e.preventDefault();
    const monto = Number(form.monto);
    if (!form.concepto || !monto) return;
    const iconos = { Efectivo: "payments", "Mercado Pago": "qr_code_scanner", Débito: "credit_card", Transferencia: "qr_code_scanner" };
    setTransacciones((prev) => [
      { hora: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }), concepto: form.concepto, cancha: "-", metodo: form.metodo, icono: iconos[form.metodo], monto },
      ...prev,
    ]);
    setForm({ concepto: "", monto: "", metodo: "Efectivo" });
    setShowIngreso(false);
    showToast("Ingreso agregado");
  }

  function verHistorialCompleto() {
    if (verMasHistorial) return;
    setTransacciones((prev) => [...prev, ...transaccionesExtra]);
    setVerMasHistorial(true);
  }

  return (
    <div className="bg-background text-text-primary font-body-md min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden bg-surface flex justify-between items-center px-container-margin py-stack-sm w-full top-0 z-40 relative">
        <div className="flex items-center gap-inline-gutter">
          <img
            alt="Foto de perfil del usuario"
            className="w-10 h-10 rounded-full object-cover border border-border-subtle"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcm2Tj-NZhRKj0saeGx6cGby006npMGHcTEqwgUComVk0XfaiB4IiJpLtgBghhh8HXm0yrBZumLOZRokZ6XrqaGce-0SRAsMsYVZpXyuvb4H863f81IHMJTVK42TxLm0zDcGNmlewgxpJkkOtIqZKjr8C6yxoC1LyHc9SWetqzGbKaC3WA66if8nz2OOTP5psue5KBkWvOLS04ne-PXiYjr6VWFckHKxNYAugqWf1g1QAsUEzGxNQ"
          />
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Padel Pro</h1>
        </div>
        <button
          onClick={() => setShowNotifs(true)}
          className="text-primary hover:bg-surface-container-high transition-colors p-2 rounded-full active:opacity-80 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <nav className="hidden md:flex flex-col w-64 bg-surface border-r border-border-subtle h-screen sticky top-0 py-stack-md px-container-margin">
        <div className="flex items-center gap-3 mb-stack-lg px-2">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_tennis
            </span>
          </div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary tracking-tight">Padel Pro</h1>
        </div>
        <div className="flex flex-col gap-2 flex-grow">
          {adminNav.map((item) => {
            const active = item.to === pathname;
            const classes =
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95 " +
              (active ? "bg-primary-container text-text-primary font-bold" : "text-text-secondary hover:bg-surface-container");
            const content = (
              <>
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span className="font-body-md text-body-md">{item.label}</span>
              </>
            );
            if (item.action === "settings") {
              return (
                <button key={item.key} onClick={() => setShowSettings(true)} className={classes + " w-full text-left"}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={item.key} to={item.to} className={classes}>
                {content}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex items-center gap-3 px-4 py-3 border-t border-border-subtle pt-4">
          <img
            alt="Foto de perfil del usuario"
            className="w-10 h-10 rounded-full object-cover border border-border-subtle"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDst4I8x_Eax7n8gmPcCCwJpiPq1DZE_WYLfdOd-MVqZUW9o3Jcs5oV7qXd149mwL93U_tKjCm9Jthw75sjdsnRiQQJkhmiDeynHNakzTCmfh9eWOlJzK3m0JXV8mvM89Y8_lNGM1jxuO_CAxdDzZXYqrIQs-bTw4BXU2ljZqL7-Q6h19fBZxgHkZgj_oeuqBUE4HE7RmV3aidAcKT6Apu8Vv27FjGupROFkrOr425Kf9hVdHRTxZU"
          />
          <div>
            <p className="font-body-md text-body-md font-semibold text-text-primary">Admin User</p>
            <p className="font-label-muted text-label-muted text-text-secondary">Club Central</p>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col min-w-0 pb-24 md:pb-0">
        <div className="px-container-margin py-stack-md md:py-stack-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-headline-xl font-headline-xl font-extrabold text-text-primary tracking-tight">Caja y Cobros</h2>
            <p className="text-body-md font-body-md text-text-secondary mt-1">Resumen diario y gestión de pagos.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={descargarReporte}
              className="flex-1 md:flex-none px-6 py-3 bg-ink-fixed text-on-ink-fixed rounded-full font-label-caps text-label-caps tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Reporte
            </button>
            <button
              onClick={() => setShowCerrar(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-primary-container text-text-primary rounded-full font-label-caps text-label-caps tracking-wider uppercase font-bold flex items-center justify-center gap-2 hover:bg-inverse-primary active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Cerrar Caja
            </button>
          </div>
        </div>

        <div className="px-container-margin flex flex-col gap-stack-lg max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="animate-item bg-surface-container-lowest p-6 rounded-xl border border-border-subtle flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
              </div>
              <span className="text-label-caps font-label-caps text-text-secondary uppercase tracking-widest mb-2">Ingresos del Día</span>
              <h3 className="text-headline-xl font-headline-xl font-extrabold text-text-primary">
                {fmt(transacciones.reduce((s, t) => s + t.monto, 0))}
              </h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-surface-container rounded text-label-muted font-label-muted text-text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +12% vs ayer
                </span>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="animate-item bg-surface-container-low p-5 rounded-xl border border-border-subtle flex flex-col justify-between" style={{ animationDelay: "60ms" }}>
                <div className="flex justify-between items-start">
                  <span className="text-label-caps font-label-caps text-text-secondary uppercase">Efectivo</span>
                  <span className="material-symbols-outlined text-text-secondary">payments</span>
                </div>
                <div className="mt-4">
                  <p className="text-headline-lg font-headline-lg font-bold text-text-primary">{fmt(resumenPorMetodo.efectivo.monto)}</p>
                  <p className="text-label-muted font-label-muted text-text-secondary mt-1">{resumenPorMetodo.efectivo.pct}% del total</p>
                </div>
              </div>
              <div className="animate-item bg-surface-container-low p-5 rounded-xl border border-border-subtle flex flex-col justify-between" style={{ animationDelay: "110ms" }}>
                <div className="flex justify-between items-start">
                  <span className="text-label-caps font-label-caps text-text-secondary uppercase">Mercado Pago</span>
                  <span className="material-symbols-outlined text-text-secondary">qr_code_scanner</span>
                </div>
                <div className="mt-4">
                  <p className="text-headline-lg font-headline-lg font-bold text-text-primary">{fmt(resumenPorMetodo.mercadoPago.monto)}</p>
                  <p className="text-label-muted font-label-muted text-text-secondary mt-1">{resumenPorMetodo.mercadoPago.pct}% del total</p>
                </div>
              </div>
              <div className="animate-item bg-surface-container-low p-5 rounded-xl border border-border-subtle flex flex-col justify-between" style={{ animationDelay: "160ms" }}>
                <div className="flex justify-between items-start">
                  <span className="text-label-caps font-label-caps text-text-secondary uppercase">Tarjetas</span>
                  <span className="material-symbols-outlined text-text-secondary">credit_card</span>
                </div>
                <div className="mt-4">
                  <p className="text-headline-lg font-headline-lg font-bold text-text-primary">{fmt(resumenPorMetodo.tarjetas.monto)}</p>
                  <p className="text-label-muted font-label-muted text-text-secondary mt-1">{resumenPorMetodo.tarjetas.pct}% del total</p>
                </div>
              </div>
              <button
                onClick={() => setShowIngreso(true)}
                className="animate-item bg-primary-container p-5 rounded-xl border border-primary-container flex flex-col justify-between items-center text-center hover:opacity-90 active:scale-95 transition-all"
                style={{ animationDelay: "210ms" }}
              >
                <span className="material-symbols-outlined text-text-primary text-3xl mb-2">add_circle</span>
                <span className="text-label-caps font-label-caps text-text-primary uppercase font-bold">Nuevo Ingreso Manual</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface gap-4 flex-wrap">
              <h3 className="text-body-lg font-body-lg font-bold text-text-primary">Últimas Transacciones</h3>
              <div className="flex items-center gap-2">
                {showSearch && (
                  <input
                    autoFocus
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar concepto..."
                    className="animate-slide-in-right px-3 py-2 rounded-lg border border-border-subtle bg-surface text-body-md focus:outline-none focus:border-primary-container w-40 sm:w-56"
                  />
                )}
                <button
                  onClick={() => setShowFiltro(true)}
                  className={
                    "p-2 rounded-full transition-colors active:scale-90 relative " +
                    (filtroMetodo !== "Todos" ? "bg-primary-container text-text-primary" : "hover:bg-surface-container text-text-secondary")
                  }
                >
                  <span className="material-symbols-outlined">filter_list</span>
                  {filtroMetodo !== "Todos" && <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>}
                </button>
                <button
                  onClick={() => setShowSearch((v) => !v)}
                  className="p-2 rounded-full hover:bg-surface-container transition-colors text-text-secondary active:scale-90"
                >
                  <span className="material-symbols-outlined">{showSearch ? "close" : "search"}</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-container-low">
                    <th className="p-4 text-label-caps font-label-caps text-text-secondary uppercase font-semibold">Hora</th>
                    <th className="p-4 text-label-caps font-label-caps text-text-secondary uppercase font-semibold">Concepto</th>
                    <th className="p-4 text-label-caps font-label-caps text-text-secondary uppercase font-semibold hidden sm:table-cell">Cancha</th>
                    <th className="p-4 text-label-caps font-label-caps text-text-secondary uppercase font-semibold hidden md:table-cell">Método</th>
                    <th className="p-4 text-label-caps font-label-caps text-text-secondary uppercase font-semibold text-right">Monto</th>
                    <th className="p-4 text-label-caps font-label-caps text-text-secondary uppercase font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-body-md font-body-md">
                  {filtradas.map((t, i) => (
                    <tr key={i} className={"animate-item hover:bg-surface-container-low transition-colors " + (i < filtradas.length - 1 ? "border-b border-border-subtle" : "")}>
                      <td className="p-4 text-text-secondary whitespace-nowrap">{t.hora}</td>
                      <td className="p-4 font-semibold text-text-primary">{t.concepto}</td>
                      <td className="p-4 text-text-secondary hidden sm:table-cell">{t.cancha}</td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-label-muted font-label-muted text-text-secondary bg-surface-container px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-[14px]">{t.icono}</span>
                          {t.metodo}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-text-primary whitespace-nowrap">{fmt(t.monto)}</td>
                      <td className="p-4 text-center">
                        <span className={"inline-block w-2 h-2 rounded-full " + (t.pendiente ? "bg-status-pending" : "bg-status-ok")}></span>
                      </td>
                    </tr>
                  ))}
                  {filtradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-secondary">
                        No se encontraron transacciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border-subtle text-center">
              <button
                onClick={verHistorialCompleto}
                className="text-label-caps font-label-caps text-text-secondary uppercase tracking-widest hover:text-text-primary active:scale-95 transition-all"
              >
                {verMasHistorial ? "No hay más transacciones" : "Ver historial completo"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md fixed bottom-0 w-full z-50 rounded-t-xl border-t border-border-subtle dark:border-outline-variant shadow-lg flex justify-around items-end pb-6 pt-2 px-6">
        {adminMobileNav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.key}
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

      <Modal open={showFiltro} onClose={() => setShowFiltro(false)} title="Filtrar por método">
        <div className="flex flex-col gap-1">
          {["Todos", "Efectivo", "Mercado Pago", "Débito", "Transferencia"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setFiltroMetodo(m);
                setShowFiltro(false);
              }}
              className={
                "flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left " +
                (filtroMetodo === m ? "bg-primary-container text-text-primary font-bold" : "hover:bg-surface-container-low text-text-primary")
              }
            >
              {m}
              {filtroMetodo === m && <span className="material-symbols-outlined text-[18px]">check</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showIngreso} onClose={() => setShowIngreso(false)} title="Nuevo Ingreso Manual">
        <form onSubmit={agregarIngreso} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Concepto</label>
            <input
              required
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              placeholder="Ej: Venta de bebidas"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Monto</label>
            <input
              required
              type="number"
              min="1"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Método</label>
            <select
              value={form.metodo}
              onChange={(e) => setForm({ ...form, metodo: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container"
            >
              <option>Efectivo</option>
              <option>Mercado Pago</option>
              <option>Débito</option>
              <option>Transferencia</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-container text-text-primary font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Agregar Ingreso
          </button>
        </form>
      </Modal>

      <Modal
        open={showCerrar}
        onClose={() => setShowCerrar(false)}
        title="Cerrar Caja"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowCerrar(false)}
              className="flex-1 py-3 rounded-full border border-border-subtle text-text-primary hover:bg-surface-container-low active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={cerrarCaja}
              className="flex-1 py-3 rounded-full bg-primary-container text-text-primary font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Confirmar
            </button>
          </div>
        }
      >
        <p className="text-body-md font-body-md text-text-secondary">
          Vas a cerrar la caja del día con un total de <strong className="text-text-primary">{fmt(transacciones.reduce((s, t) => s + t.monto, 0))}</strong>. Esta acción no se puede
          deshacer.
        </p>
      </Modal>
    </div>
  );
}
