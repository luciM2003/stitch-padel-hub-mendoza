import { useState } from "react";
import { useToast } from "./Toast.jsx";

export default function ClubSetupCard({ crearClub }) {
  const showToast = useToast();
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim() || loading) return;
    setLoading(true);
    try {
      await crearClub(nombre.trim());
      showToast("¡Club creado! Ya podés armar tus torneos.");
    } catch (err) {
      showToast(err.message || "No se pudo crear el club.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-stack-lg bg-surface-container-lowest border border-border-subtle rounded-kondor p-stack-lg text-center flex flex-col items-center gap-stack-md">
      <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        emoji_events
      </span>
      <div>
        <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-text-primary mb-2">Configurá tu club</h2>
        <p className="text-body-md font-body-md text-text-secondary">
          Antes de crear torneos necesitamos el nombre de tu club. Te armamos una sede y categorías base para que
          arranques rápido (después podés editarlas).
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Club Central Padel"
          className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary-container text-center"
        />
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear mi club"}
        </button>
      </form>
    </div>
  );
}
