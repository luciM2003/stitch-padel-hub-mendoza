import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import PlayerSidebar from "../components/PlayerSidebar.jsx";
import NotificationsModal from "../components/NotificationsModal.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";

const filtros = ["Todo", "Mi Nivel", "Hoy", "Mañana"];

const partidosIniciales = [
  {
    id: 1,
    hora: "Hoy 19:30hs",
    dia: "hoy",
    sede: "Kondor Sede",
    precio: "$3.000",
    nivel: "Nivel 4.0 - 5.0",
    nivelColor: "bg-status-pending",
    faltan: "Faltan 2",
    faltanColor: "text-primary",
    avatares: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhHF9ncYx0ogEH43jh9bQj0BQCgadF2P_oKDdB-3viQQb-4Yfhv6IZ25mpKomoF5SHbVPliHTaj8eKLTdzxLkGfYUz6h9j1QRKMvVlYjN6gcrvTXzBAqLIU5WbO4WgR3JX3G41oSjcGauBGZewpPoOMuCIqpRJP7QGYHhVdlGNtfxbL_gYuXzM6-rkMeUGkSIPw5IZ2GXY_swTg7mxmrbudOe_Af888HEDJKozqK03u5tftHTSSt0",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSAs72t4h6PU0fYQGSkjiKcGVgKh0u8iYca_BPmsQG3jYZXEvSzDLZsjPp3i41XkjOamQmNZiy1J62e517oNYfGWAL_w2d009XtoCw-5IMVKhVulhVc13pvCxSYr9CAMV-qN4IUIMO_fpnJRcisGyIc30ouxLL_MCttGiCu5dQvuzIAFVXXLZ5dexJlvS58E0qyOGaufNXUQXq18bWncIavxZTC3fnw6PEPmGp_BX9jm_O0ov66No",
    ],
    vacios: 2,
  },
  {
    id: 2,
    hora: "Hoy 21:00hs",
    dia: "hoy",
    sede: "Club Padel Premium",
    precio: "$3.500",
    nivel: "Nivel 6.0+",
    nivelColor: "bg-status-error",
    faltan: "Falta 1",
    faltanColor: "text-status-error",
    avatares: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVaM8IfE0PbVXn_N1tnBWiVTmMXP2wYuVlrmbOhqe9SHvXLqkDLypG-ulrD9zdknY5QVhIF_DLPK6-4eWNZSYWkqxw6HM6ZVHykT7nfVxO-CzI0xMF_pIGa4DjP6kLvIqL4vor8Ijt8SjodcWVzIbx_V4MqYe-Cr9qdv_ZmfW-IS-v1ohTL_PYB9H3Q2tHBbWe5aes6vysDWQX1VkDCK15i45bAuS9AbIS0Z3IQ8_lX9xA3ZgS5dI",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBKIyU7tv6duwJmDz13iod-ignS6JyKBEchH_Gxgtb6atP3SY5V8IzqrRPI84_gcU7NxX_W0FXp7epqAu4zai4ypgzmnpzP5w6P6Wmw0y4ggHbDHXBTKpVhK1MVbm-LVETJi9lAepx5jDLxiYwttGS15uT-i4fNP5rIDqBdyqx08NJXGjbweGxNp4Ov594fhkGFYLxNK6dku42O3SbfKDcuMcNAZY3CkdXMaZCKS4vlpW4LuBpRC9w",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADyh12OPXkhThUyzh-8B_i275UsXW3jIXs8avbyVHXyHQP7JuhzpMOvJ6RKNgzkOsp1rDkIkdHurv7fiu9LumvcqullwrKxjD9s_R4lUgD1oD-gGxd7IWUew_cJHHDkWaDHp1-kGtUA0y96QprBJ2AWib1m1tKZbpq6zqvPFnh1x-b-Wduhpze_mykhX0ST93RzQOygljFrExQMmvsdkOhnysuIyHSrhSKprC9a0CiuvGQT6XzR1A",
    ],
    vacios: 1,
  },
  {
    id: 3,
    hora: "Mañana 10:00hs",
    dia: "manana",
    sede: "Central Court",
    precio: "$2.800",
    nivel: "Nivel 2.0 - 3.5",
    nivelColor: "bg-status-ok",
    faltan: "Faltan 3",
    faltanColor: "text-primary",
    avatares: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqID13P7I4HnmzBoxGAswbC6EMW9V7wV3G8qsJycqiNPBeJ_BUhmvvARuMsgvBSWzldeFehnGeIkSjsLIJ_O4jdHIIsmP_atttX6Hy9YJgHsSnrnxblvDkCJzbKQK5s8vlbI3sFMDcvp9JbseUGZ_VrgAl2emLUfqaeXwmkGpLSpBNlTWaexWlsHjxbrfivaRKdyWjZyy_10Z1lOgu4eLEUJ_K-R2l5h750YTJmfgE1u1pDpi_a_8",
    ],
    vacios: 3,
    opaco: true,
  },
];

export default function PartidosAbiertos() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [filtro, setFiltro] = useState("Todo");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showCrear, setShowCrear] = useState(false);
  const [partidos, setPartidos] = useState(partidosIniciales);
  const [form, setForm] = useState({ sede: "", hora: "" });

  const filtrados = partidos.filter((p) => {
    if (filtro === "Todo") return true;
    if (filtro === "Hoy") return p.dia === "hoy";
    if (filtro === "Mañana") return p.dia === "manana";
    if (filtro === "Mi Nivel") return p.nivel.includes("4");
    return true;
  });

  function crearPartido(e) {
    e.preventDefault();
    if (!form.sede || !form.hora) return;
    setPartidos((prev) => [
      {
        id: Date.now(),
        hora: form.hora,
        dia: form.hora.toLowerCase().startsWith("hoy") ? "hoy" : "manana",
        sede: form.sede,
        precio: "$3.000",
        nivel: "Nivel 3.0 - 5.0",
        nivelColor: "bg-status-pending",
        faltan: "Faltan 3",
        faltanColor: "text-primary",
        avatares: [],
        vacios: 3,
      },
      ...prev,
    ]);
    setShowCrear(false);
    setForm({ sede: "", hora: "" });
    showToast("¡Partido creado con éxito!");
  }

  return (
    <div className="md:flex">
      <PlayerSidebar />
      <div className="flex-1 min-w-0 bg-background text-on-background font-body-md min-h-screen flex flex-col relative pb-[100px] md:pb-8">
      <header className="bg-surface text-primary flex justify-between items-center px-container-margin py-stack-sm w-full sticky z-40 top-0">
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Partidos Abiertos</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifs(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all relative"
          >
            <span className="material-symbols-outlined text-on-surface">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-inverse-primary rounded-full"></span>
          </button>
          <div
            onClick={() => navigate("/perfil-de-usuario")}
            className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-border-subtle cursor-pointer relative hover:opacity-80 transition-opacity"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1fkuHTORwF4zENm80z1j4nTT-kWZXdXSVF0mU20wRjN7v8yFU7xocX9-SSIdAvoPqRGMSQZWe-zRpsnwT9OVBIfGtfSJNiN_oH5U9AZe9Emcte-OCHsE7_05-CiPwVy6pgOWZ9w8L_vAVN2HuZgqgdAHsVRCcmLHA4NfdC9F6SIXvIPsqhQaHVSWt65ICbuiqP8paGa_kqab8Q2VOx3panU0MEzxw_VnGqJfJRcvkB_m1KaE0H_0')",
              backgroundSize: "cover",
            }}
          ></div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto flex flex-col">
        <div className="px-container-margin py-stack-md w-full overflow-x-auto no-scrollbar flex gap-3 snap-x">
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={
                "transition-all active:scale-95 " +
                (filtro === f
                  ? "snap-start flex-shrink-0 px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps shadow-sm hover:opacity-90"
                  : "snap-start flex-shrink-0 px-6 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps border border-border-subtle hover:bg-surface-container-high")
              }
            >
              {f}
            </button>
          ))}
        </div>

        <div className="px-container-margin pb-stack-lg flex flex-col gap-stack-md">
          {filtrados.length === 0 && (
            <p className="text-center text-text-secondary py-16">No hay partidos que coincidan con este filtro.</p>
          )}
          {filtrados.map((p, i) => (
            <div
              key={p.id}
              className={
                "animate-item bg-surface-container-lowest rounded-xl border border-border-subtle p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all hover:border-outline-variant hover:shadow-md" +
                (p.opaco ? " opacity-80" : "")
              }
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {!p.opaco && <div className="absolute left-0 top-0 bottom-0 w-1 bg-inverse-primary"></div>}
              <div className="flex-grow flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-label-muted font-label-muted text-primary mb-1 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {p.hora}
                    </p>
                    <h3 className="text-body-lg font-body-lg font-bold text-on-surface">{p.sede}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-1">Precio x Jugador</p>
                    <p className="text-body-md font-body-md font-bold text-on-surface">{p.precio}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-surface-container-low p-4 rounded-lg">
                  <div className="flex-grow">
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-1">Nivel Requerido</p>
                    <p className="text-body-md font-body-md font-semibold text-on-surface flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.nivelColor}`}></span> {p.nivel}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border-subtle hidden sm:block"></div>
                  <div className="flex flex-col items-start sm:items-end">
                    <p className={`text-label-caps font-label-caps mb-2 ${p.faltanColor}`}>{p.faltan}</p>
                    <div className="flex -space-x-2">
                      {p.avatares.map((a, j) => (
                        <div
                          key={j}
                          className="w-8 h-8 rounded-full bg-surface-container border-2 border-surface-container-lowest flex items-center justify-center"
                          style={{ backgroundImage: `url('${a}')`, backgroundSize: "cover" }}
                        ></div>
                      ))}
                      {Array.from({ length: p.vacios }).map((_, j) => (
                        <div
                          key={j}
                          className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-lowest border-dashed flex items-center justify-center text-text-secondary"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col justify-end md:justify-center pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border-subtle pl-0 md:pl-6">
                <button
                  className="w-full md:w-auto px-8 py-3 bg-inverse-surface text-on-secondary font-label-caps text-label-caps rounded-full hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate("/detalle-del-partido")}
                >
                  Sumarse <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <button
        onClick={() => setShowCrear(true)}
        className="fixed bottom-[100px] md:bottom-8 right-6 w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-300 z-40"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />

      <Modal open={showCrear} onClose={() => setShowCrear(false)} title="Crear Partido">
        <form onSubmit={crearPartido} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-on-surface uppercase">Sede</label>
            <input
              required
              value={form.sede}
              onChange={(e) => setForm({ ...form, sede: e.target.value })}
              placeholder="Ej: Kondor Sede"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-on-surface uppercase">Fecha y hora</label>
            <input
              required
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
              placeholder="Ej: Hoy 22:00hs"
              className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-fixed text-on-primary-fixed font-body-md font-bold py-3 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Crear Partido
          </button>
        </form>
      </Modal>

      <BottomNav />
      </div>
    </div>
  );
}
