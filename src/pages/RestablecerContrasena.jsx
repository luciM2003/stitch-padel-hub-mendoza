import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (password !== confirmar) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      showToast("¡Contraseña actualizada! Ya podés iniciar sesión.");
      navigate("/home-jugador");
    } catch (err) {
      showToast(err.message || "No se pudo actualizar la contraseña. Pedí un nuevo enlace.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center px-container-margin">
      <div className="w-full max-w-md bg-surface-container-lowest border border-border-subtle rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface mb-1">Nueva contraseña</h1>
        <p className="text-body-md font-body-md text-text-secondary mb-6">Elegí una nueva contraseña para tu cuenta.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase" htmlFor="password">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-text-primary uppercase" htmlFor="confirmar">
              Confirmar contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
