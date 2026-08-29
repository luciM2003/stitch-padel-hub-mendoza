// Stub de integración con Mercado Pago.
// TODO: reemplazar por la creación real de una preferencia de pago vía la API de Mercado Pago
// (requiere access token del club y, típicamente, una función server-side / edge function que
// no exponga el access token en el cliente). Por ahora simula el checkout para poder probar
// el flujo de inscripción y pago dividido de punta a punta.

export async function crearPreferenciaMP({ monto, concepto }) {
  await new Promise((r) => setTimeout(r, 500));
  return {
    mock: true,
    init_point: "#",
    monto,
    concepto,
  };
}

export async function simularPagoAprobado() {
  await new Promise((r) => setTimeout(r, 700));
  return { estado: "aprobado", mp_payment_id: `MOCK-${Date.now()}` };
}
