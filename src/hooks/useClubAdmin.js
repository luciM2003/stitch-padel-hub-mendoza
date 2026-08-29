import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

const CATEGORIAS_BASE = ["1ra", "2da", "3ra", "4ta", "5ta", "6ta", "7ma", "8va"];

// El rol profiles.role solo se usa como atajo de UI (a qué pantalla mandar al usuario tras
// loguearse / qué nav mostrar). El control de acceso real a los datos del club queda en RLS
// vía la tabla club_admins, así que promover el propio rol acá no otorga ningún permiso extra.
export function useClubAdmin() {
  const { user, profile } = useAuth();
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
    await supabase.from("categorias").insert(
      CATEGORIAS_BASE.map((catNombre, i) => ({ club_id: clubRow.id, nombre: catNombre, orden: i + 1, ranking_tipo: "club" }))
    );
    if (profile?.role !== "club_admin") {
      await supabase.from("profiles").update({ role: "club_admin" }).eq("id", user.id);
    }

    setClub(clubRow);
    return clubRow;
  }

  return { club, loading, crearClub, recargar: cargar };
}
