-- Fixture del torneo (zonas/llave) y carga de resultados.
-- Nombrado "torneo_partidos" para no confundir con el concepto casual de "Partidos Abiertos" (local/mock, sin relación).

create table if not exists torneo_partidos (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categorias(id) on delete cascade,
  fase text not null,
  ronda int not null default 1,
  cancha_id uuid references canchas(id) on delete set null,
  horario_programado timestamptz,
  horario_real timestamptz,
  pareja1_inscripcion_id uuid references inscripciones(id) on delete set null,
  pareja2_inscripcion_id uuid references inscripciones(id) on delete set null,
  siguiente_partido_id uuid references torneo_partidos(id) on delete set null,
  estado text not null default 'programado' check (estado in ('programado', 'en_curso', 'finalizado', 'walkover')),
  sincronizado boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists resultados (
  id uuid primary key default gen_random_uuid(),
  torneo_partido_id uuid not null unique references torneo_partidos(id) on delete cascade,
  sets jsonb not null default '[]',
  ganador_inscripcion_id uuid references inscripciones(id) on delete set null,
  cargado_por uuid references profiles(id) on delete set null,
  cargado_offline boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_torneo_partidos_categoria on torneo_partidos(torneo_categoria_id);
create index if not exists idx_torneo_partidos_cancha on torneo_partidos(cancha_id);
create index if not exists idx_torneo_partidos_siguiente on torneo_partidos(siguiente_partido_id);
