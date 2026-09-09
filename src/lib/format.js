export const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-AR");

export function fmtFecha(iso) {
  if (!iso) return "";
  // Las fechas "solo fecha" (columnas `date`, ej. torneos.fecha_inicio) vienen como "YYYY-MM-DD".
  // new Date("YYYY-MM-DD") las interpreta como medianoche UTC, que en zonas horarias detrás de
  // UTC (como Argentina) muestra el día anterior. Parseamos los componentes como fecha local.
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const fecha = soloFecha ? new Date(...iso.split("-").map((n, i) => (i === 1 ? Number(n) - 1 : Number(n)))) : new Date(iso);
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtFechaHora(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
