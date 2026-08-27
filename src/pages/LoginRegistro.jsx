import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRegistro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setTimeout(() => navigate("/home-jugador"), 600);
  }

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col antialiased">
      <main className="flex-grow flex flex-col justify-center px-container-margin py-stack-lg max-w-md mx-auto w-full relative z-10 animate-item">
        <div className="mb-stack-lg text-center">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-stack-sm tracking-tight">
            Bienvenido al Club
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Ingresa tu número para comenzar a jugar.
          </p>
        </div>

        <form className="space-y-stack-md w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface uppercase" htmlFor="phone">
              Número de Teléfono
            </label>
            <div className="relative flex items-center border border-border-subtle rounded-xl bg-surface-container-lowest overflow-hidden focus-within:border-outline focus-within:ring-1 focus-within:ring-outline transition-all">
              <div className="flex items-center pl-4 pr-3 py-3 border-r border-border-subtle bg-surface-container-low text-on-surface font-body-md text-body-md select-none">
                <span aria-hidden="true" className="mr-2 text-xl">
                  🇦🇷
                </span>
                <span>+54</span>
              </div>
              <input
                autoComplete="tel"
                className="flex-grow w-full border-none bg-transparent py-4 px-4 font-body-lg text-body-lg text-on-surface placeholder-text-secondary focus:ring-0 focus:outline-none"
                id="phone"
                name="phone"
                placeholder="11 2345 6789"
                required
                type="tel"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-fixed font-body-lg text-body-lg font-bold py-4 rounded-full flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-70"
            type="submit"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-on-primary-fixed border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Continuar</span>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center my-stack-lg">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="flex-shrink-0 mx-4 font-label-muted text-label-muted text-text-secondary">o</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-surface-container-highest text-on-surface font-body-md text-body-md font-semibold py-4 rounded-full flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-surface-variant"
          type="button"
          onClick={handleSubmit}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          <span>Continuar con Google</span>
        </button>
      </main>
    </div>
  );
}
