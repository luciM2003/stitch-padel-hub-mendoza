import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsModal from "../components/NotificationsModal.jsx";

const initialMessages = [
  {
    id: 1,
    from: "Lucas",
    side: "left",
    text: "Che, ¿alguien lleva pelotas?",
    time: "14:23",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7gImPUw-UBNISyTjUK-0oPQGtHM2khRLRYOs_cQuurIZ8wbP0tDiZOJG4Sf7UQjisA__ABeKXAqGg0HEDbJds3tzgy_8Z5qzQrwrrFedXGweFArDRwSfshmZCk2UXKgZ97qI9b5HtWHI0mJz1EHs2cJhJU1PGtg08iSgN2VZZuLsW_V-dKIbyQf7cg03fOYzURVK_XYvtkNs3n_RjCsEYXvvjwJIRa6LnlP2ryCOCKLfDtBdhL0I",
  },
  { id: 2, from: "Tú", side: "right", text: "Yo llevo un tubo nuevo", time: "14:25" },
  {
    id: 3,
    from: "Sebas",
    side: "left",
    text: "Dale, nos vemos ahí",
    time: "14:26",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPT104Vvzf12BLb4uBvIR523SmCk0Hq72rPGVY5OAJFQR18dCjOwYEQucXXW9dmin1_eOW4JIcjErwGAeo7R1gcqAwmj7aL3J7U9rWRgT-vFtN1wyTt_lDi3raO7GSDILp3K8r_GbYp_0d0nuhi3LBWUYTqLooBl7wc0khXYgBLI56JsS6R3NAbPipEeHD1N54cu8Jts8owgFwkk0D_w-689vZi_7cPbrrx7GpJ01h7Bs_Gj5nQ0g",
  },
];

export default function ChatDelPartido() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [texto, setTexto] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function adjuntarArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        from: "Tú",
        side: "right",
        text: `📎 ${file.name}`,
        time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    e.target.value = "";
  }

  function enviar(e) {
    e.preventDefault();
    const value = texto.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        from: "Tú",
        side: "right",
        text: value,
        time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setTexto("");
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
    <div className="w-full max-w-md bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col overflow-hidden shadow-sm">
      <header className="bg-surface flex justify-between items-center px-container-margin py-stack-sm w-full top-0 z-40 relative">
        <div className="flex items-center gap-inline-gutter hover:bg-surface-container-high transition-colors rounded-full cursor-pointer" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-on-surface px-2">arrow_back</span>
        </div>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Padel Pro</h1>
        <div
          onClick={() => setShowNotifs(true)}
          className="flex items-center justify-center w-10 h-10 text-primary hover:bg-surface-container-high active:scale-90 transition-all rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            notifications
          </span>
        </div>
      </header>

      <div className="px-container-margin py-stack-sm bg-surface border-b border-border-subtle flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="text-body-lg font-body-lg font-semibold tracking-tight text-on-surface">Chat de Cancha 2</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-status-ok"></span>
            <span className="text-label-muted font-label-muted text-text-secondary">4 participantes</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw-Sk7_R_EDZYUYwhuybyKIJh1QWcQVEVrmLuIqQgUqU3rvD-zagdstmvHkC_4xlJkxjeSdTueZ7Ip0tOZ9Ln0i9M-b42OHNn_udOOb2rGEtGwxEqG3nZ3nOpOoqNBXfJWTiSmkYfFZf_-DmRebg1D-Xh72GotSU0wJY1cF_1-gF6FtgPmEQvhNYtnu5zWWkA2lSLGoOMbra5x-MHR6BFzsgK0a4bK6AHRmDb6Niw4aIg6ZBYUxJQ"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center overflow-hidden">
              <span className="text-label-caps font-label-caps text-secondary">M</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center overflow-hidden">
              <span className="text-label-caps font-label-caps text-secondary">+2</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-container-margin py-stack-md flex flex-col gap-stack-md bg-surface-bright pb-24">
        <div className="flex justify-center">
          <span className="px-4 py-1 bg-surface-container-low text-text-secondary text-label-caps font-label-caps rounded-full border border-border-subtle">HOY</span>
        </div>

        {messages.map((m) =>
          m.side === "left" ? (
            <div key={m.id} className="flex items-end gap-inline-gutter group animate-item">
              <div className="w-8 h-8 rounded-full bg-surface-container flex-shrink-0 overflow-hidden shadow-sm">
                <img className="w-full h-full object-cover" src={m.avatar} />
              </div>
              <div className="flex flex-col gap-1 max-w-[75%]">
                <span className="text-label-muted font-label-muted text-text-secondary ml-1">{m.from}</span>
                <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl rounded-bl-none shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <p className="text-body-md font-body-md leading-snug">{m.text}</p>
                </div>
                <span className="text-[11px] text-text-secondary ml-1">{m.time}</span>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-end gap-inline-gutter flex-row-reverse group animate-item">
              <div className="w-8 h-8 rounded-full bg-primary-container flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                <span className="text-label-caps font-label-caps text-on-primary-container">M</span>
              </div>
              <div className="flex flex-col gap-1 items-end max-w-[75%]">
                <span className="text-label-muted font-label-muted text-text-secondary mr-1">Tú</span>
                <div className="bg-primary-container text-on-primary-container p-4 rounded-2xl rounded-br-none shadow-sm transition-transform group-hover:-translate-y-0.5">
                  <p className="text-body-md font-body-md leading-snug">{m.text}</p>
                </div>
                <div className="flex items-center gap-1 mr-1">
                  <span className="text-[11px] text-text-secondary">{m.time}</span>
                  <span className="material-symbols-outlined text-[14px] text-status-ok">done_all</span>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      <form onSubmit={enviar} className="fixed bottom-0 w-full max-w-md bg-surface/90 backdrop-blur-md border-t border-border-subtle p-4 px-container-margin z-50">
        <div className="flex items-center gap-3 bg-surface-container-lowest border border-border-subtle rounded-full pr-2 pl-4 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <input ref={fileInputRef} type="file" className="hidden" onChange={adjuntarArchivo} />
          <button
            type="button"
            aria-label="Adjuntar archivo"
            onClick={() => fileInputRef.current?.click()}
            className="text-text-secondary hover:text-on-surface active:scale-90 transition-all p-1 flex-shrink-0"
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input
            className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-body-md font-body-md text-on-surface placeholder-text-secondary h-10"
            placeholder="Escribe un mensaje..."
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button
            type="submit"
            aria-label="Enviar"
            disabled={!texto.trim()}
            className="w-10 h-10 rounded-full bg-inverse-surface text-inverse-on-surface flex items-center justify-center hover:bg-on-surface active:scale-90 transition-all flex-shrink-0 shadow-sm disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[20px] -ml-0.5">send</span>
          </button>
        </div>
      </form>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
    </div>
    </div>
  );
}
