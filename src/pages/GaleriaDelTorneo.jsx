import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function GaleriaDelTorneo() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [torneo, setTorneo] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [{ data: t }, { data: f }] = await Promise.all([
      supabase.from("torneos").select("id, nombre").eq("id", torneoId).single(),
      supabase.from("fotos_torneo").select("*, autor:profiles(nombre)").eq("torneo_id", torneoId).order("created_at", { ascending: false }),
    ]);
    setTorneo(t);
    setFotos(f || []);
    setLoading(false);
  }, [torneoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function subirFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const path = `${torneoId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("torneo-fotos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from("torneo-fotos").getPublicUrl(path);
      const { error: insertError } = await supabase.from("fotos_torneo").insert({ torneo_id: torneoId, uploaded_by: user.id, url: pub.publicUrl });
      if (insertError) throw insertError;
      showToast("¡Foto subida!");
      cargar();
    } catch (err) {
      showToast(err.message || "No se pudo subir la foto (¿estás inscripto en este torneo?)", "error");
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface flex items-center justify-between gap-4 px-container-margin py-stack-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface truncate">{torneo?.nombre || "Galería"}</h1>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={subiendo}
          className="px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
          {subiendo ? "Subiendo..." : "Subir foto"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={subirFoto} className="hidden" />
      </header>

      <main className="px-container-margin max-w-6xl mx-auto mt-4">
        {loading && <p className="text-center text-text-secondary py-16">Cargando galería...</p>}
        {!loading && fotos.length === 0 && (
          <p className="text-center text-text-secondary py-16">Todavía no hay fotos de este torneo. ¡Subí la primera!</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((f) => (
            <div key={f.id} className="aspect-square rounded-xl overflow-hidden bg-surface-container-high relative group">
              <img src={f.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {f.autor?.nombre && (
                <span className="absolute bottom-1 left-1 right-1 text-[11px] text-white bg-black/50 rounded px-1.5 py-0.5 truncate">{f.autor.nombre}</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
