import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import ClubSetupCard from "../components/ClubSetupCard.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { useClubAdmin } from "../hooks/useClubAdmin.js";
import { supabase } from "../lib/supabaseClient.js";
import { fmtFecha } from "../lib/format.js";

const TIPO_LABEL = {
  advertencia: "Advertencia",
  suspension_temporal: "Suspensión temporal",
  suspension_permanente: "Suspensión permanente",
};
const TIPO_STYLE = {
  advertencia: "bg-status-pending/10 text-status-pending",
  suspension_temporal: "bg-status-error/10 text-status-error",
  suspension_permanente: "bg-status-error/20 text-status-error",
};

export default function AdminSanciones() {
  const showToast = useToast();
  const { club, loading: loadingClub, crearClub } = useClubAdmin();
  const [tab, setTab] = useState("sanciones");
  const [sanciones, setSanciones] = useState([]);
  const [reglamento, setReglamento] = useState(null);
  const [contenidoReglamento, setContenidoReglamento] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNueva, setShowNueva] = useState(false);
  const [busquedaJugador, setBusquedaJugador] = useState("");
  const [resultados, setResultados] = useState([]);
  const [form, setForm] = useState({ profileId: "", nombreElegido: "", motivo: "", tipo: "advertencia", fechaFin: "" });

  const cargar = useCallback(async () => {
    if (!club) return;
    setLoading(true);
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from("sanciones").select("*, jugador:profiles!sanciones_profile_id_fkey(nombre)").eq("club_id", club.id).order("created_at", { ascending: false }),
      supabase.from("reglamentos").select("*").eq("club_id", club.id).is("torneo_id", null).maybeSingle(),
    ]);
    setSanciones(s || []);
    setReglamento(r || null);
    setContenidoReglamento(r?.contenido || "");
    setLoading(false);
  }, [club]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function buscarJugador(texto) {
    setBusquedaJugador(texto);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    const { data } = await supabase.from("profiles").select("id, nombre, telefono").ilike("nombre", `%${texto}%`).limit(6);
    setResultados(data || []);
  }

  async function crearSancion(e) {
    e.preventDefault();
    if (!form.profileId || !form.motivo) return;
    const { error } = await supabase.from("sanciones").insert({
      club_id: club.id,
      profile_id: form.profileId,
      motivo: form.motivo,
      tipo: form.tipo,
      fecha_fin: form.fechaFin || null,
    });
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Sanción aplicada");
    setShowNueva(false);
    setForm({ profileId: "", nombreElegido: "", motivo: "", tipo: "advertencia", fechaFin: "" });
    setBusquedaJugador("");
    setResultados([]);
    cargar();
  }

  async function revocarSancion(sancion) {
    await supabase.from("sanciones").update({ visible_jugador: false, fecha_fin: new Date().toISOString().slice(0, 10) }).eq("id", sancion.id);
    showToast("Sanción revocada");
    cargar();
  }

  async function guardarReglamento(e) {
    e.preventDefault();
    if (reglamento) {
      await supabase.from("reglamentos").update({ contenido: contenidoReglamento, updated_at: new Date().toISOString() }).eq("id", reglamento.id);
    } else {
      await supabase.from("reglamentos").insert({ club_id: club.id, titulo: "Reglamento del club", contenido: contenidoReglamento });
    }
    showToast("Reglamento guardado");
    cargar();
  }

  if (!loadingClub && !club) {
    return (
      <AdminLayout title="Sanciones">
        <ClubSetupCard crearClub={crearClub} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sanciones y Reglamento" subtitle="Gestioná sanciones a jugadores y publicá las reglas del club.">
      <div className="flex gap-2 mb-stack-md">
        <button
          onClick={() => setTab("sanciones")}
          className={"px-5 py-2 rounded-full text-label-caps font-label-caps transition-all " + (tab === "sanciones" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary hover:bg-surface-container-high")}
        >
          Sanciones
        </button>
        <button
          onClick={() => setTab("reglamento")}
          className={"px-5 py-2 rounded-full text-label-caps font-label-caps transition-all " + (tab === "reglamento" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary hover:bg-surface-container-high")}
        >
          Reglamento
        </button>
      </div>

      {(loading || loadingClub) && <p className="text-center text-text-secondary py-12">Cargando...</p>}

      {!loading && tab === "sanciones" && (
        <div className="flex flex-col gap-stack-md">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNueva(true)}
              className="bg-primary-fixed text-on-primary-fixed font-body-md font-bold px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">gavel</span>
              Nueva Sanción
            </button>
          </div>
          {sanciones.length === 0 && <p className="text-center text-text-secondary py-8">No hay sanciones cargadas.</p>}
          {sanciones.map((s) => (
            <div key={s.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className={"inline-block px-3 py-1 rounded-full text-label-caps font-label-caps uppercase mb-2 " + TIPO_STYLE[s.tipo]}>{TIPO_LABEL[s.tipo]}</span>
                <h3 className="text-body-md font-body-md font-bold text-text-primary">{s.jugador?.nombre || "Jugador"}</h3>
                <p className="text-label-muted font-label-muted text-text-secondary">
                  {s.motivo} — desde {fmtFecha(s.fecha_inicio)}
                  {s.fecha_fin ? ` hasta ${fmtFecha(s.fecha_fin)}` : ""}
                </p>
              </div>
              {s.visible_jugador && (
                <button onClick={() => revocarSancion(s)} className="px-4 py-2 rounded-full border border-border-subtle text-label-caps font-label-caps hover:bg-surface-container-high transition-colors">
                  Revocar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "reglamento" && (
        <form onSubmit={guardarReglamento} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col gap-3">
          <label className="text-label-caps font-label-caps text-text-primary uppercase">Reglamento del club</label>
          <textarea
            value={contenidoReglamento}
            onChange={(e) => setContenidoReglamento(e.target.value)}
            rows={12}
            className="input font-body-md resize-y"
            placeholder="Escribí acá las reglas del club (horarios, código de conducta, política de cancelaciones, etc.)"
          />
          <button type="submit" className="self-end px-6 py-3 bg-primary-fixed text-on-primary-fixed font-body-md font-bold rounded-full hover:opacity-90 active:scale-95 transition-all">
            Guardar Reglamento
          </button>
        </form>
      )}

      <Modal open={showNueva} onClose={() => setShowNueva(false)} title="Nueva Sanción">
        <form onSubmit={crearSancion} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 relative">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Jugador</label>
            <input
              value={form.nombreElegido || busquedaJugador}
              onChange={(e) => {
                setForm({ ...form, profileId: "", nombreElegido: "" });
                buscarJugador(e.target.value);
              }}
              placeholder="Buscar por nombre..."
              className="input"
            />
            {resultados.length > 0 && !form.profileId && (
              <div className="absolute top-full mt-1 w-full bg-surface border border-border-subtle rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {resultados.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setForm({ ...form, profileId: r.id, nombreElegido: r.nombre || r.telefono || "Jugador" });
                      setResultados([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-container-low"
                  >
                    {r.nombre || r.telefono || "Sin nombre"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Motivo</label>
            <input required value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="input">
              <option value="advertencia">Advertencia</option>
              <option value="suspension_temporal">Suspensión temporal</option>
              <option value="suspension_permanente">Suspensión permanente</option>
            </select>
          </div>
          {form.tipo === "suspension_temporal" && (
            <div className="flex flex-col gap-1">
              <label className="text-label-caps font-label-caps text-text-primary uppercase">Hasta</label>
              <input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} className="input" />
            </div>
          )}
          <button
            type="submit"
            disabled={!form.profileId}
            className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Aplicar Sanción
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
