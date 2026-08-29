-- Torneos y sus categorías (una categoría puede correr con cupo/formato propio dentro de un torneo)

create table if not exists torneos (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  sede_id uuid references sedes(id) on delete set null,
  nombre text not null,
  descripcion text,
  fecha_inicio date not null,
  fecha_fin date,
  fecha_cierre_inscripcion timestamptz,
  estado text not null default 'borrador' check (estado in ('borrador', 'abierto', 'en_curso', 'finalizado', 'cancelado')),
  precio_inscripcion numeric(10,2) not null default 0,
  comision_pct numeric(4,2) not null default 8 check (comision_pct between 5 and 10),
  cupo_parejas int,
  premios text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists torneo_categorias (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  cupo_parejas int,
  formato text not null default 'zonas_y_llave' check (formato in ('zonas_y_llave', 'solo_llave', 'round_robin')),
  created_at timestamptz not null default now(),
  unique (torneo_id, categoria_id)
);

create index if not exists idx_torneos_club on torneos(club_id);
create index if not exists idx_torneos_estado on torneos(estado);
create index if not exists idx_torneo_categorias_torneo on torneo_categorias(torneo_id);
