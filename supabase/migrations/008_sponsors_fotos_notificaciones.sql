-- Sponsors (por club o por torneo), galería colaborativa de fotos y notificaciones in-app

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  torneo_id uuid references torneos(id) on delete cascade,
  nombre text not null,
  logo_url text,
  tier text not null default 'bronce' check (tier in ('oro', 'plata', 'bronce')),
  link_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists fotos_torneo (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  uploaded_by uuid references profiles(id) on delete set null,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('cierre_inscripcion', 'proximo_partido', 'cambio_horario', 'cambio_cancha', 'pago', 'sancion')),
  titulo text not null,
  mensaje text not null,
  leida boolean not null default false,
  canal_enviado text not null default 'in_app' check (canal_enviado in ('in_app', 'whatsapp_stub', 'push_stub')),
  created_at timestamptz not null default now()
);

create index if not exists idx_sponsors_club on sponsors(club_id);
create index if not exists idx_fotos_torneo_torneo on fotos_torneo(torneo_id);
create index if not exists idx_notificaciones_profile on notificaciones(profile_id);

-- Bucket de Storage para la galería colaborativa de fotos de torneo
insert into storage.buckets (id, name, public)
values ('torneo-fotos', 'torneo-fotos', true)
on conflict (id) do nothing;
