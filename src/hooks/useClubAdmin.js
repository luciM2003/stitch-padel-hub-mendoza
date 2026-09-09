import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

// El rol profiles.role solo se usa como atajo de UI (a qué pantalla mandar al usuario tras
// loguearse / qué nav mostrar). El control de acceso real a los datos del club queda en RLS
// vía la tabla club_admins, así que promover el propio rol acá no otorga ningún permiso extra.
export function useClubAdmin() {
  const { user, profile, refreshProfile } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: adminRow } = await supabase.from("club_admins").select("club_id").eq("profile_id", user.id).maybeSingle();
    if (adminRow) {
      const { data: clubRow } = await supabase.from("clubs").select("*").eq("id", adminRow.club_id).single();
      setClub(clubRow);
    } else {
      setClub(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crearClub(nombre) {
    const { data: clubRow, error } = await supabase.from("clubs").insert({ nombre, owner_id: user.id }).select().single();
    if (error) throw error;

    await supabase.from("club_admins").insert({ club_id: clubRow.id, profile_id: user.id });
    const { data: sedeRow } = await supabase.from("sedes").insert({ club_id: clubRow.id, nombre: "Sede Principal" }).select().single();
    if (sedeRow) {
      await supabase.from("canchas").insert(
        ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"].map((nombre) => ({ sede_id: sedeRow.id, nombre, tipo: "Cristal" }))
      );
    }
    const { data: globales } = await supabase.from("categorias_globales").select("id, nombre, genero, orden").order("genero").order("orden");
    if (globales?.length) {
      await supabase.from("categorias").insert(
        globales.map((g) => ({
          club_id: clubRow.id,
          nombre: `${g.nombre} ${g.genero === "masculino" ? "Hombres" : "Mujeres"}`,
          orden: g.orden,
          ranking_tipo: "club",
          categoria_global_id: g.id,
        }))
      );
    }
    if (profile?.role !== "club_admin") {
      await supabase.from("profiles").update({ role: "club_admin" }).eq("id", user.id);
      // Sin este refresh, el profile en memoria del AuthContext sigue con role="player"
      // hasta el próximo login, y RequireAuth adminOnly rebota al admin recién creado
      // fuera de /dashboard-administrador aunque en la base ya sea club_admin.
      await refreshProfile();
    }

    setClub(clubRow);
    return clubRow;
  }

  return { club, loading, crearClub, recargar: cargar };
}
