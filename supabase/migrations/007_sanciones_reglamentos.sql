-- Sanciones a jugadores y reglamentos publicados por el club (generales o por torneo)

create table if not exists sanciones (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  motivo text not null,
  tipo text not null check (tipo in ('advertencia', 'suspension_temporal', 'suspension_permanente')),
  fecha_inicio date not null default current_date,
  fecha_fin date,
  visible_jugador boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists reglamentos (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  torneo_id uuid references torneos(id) on delete cascade,
  titulo text not null,
  contenido text not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_sanciones_club on sanciones(club_id);
create index if not exists idx_sanciones_profile on sanciones(profile_id);
create index if not exists idx_reglamentos_club on reglamentos(club_id);
