import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import ClubSetupCard from "../components/ClubSetupCard.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { useClubAdmin } from "../hooks/useClubAdmin.js";
import { supabase } from "../lib/supabaseClient.js";

const TIER_STYLE = {
  oro: "bg-rank-gold/10 text-rank-gold border-rank-gold/30",
  plata: "bg-rank-silver/10 text-rank-silver border-rank-silver/30",
  bronce: "bg-rank-bronze/10 text-rank-bronze border-rank-bronze/30",
};

export default function AdminSponsors() {
  const showToast = useToast();
  const { club, loading: loadingClub, crearClub } = useClubAdmin();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNuevo, setShowNuevo] = useState(false);
  const [form, setForm] = useState({ nombre: "", logoUrl: "", tier: "bronce", linkUrl: "" });

  const cargar = useCallback(async () => {
    if (!club) return;
    setLoading(true);
    const { data } = await supabase.from("sponsors").select("*").eq("club_id", club.id).order("created_at", { ascending: false });
    setSponsors(data || []);
    setLoading(false);
  }, [club]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crearSponsor(e) {
    e.preventDefault();
    if (!form.nombre) return;
    const { error } = await supabase.from("sponsors").insert({
      club_id: club.id,
      nombre: form.nombre,
      logo_url: form.logoUrl || null,
      tier: form.tier,
      link_url: form.linkUrl || null,
    });
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Sponsor agregado");
    setShowNuevo(false);
    setForm({ nombre: "", logoUrl: "", tier: "bronce", linkUrl: "" });
    cargar();
  }

  async function toggleActivo(sponsor) {
    await supabase.from("sponsors").update({ activo: !sponsor.activo }).eq("id", sponsor.id);
    cargar();
  }

  async function eliminarSponsor(sponsor) {
    await supabase.from("sponsors").delete().eq("id", sponsor.id);
    showToast("Sponsor eliminado");
    cargar();
  }

  if (!loadingClub && !club) {
    return (
      <AdminLayout title="Sponsors">
        <ClubSetupCard crearClub={crearClub} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Sponsors"
      subtitle="Patrocinadores del club, visibles en los torneos."
      actions={
        club && (
          <button
            onClick={() => setShowNuevo(true)}
            className="bg-primary-fixed text-on-primary-fixed font-body-md font-bold px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo Sponsor
          </button>
        )
      }
    >
      {(loading || loadingClub) && <p className="text-center text-text-secondary py-12">Cargando sponsors...</p>}
      {!loading && !loadingClub && sponsors.length === 0 && <p className="text-center text-text-secondary py-12">Todavía no cargaste sponsors.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-inline-gutter">
        {sponsors.map((s) => (
          <div key={s.id} className={"bg-surface-container-lowest border rounded-xl p-5 flex flex-col gap-3 " + (s.activo ? "border-border-subtle" : "border-border-subtle opacity-50")}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-text-secondary">handshake</span>
                )}
              </div>
              <div>
                <h3 className="text-body-md font-body-md font-bold text-text-primary">{s.nombre}</h3>
                <span className={"inline-block mt-1 px-2 py-0.5 rounded-full border text-label-caps font-label-caps uppercase " + TIER_STYLE[s.tier]}>
                  {s.tier}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-auto pt-2 border-t border-border-subtle">
              <button onClick={() => toggleActivo(s)} className="flex-1 py-2 rounded-full border border-border-subtle text-label-caps font-label-caps hover:bg-surface-container-high transition-colors">
                {s.activo ? "Ocultar" : "Activar"}
              </button>
              <button onClick={() => eliminarSponsor(s)} className="flex-1 py-2 rounded-full text-status-error hover:bg-status-error/10 text-label-caps font-label-caps transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showNuevo} onClose={() => setShowNuevo(false)} title="Nuevo Sponsor">
        <form onSubmit={crearSponsor} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Nombre</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">URL del logo</label>
            <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="input" placeholder="https://..." />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Nivel</label>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className="input">
              <option value="oro">Oro</option>
              <option value="plata">Plata</option>
              <option value="bronce">Bronce</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase">Link (opcional)</label>
            <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="input" placeholder="https://..." />
          </div>
          <button type="submit" className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all">
            Agregar Sponsor
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
