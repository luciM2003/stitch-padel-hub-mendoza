-- Ranking doble (oficial / club) con historial de evolución, no solo posición actual

create table if not exists rankings (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('oficial', 'club')),
  puntos numeric(10,2) not null default 0,
  posicion int,
  updated_at timestamptz not null default now(),
  unique (categoria_id, profile_id, tipo)
);

create table if not exists ranking_historial (
  id uuid primary key default gen_random_uuid(),
  ranking_id uuid not null references rankings(id) on delete cascade,
  torneo_id uuid references torneos(id) on delete set null,
  puntos numeric(10,2) not null,
  posicion int,
  fecha timestamptz not null default now()
);

create index if not exists idx_rankings_categoria on rankings(categoria_id);
create index if not exists idx_rankings_profile on rankings(profile_id);
create index if not exists idx_ranking_historial_ranking on ranking_historial(ranking_id);
