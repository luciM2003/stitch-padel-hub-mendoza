import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      console.error("No se pudo cargar el perfil:", error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Una sola fuente de verdad: onAuthStateChange se dispara una vez de entrada con el
    // estado ya conocido (evento INITIAL_SESSION) y de nuevo ante cualquier cambio real.
    // Antes había una llamada separada a getSession() corriendo en paralelo — dos caminos
    // async independientes escribiendo el mismo estado podían pisarse entre sí (ej. si
    // onAuthStateChange disparaba de nuevo con la sesión ya resuelta justo después de que
    // "loading" pasara a false), y eso podía mandar a un usuario ya logueado de vuelta al
    // login al entrar directo a una ruta interna o refrescar la página.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current);
      if (current?.user) {
        loadProfile(current.user.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id);
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/restablecer-contrasena",
    });
    if (error) throw error;
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isSupabaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
