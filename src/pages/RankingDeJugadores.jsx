import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav.jsx";
import PlayerSidebar from "../components/PlayerSidebar.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function RankingDeJugadores() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("general");
  const [categoriasGlobales, setCategoriasGlobales] = useState([]);
  const [genero, setGenero] = useState("masculino");
  const [categoriaGlobalId, setCategoriaGlobalId] = useState("");
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState("");
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("categorias_globales")
      .select("id, nombre, genero, orden")
      .order("genero")
      .order("orden")
      .then(({ data }) => {
        setCategoriasGlobales(data || []);
        const primero = (data || []).find((c) => c.genero === "masculino");
        if (primero) setCategoriaGlobalId(primero.id);
      });
    supabase
      .from("sedes")
      .select("id, nombre, club:clubs(nombre)")
      .eq("activa", true)
      .then(({ data }) => {
        setSedes(data || []);
        if (data?.length) setSedeId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (profile?.categoria_global_id) setCategoriaGlobalId(profile.categoria_global_id);
  }, [profile?.categoria_global_id]);

  useEffect(() => {
    const opcion = categoriasGlobales.find((c) => c.id === categoriaGlobalId);
    if (opcion) setGenero(opcion.genero);
  }, [categoriaGlobalId, categoriasGlobales]);

  useEffect(() => {
    if (!categoriaGlobalId) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, categoriaGlobalId, sedeId]);

  async function cargar() {
    setLoading(true);
    if (tab === "general") {
      const { data } = await supabase
        .from("ranking_oficial")
        .select("puntos, posicion, jugador:profiles(nombre, avatar_url)")
        .eq("categoria_global_id", categoriaGlobalId)
        .order("posicion", { ascending: true, nullsFirst: false });
      setFilas(data || []);
    } else if (sedeId) {
      const { data: sede } = await supabase.from("sedes").select("club_id").eq("id", sedeId).single();
      if (!sede) {
        setFilas([]);
        setLoading(false);
        return;
      }
      const { data: categoria } = await supabase
        .from("categorias")
        .select("id")
        .eq("club_id", sede.club_id)
        .eq("categoria_global_id", categoriaGlobalId)
        .maybeSingle();
      if (!categoria) {
        setFilas([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("rankings")
        .select("puntos, posicion, jugador:profiles(nombre, avatar_url)")
        .eq("categoria_id", categoria.id)
        .eq("sede_id", sedeId)
        .eq("tipo", "club")
        .order("posicion", { ascending: true, nullsFirst: false });
      setFilas(data || []);
    } else {
      setFilas([]);
    }
    setLoading(false);
  }

  const opcionesCategoria = categoriasGlobales.filter((c) => c.genero === genero);

  return (
    <div className="md:flex">
      <PlayerSidebar />
      <div className="flex-1 min-w-0 bg-background text-on-background font-body-md min-h-screen pb-24 md:pb-8">
        <header className="bg-surface flex items-center px-container-margin py-stack-sm w-full sticky top-0 z-40">
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Ranking</h1>
        </header>

        <main className="px-container-margin py-stack-md max-w-3xl mx-auto flex flex-col gap-stack-md">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("general")}
              className={
                "flex-1 py-3 rounded-full text-label-caps font-label-caps font-bold transition-all " +
                (tab === "general" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary")
              }
            >
              General
            </button>
            <button
              onClick={() => setTab("sede")}
              className={
                "flex-1 py-3 rounded-full text-label-caps font-label-caps font-bold transition-all " +
                (tab === "sede" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-text-secondary")
              }
            >
              Por sede
            </button>
          </div>

          {tab === "sede" && (
            <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} className="input">
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.club?.nombre ? `— ${s.club.nombre}` : ""}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setGenero("masculino");
                const primero = categoriasGlobales.find((c) => c.genero === "masculino");
                if (primero) setCategoriaGlobalId(primero.id);
              }}
              className={
                "flex-1 py-2 rounded-full text-label-caps font-label-caps transition-all " +
                (genero === "masculino" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container text-text-secondary")
              }
            >
              Hombres
            </button>
            <button
              onClick={() => {
                setGenero("femenino");
                const primero = categoriasGlobales.find((c) => c.genero === "femenino");
                if (primero) setCategoriaGlobalId(primero.id);
              }}
              className={
                "flex-1 py-2 rounded-full text-label-caps font-label-caps transition-all " +
                (genero === "femenino" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container text-text-secondary")
              }
            >
              Mujeres
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {opcionesCategoria.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoriaGlobalId(c.id)}
                className={
                  "shrink-0 px-4 py-2 rounded-full text-label-caps font-label-caps transition-all " +
                  (categoriaGlobalId === c.id ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-lowest border border-border-subtle text-text-secondary")
                }
              >
                {c.nombre}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl overflow-hidden">
            {loading ? (
              <p className="text-center text-text-secondary py-10">Cargando...</p>
            ) : filas.length === 0 ? (
              <p className="text-center text-text-secondary py-10">Todavía no hay puntos cargados en esta categoría.</p>
            ) : (
              filas.map((f, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle last:border-b-0">
                  <span className="w-8 text-center font-headline-lg-mobile font-headline-lg-mobile font-bold text-text-secondary">{f.posicion ?? i + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                    {f.jugador?.avatar_url && <img className="w-full h-full object-cover" src={f.jugador.avatar_url} alt="" />}
                  </div>
                  <span className="flex-1 font-body-md font-body-md font-bold text-on-surface truncate">{f.jugador?.nombre || "Jugador"}</span>
                  <span className="font-body-md font-body-md font-bold text-primary">{f.puntos} pts</span>
                </div>
              ))
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
