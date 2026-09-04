import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import ClubSetupCard from "../components/ClubSetupCard.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { useClubAdmin } from "../hooks/useClubAdmin.js";
import { supabase } from "../lib/supabaseClient.js";
import { fmt, fmtFecha } from "../lib/format.js";
import { finalizarTorneoCategoria, evaluarAscensosDescensos } from "../lib/ranking.js";

const ESTADO_STYLE = {
  borrador: "bg-surface-container-high text-text-secondary",
  abierto: "bg-status-ok/10 text-status-ok",
  en_curso: "bg-primary-container text-text-primary",
  finalizado: "bg-surface-container-high text-text-secondary",
  cancelado: "bg-status-error/10 text-status-error",
};

const ESTADO_LABEL = {
  borrador: "Borrador",
  abierto: "Inscripciones abiertas",
  en_curso: "En curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const SIGUIENTE_ESTADO = { borrador: "abierto", abierto: "en_curso", en_curso: "finalizado" };
const SIGUIENTE_LABEL = { borrador: "Abrir inscripciones", abierto: "Iniciar torneo", en_curso: "Finalizar torneo" };

export default function AdminTorneos() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { club, loading: loadingClub, crearClub } = useClubAdmin();

  const [torneos, setTorneos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNuevo, setShowNuevo] = useState(false);
  const [categoriaTarget, setCategoriaTarget] = useState(null);
  const [sedeCanchaTarget, setSedeCanchaTarget] = useState(null);
  const [canchaForm, setCanchaForm] = useState({ nombre: "", tipo: "Cristal" });
  const [torneoEditando, setTorneoEditando] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", sedeId: "", fechaInicio: "", fechaCierre: "", precio: "", comision: "8", premios: "" });
  const [form, setForm] = useState({
    nombre: "",
    sedeId: "",
    fechaInicio: "",
    fechaCierre: "",
    precio: "",
    comision: "8",
    cupoParejas: "16",
    premios: "",
    categoriaId: "",
    formato: "zonas_y_llave",
  });
  const [catForm, setCatForm] = useState({ categoriaId: "", formato: "zonas_y_llave", cupoParejas: "16" });

  const cargarTodo = useCallback(async () => {
    if (!club) return;
    setLoading(true);
    const [{ data: t }, { data: s }, { data: c }] = await Promise.all([
      supabase
        .from("torneos")
        .select("*, sede:sedes(nombre), torneo_categorias(id, formato, cupo_parejas, categoria:categorias(id, nombre))")
        .eq("club_id", club.id)
        .order("fecha_inicio", { ascending: false }),
      supabase.from("sedes").select("*, canchas(id, nombre, tipo, activa)").eq("club_id", club.id),
      supabase.from("categorias").select("*").eq("club_id", club.id).order("orden"),
    ]);
    setTorneos(t || []);
    setSedes(s || []);
    setCategorias(c || []);
    setLoading(false);
  }, [club]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  async function crearTorneo(e) {
    e.preventDefault();
    if (!form.nombre || !form.sedeId || !form.fechaInicio || !form.categoriaId) return;
    const { data: torneo, error } = await supabase
      .from("torneos")
      .insert({
        club_id: club.id,
        sede_id: form.sedeId,
        nombre: form.nombre,
        fecha_inicio: form.fechaInicio,
        fecha_cierre_inscripcion: form.fechaCierre || null,
        precio_inscripcion: Number(form.precio) || 0,
        comision_pct: Number(form.comision) || 8,
        cupo_parejas: Number(form.cupoParejas) || null,
        premios: form.premios,
        estado: "abierto",
      })
      .select()
      .single();
    if (error) {
      showToast(error.message, "error");
      return;
    }
    await supabase.from("torneo_categorias").insert({
      torneo_id: torneo.id,
      categoria_id: form.categoriaId,
      formato: form.formato,
      cupo_parejas: Number(form.cupoParejas) || null,
    });
    showToast("Torneo creado con inscripciones abiertas");
    setShowNuevo(false);
    setForm({ nombre: "", sedeId: "", fechaInicio: "", fechaCierre: "", precio: "", comision: "8", cupoParejas: "16", premios: "", categoriaId: "", formato: "zonas_y_llave" });
    cargarTodo();
  }

  function abrirEdicion(torneo) {
    setEditForm({
      nombre: torneo.nombre || "",
      sedeId: torneo.sede_id || "",
      fechaInicio: torneo.fecha_inicio ? torneo.fecha_inicio.slice(0, 10) : "",
      fechaCierre: torneo.fecha_cierre_inscripcion ? torneo.fecha_cierre_inscripcion.slice(0, 10) : "",
      precio: torneo.precio_inscripcion ?? "",
      comision: torneo.comision_pct ?? "8",
      premios: torneo.premios || "",
    });
    setTorneoEditando(torneo.id);
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!editForm.nombre || !editForm.sedeId || !editForm.fechaInicio) return;
    const { error } = await supabase
      .from("torneos")
      .update({
        nombre: editForm.nombre,
        sede_id: editForm.sedeId,
        fecha_inicio: editForm.fechaInicio,
        fecha_cierre_inscripcion: editForm.fechaCierre || null,
        precio_inscripcion: Number(editForm.precio) || 0,
        comision_pct: Number(editForm.comision) || 8,
        premios: editForm.premios,
      })
      .eq("id", torneoEditando);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Torneo actualizado");
    setTorneoEditando(null);
    cargarTodo();
  }

  async function agregarCategoria(e) {
    e.preventDefault();
    if (!catForm.categoriaId || !categoriaTarget) return;
    const { error } = await supabase.from("torneo_categorias").insert({
      torneo_id: categoriaTarget,
      categoria_id: catForm.categoriaId,
      formato: catForm.formato,
      cupo_parejas: Number(catForm.cupoParejas) || null,
    });
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Categoría agregada al torneo");
    setCategoriaTarget(null);
    cargarTodo();
  }

  async function avanzarEstado(torneo) {
    const nuevoEstado = SIGUIENTE_ESTADO[torneo.estado];
    if (!nuevoEstado) return;
    const { error } = await supabase.from("torneos").update({ estado: nuevoEstado }).eq("id", torneo.id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    if (nuevoEstado === "finalizado") {
      for (const tc of torneo.torneo_categorias || []) {
        try {
          const categoriaId = await finalizarTorneoCategoria(tc.id, torneo.id);
          if (categoriaId) await evaluarAscensosDescensos(categoriaId, club.id);
        } catch (err) {
          console.error(err);
        }
      }
      showToast("Torneo finalizado — ranking actualizado");
    } else {
      showToast(`Estado actualizado: ${ESTADO_LABEL[nuevoEstado]}`);
    }
    cargarTodo();
  }

  async function agregarCancha(e) {
    e.preventDefault();
    if (!canchaForm.nombre || !sedeCanchaTarget) return;
    const { error } = await supabase.from("canchas").insert({ sede_id: sedeCanchaTarget, nombre: canchaForm.nombre, tipo: canchaForm.tipo });
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Cancha agregada");
    setCanchaForm({ nombre: "", tipo: "Cristal" });
    setSedeCanchaTarget(null);
    cargarTodo();
  }

  async function quitarCancha(canchaId) {
    await supabase.from("canchas").update({ activa: false }).eq("id", canchaId);
    showToast("Cancha eliminada");
    cargarTodo();
  }

  async function cancelarTorneo(torneo) {
    const { error } = await supabase.from("torneos").update({ estado: "cancelado" }).eq("id", torneo.id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Torneo cancelado", "error");
    cargarTodo();
  }

  if (!loadingClub && !club) {
    return (
      <AdminLayout title="Torneos">
        <ClubSetupCard crearClub={crearClub} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Torneos"
      subtitle="Creá y gestioná los torneos de tu club."
      actions={
        club && (
          <button
            onClick={() => setShowNuevo(true)}
            className="bg-primary-fixed text-on-primary-fixed font-body-md font-bold px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo Torneo
          </button>
        )
      }
    >
      {!loading && !loadingClub && sedes.length > 0 && (
        <div className="mb-stack-lg flex flex-col gap-3">
          <h3 className="text-body-lg font-body-lg font-bold text-text-primary">Sedes y Canchas</h3>
          {sedes.map((s) => (
            <div key={s.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
              <p className="text-body-md font-body-md font-bold text-text-primary">{s.nombre}</p>
              <div className="flex flex-wrap gap-2">
                {(s.canchas || [])
                  .filter((c) => c.activa)
                  .map((c) => (
                    <span key={c.id} className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-label-caps font-label-caps text-text-primary">
                      {c.nombre}
                      <button onClick={() => quitarCancha(c.id)} className="text-text-secondary hover:text-status-error transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                {!(s.canchas || []).some((c) => c.activa) && (
                  <span className="text-label-muted font-label-muted text-status-pending">Sin canchas cargadas — el fixture no va a poder asignar cancha.</span>
                )}
                <button
                  onClick={() => setSedeCanchaTarget(s.id)}
                  className="px-3 py-1 rounded-full border border-dashed border-border-subtle text-label-caps font-label-caps text-text-secondary hover:bg-surface-container-high transition-colors"
                >
                  + Cancha
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(loading || loadingClub) && <p className="text-center text-text-secondary py-12">Cargando torneos...</p>}
      {!loading && !loadingClub && torneos.length === 0 && (
        <p className="text-center text-text-secondary py-12">Todavía no creaste ningún torneo.</p>
      )}

      <div className="grid grid-cols-1 gap-inline-gutter">
        {torneos.map((t) => (
          <div key={t.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <span className={"inline-block px-3 py-1 rounded-full text-label-caps font-label-caps uppercase mb-2 " + ESTADO_STYLE[t.estado]}>
                  {ESTADO_LABEL[t.estado]}
                </span>
                <h3 className="text-body-lg font-body-lg font-bold text-text-primary">{t.nombre}</h3>
                <p className="text-label-muted font-label-muted text-text-secondary mt-1">
                  {t.sede?.nombre} • Desde {fmtFecha(t.fecha_inicio)} • {fmt(t.precio_inscripcion)} por jugador
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => abrirEdicion(t)}
                  className="px-4 py-2 rounded-full border border-border-subtle text-text-primary hover:bg-surface-container-high active:scale-95 transition-all text-label-caps font-label-caps flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar
                </button>
                <button
                  onClick={() => navigate(`/torneos/${t.id}/fixture`)}
                  className="px-4 py-2 rounded-full border border-border-subtle text-text-primary hover:bg-surface-container-high active:scale-95 transition-all text-label-caps font-label-caps"
                >
                  Ver fixture
                </button>
                {SIGUIENTE_ESTADO[t.estado] && (
                  <button
                    onClick={() => avanzarEstado(t)}
                    className="px-4 py-2 rounded-full bg-primary-container text-text-primary font-bold hover:opacity-90 active:scale-95 transition-all text-label-caps font-label-caps"
                  >
                    {SIGUIENTE_LABEL[t.estado]}
                  </button>
                )}
                {t.estado !== "cancelado" && t.estado !== "finalizado" && (
                  <button
                    onClick={() => cancelarTorneo(t)}
                    className="px-4 py-2 rounded-full text-status-error hover:bg-status-error/10 active:scale-95 transition-all text-label-caps font-label-caps"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(t.torneo_categorias || []).map((tc) => (
                <span key={tc.id} className="px-3 py-1 rounded-full bg-surface-container-high text-label-caps font-label-caps text-text-primary">
                  {tc.categoria?.nombre} · {tc.cupo_parejas || "?"} parejas
                </span>
              ))}
              <button
                onClick={() => setCategoriaTarget(t.id)}
                className="px-3 py-1 rounded-full border border-dashed border-border-subtle text-label-caps font-label-caps text-text-secondary hover:bg-surface-container-high transition-colors"
              >
                + Categoría
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showNuevo} onClose={() => setShowNuevo(false)} title="Nuevo Torneo">
        <form onSubmit={crearTorneo} className="flex flex-col gap-3">
          <Campo label="Nombre">
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" placeholder="Ej: Apertura 2026" />
          </Campo>
          <Campo label="Sede">
            <select required value={form.sedeId} onChange={(e) => setForm({ ...form, sedeId: e.target.value })} className="input">
              <option value="">Elegir sede</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha inicio">
              <input required type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className="input" />
            </Campo>
            <Campo label="Cierre inscripción">
              <input type="date" value={form.fechaCierre} onChange={(e) => setForm({ ...form, fechaCierre: e.target.value })} className="input" />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Precio x jugador">
              <input type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="input" placeholder="0" />
            </Campo>
            <Campo label="Comisión %">
              <input type="number" min="5" max="10" value={form.comision} onChange={(e) => setForm({ ...form, comision: e.target.value })} className="input" />
            </Campo>
          </div>
          <Campo label="Premios">
            <input value={form.premios} onChange={(e) => setForm({ ...form, premios: e.target.value })} className="input" placeholder="Ej: Trofeo + $50.000" />
          </Campo>

          <div className="border-t border-border-subtle pt-3 mt-1">
            <p className="text-label-caps font-label-caps text-text-secondary uppercase mb-2">Primera categoría</p>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Categoría">
                <select required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} className="input">
                  <option value="">Elegir</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Cupo parejas">
                <input type="number" min="2" value={form.cupoParejas} onChange={(e) => setForm({ ...form, cupoParejas: e.target.value })} className="input" />
              </Campo>
            </div>
            <Campo label="Formato">
              <select value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })} className="input">
                <option value="zonas_y_llave">Zonas + Llave</option>
                <option value="solo_llave">Solo llave (eliminación directa)</option>
                <option value="round_robin">Round robin</option>
              </select>
            </Campo>
          </div>

          <button type="submit" className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Crear Torneo
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(torneoEditando)} onClose={() => setTorneoEditando(null)} title="Editar Torneo">
        <form onSubmit={guardarEdicion} className="flex flex-col gap-3">
          <Campo label="Nombre">
            <input required value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} className="input" />
          </Campo>
          <Campo label="Sede / Cancha">
            <select required value={editForm.sedeId} onChange={(e) => setEditForm({ ...editForm, sedeId: e.target.value })} className="input">
              <option value="">Elegir sede</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha inicio">
              <input required type="date" value={editForm.fechaInicio} onChange={(e) => setEditForm({ ...editForm, fechaInicio: e.target.value })} className="input" />
            </Campo>
            <Campo label="Cierre inscripción">
              <input type="date" value={editForm.fechaCierre} onChange={(e) => setEditForm({ ...editForm, fechaCierre: e.target.value })} className="input" />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Precio x jugador">
              <input type="number" min="0" value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} className="input" />
            </Campo>
            <Campo label="Comisión %">
              <input type="number" min="5" max="10" value={editForm.comision} onChange={(e) => setEditForm({ ...editForm, comision: e.target.value })} className="input" />
            </Campo>
          </div>
          <Campo label="Premios">
            <input value={editForm.premios} onChange={(e) => setEditForm({ ...editForm, premios: e.target.value })} className="input" placeholder="Ej: Trofeo + $50.000" />
          </Campo>
          <button type="submit" className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Guardar cambios
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(categoriaTarget)} onClose={() => setCategoriaTarget(null)} title="Agregar categoría al torneo">
        <form onSubmit={agregarCategoria} className="flex flex-col gap-3">
          <Campo label="Categoría">
            <select required value={catForm.categoriaId} onChange={(e) => setCatForm({ ...catForm, categoriaId: e.target.value })} className="input">
              <option value="">Elegir</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Cupo parejas">
              <input type="number" min="2" value={catForm.cupoParejas} onChange={(e) => setCatForm({ ...catForm, cupoParejas: e.target.value })} className="input" />
            </Campo>
            <Campo label="Formato">
              <select value={catForm.formato} onChange={(e) => setCatForm({ ...catForm, formato: e.target.value })} className="input">
                <option value="zonas_y_llave">Zonas + Llave</option>
                <option value="solo_llave">Solo llave</option>
                <option value="round_robin">Round robin</option>
              </select>
            </Campo>
          </div>
          <button type="submit" className="w-full bg-primary-container text-text-primary font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Agregar
          </button>
        </form>
      </Modal>
      <Modal open={Boolean(sedeCanchaTarget)} onClose={() => setSedeCanchaTarget(null)} title="Nueva cancha">
        <form onSubmit={agregarCancha} className="flex flex-col gap-3">
          <Campo label="Nombre">
            <input required value={canchaForm.nombre} onChange={(e) => setCanchaForm({ ...canchaForm, nombre: e.target.value })} className="input" placeholder="Ej: Cancha 5" />
          </Campo>
          <Campo label="Tipo">
            <select value={canchaForm.tipo} onChange={(e) => setCanchaForm({ ...canchaForm, tipo: e.target.value })} className="input">
              <option value="Cristal">Cristal</option>
              <option value="Muro">Muro</option>
            </select>
          </Campo>
          <button type="submit" className="w-full bg-primary-container text-text-primary font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Agregar Cancha
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}

function Campo({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-label-caps font-label-caps text-text-primary uppercase">{label}</label>
      {children}
    </div>
  );
}
