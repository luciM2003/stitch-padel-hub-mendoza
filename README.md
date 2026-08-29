# Padel Hub Mendoza

App de reserva de canchas y gestión de torneos de pádel para clubes de Mendoza. React + Vite + Tailwind, con Supabase como backend (auth, base de datos y storage).

## Desarrollo

```bash
npm install
npm run dev
```

Sin un `.env` configurado (ver `.env.example`), la app corre en **modo demo**: se puede navegar toda la interfaz sin conexión a Supabase.

## Backend (Supabase)

Ver [supabase/README.md](supabase/README.md) para cómo crear el proyecto, aplicar las migraciones y configurar las variables de entorno.

## Deploy

Conectado a Vercel — cada push a `master` dispara un deploy automático.
