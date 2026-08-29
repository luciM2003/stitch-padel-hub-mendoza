# Base de datos — Padel Hub Mendoza

Las migraciones en `migrations/` (001 a 009) arman todo el esquema del módulo de torneos:
perfiles/clubes, sedes/canchas/categorías, torneos, inscripciones con pago dividido, fixture
y resultados, ranking con historial, sanciones y reglamentos, sponsors/fotos/notificaciones, y
las políticas RLS. Se aplican en orden.

## Cómo aplicarlas

1. Crear el proyecto de Supabase (nombre sugerido: `padel-hub-mendoza`, región `sa-east-1`).
2. Aplicar cada archivo de `migrations/` en orden (001 → 009), vía el SQL Editor del dashboard
   o con la herramienta MCP `apply_migration` (una llamada por archivo, usando el nombre del
   archivo sin extensión como `name`).
3. Copiar la URL del proyecto y la anon/publishable key a `.env` (ver `.env.example`):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Reiniciar `npm run dev` — la app detecta automáticamente que Supabase está configurado
   (`isSupabaseConfigured` en `src/lib/supabaseClient.js`) y deja de mostrar los estados "modo
   demo" / "backend en configuración".

## Google OAuth

El botón "Continuar con Google" en el login ya llama a `supabase.auth.signInWithOAuth`, pero
no va a funcionar hasta configurar un Client ID/Secret de Google Cloud Console en
Authentication → Providers → Google del dashboard de Supabase. Mientras tanto, el login por
email/contraseña funciona sin pasos adicionales.

## Notas de diseño v1 (simplificaciones deliberadas)

- "Busco compañero" se modela como una `inscripcion` con un solo jugador cargado
  (`estado = 'en_espera'`), no hay una tabla de matching aparte.
- El fixture (zonas/llave) se genera con una acción explícita del admin, no se recalcula solo.
- El reordenamiento por demoras se recalcula en el cliente (`src/lib/bracket.js`), no vía
  trigger de base de datos.
- El ranking "oficial" se carga/edita manualmente por el admin — no hay integración con un
  feed externo de federación.
- Mercado Pago (`src/lib/mercadopago.js`) y WhatsApp/push (`src/lib/notify.js`) están
  stubbeados: simulan el flujo end-to-end pero no hacen llamadas reales. Buscar los `TODO` en
  esos archivos para conectar las integraciones reales cuando el club tenga las credenciales.
