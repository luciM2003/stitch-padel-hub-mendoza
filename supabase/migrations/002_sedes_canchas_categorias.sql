-- Sedes (multi-sede por club), canchas y categorías configurables por club

create table if not exists sedes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  nombre text not null,
  direccion text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists canchas (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references sedes(id) on delete cascade,
  nombre text not null,
  tipo text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  nombre text not null,
  ranking_tipo text not null default 'club' check (ranking_tipo in ('oficial', 'club')),
  orden int not null default 0,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_sedes_club on sedes(club_id);
create index if not exists idx_canchas_sede on canchas(sede_id);
create index if not exists idx_categorias_club on categorias(club_id);
