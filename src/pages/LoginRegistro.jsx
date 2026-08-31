import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

const HERO_IMAGES = ["/fotos/padel1.jpg", "/fotos/padel2.jpg", "/fotos/padel3.jpg"];
const HERO_INTERVAL_MS = 5000;

const glassInput =
  "w-full border border-white/40 rounded-xl bg-white/40 backdrop-blur-sm py-3 sm:py-4 px-4 font-body-lg text-body-lg text-[#141414] placeholder-[#5a5a5a]/80 focus:outline-none focus:border-primary-fixed focus:bg-white/60 transition-all";

export default function LoginRegistro() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { signIn, signUp, signInWithGoogle, isSupabaseConfigured } = useAuth();
  const [modo, setModo] = useState("login");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), HERO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    if (!isSupabaseConfigured) {
      showToast("Backend en configuración. Probando en modo demo sin cuenta real.", "info");
      navigate("/home-jugador");
      return;
    }

    setLoading(true);
    try {
      if (modo === "registro") {
        await signUp(form.email, form.password, form.nombre);
        showToast("¡Cuenta creada! Revisá tu email para confirmarla.");
      } else {
        await signIn(form.email, form.password);
        navigate("/home-jugador");
      }
    } catch (err) {
      showToast(err.message || "No se pudo completar la operación.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured) {
      showToast("Google Sign-In todavía no está configurado.", "info");
      return;
    }
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast(err.message || "No se pudo iniciar sesión con Google.", "error");
    }
  }

  return (
    <div className="relative h-dvh flex items-center justify-center overflow-hidden bg-ink-fixed font-body-md antialiased px-container-margin py-3 sm:py-stack-lg">
      <div className="absolute inset-0">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-in-out " +
              (i === heroIndex ? "opacity-100" : "opacity-0")
            }
          />
        ))}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md lg:max-w-lg animate-item max-h-full overflow-y-auto sm:overflow-visible hide-scrollbar">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/30 backdrop-blur-2xl shadow-2xl shadow-black/40 p-5 sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>

          <div className="relative">
            <div className="mb-stack-sm sm:mb-stack-lg text-center">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-xl sm:text-headline-xl text-[#141414] mb-1 sm:mb-stack-sm tracking-tight">
                Bienvenido al Club
              </h1>
              <p className="font-body-md text-body-md text-[#4a4a4a]">
                {modo === "login" ? "Ingresá tu email para comenzar a jugar." : "Creá tu cuenta para empezar a jugar."}
              </p>
            </div>

            <form className="space-y-3 sm:space-y-stack-md w-full" onSubmit={handleSubmit}>
              {modo === "registro" && (
                <div className="flex flex-col space-y-2">
                  <label className="font-label-caps text-label-caps text-[#1a1a1a] uppercase" htmlFor="nombre">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Tu nombre"
                    className={glassInput}
                  />
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="font-label-caps text-label-caps text-[#1a1a1a] uppercase" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  className={glassInput}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-label-caps text-label-caps text-[#1a1a1a] uppercase" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={glassInput}
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-primary-fixed text-on-primary-fixed font-body-lg text-body-lg font-bold py-3 sm:py-4 rounded-full flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-black/20 hover:brightness-105"
                type="submit"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-on-primary-fixed border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{modo === "login" ? "Continuar" : "Crear cuenta"}</span>
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setModo(modo === "login" ? "registro" : "login")}
              className="mt-3 sm:mt-4 text-center text-label-caps font-label-caps text-[#4a4a4a] hover:text-[#141414] transition-colors w-full"
            >
              {modo === "login" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
            </button>

            <div className="relative flex items-center my-3 sm:my-stack-lg">
              <div className="flex-grow border-t border-white/40"></div>
              <span className="flex-shrink-0 mx-4 font-label-muted text-label-muted text-[#4a4a4a]">o</span>
              <div className="flex-grow border-t border-white/40"></div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-white/50 border border-white/40 text-[#141414] font-body-md text-body-md font-semibold py-3 sm:py-4 rounded-full flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-white/70"
              type="button"
              onClick={handleGoogle}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>Continuar con Google</span>
            </button>

            {!isSupabaseConfigured && (
              <p className="mt-3 sm:mt-6 text-center text-label-muted font-label-muted text-[#4a4a4a]">
                Backend en configuración — por ahora podés navegar la app en modo demo.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-3 sm:mt-6">
          {HERO_IMAGES.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Mostrar imagen ${i + 1}`}
              onClick={() => setHeroIndex(i)}
              className={"h-2 rounded-full transition-all " + (i === heroIndex ? "w-6 bg-primary-fixed" : "w-2 bg-white/50 hover:bg-white/70")}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
