-- Taxonomía de categorías compartida por toda la plataforma (no por club): 1era a 8va,
-- separadas por género. Cada categoría local de un club (tabla categorias) se vincula a una
-- fila acá para poder comparar categorías entre clubes distintos y armar el ranking oficial.
create table if not exists categorias_globales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  genero text not null check (genero in ('masculino', 'femenino')),
  orden int not null,
  unique (nombre, genero)
);

insert into categorias_globales (nombre, genero, orden)
select nombre, genero, orden from (
  values
    ('1era', 1), ('2da', 2), ('3ra', 3), ('4ta', 4),
    ('5ta', 5), ('6ta', 6), ('7ma', 7), ('8va', 8)
) as base(nombre, orden)
cross join (values ('masculino'), ('femenino')) as g(genero)
on conflict (nombre, genero) do nothing;

-- Vínculo de cada categoría local de club con su equivalente global
alter table categorias add column if not exists categoria_global_id uuid references categorias_globales(id);

-- Categoría actual auto-declarada del jugador (para habilitar inscripción directa o pedir
-- excepción cuando se anota en un torneo de una categoría distinta a la suya)
alter table profiles add column if not exists categoria_global_id uuid references categorias_globales(id);

-- Ranking por sede física: antes "rankings" (tipo='club') agrupaba todas las sedes de un club
-- en un solo ranking; ahora cada sede puede tener el suyo propio.
alter table rankings add column if not exists sede_id uuid references sedes(id) on delete cascade;
alter table rankings drop constraint if exists rankings_categoria_id_profile_id_tipo_key;
alter table rankings add constraint rankings_categoria_id_profile_id_tipo_sede_id_key unique (categoria_id, profile_id, tipo, sede_id);

-- Ranking oficial de toda la app: cruza clubes, basado en la categoría global (no en una
-- categoría local de un club puntual).
create table if not exists ranking_oficial (
  id uuid primary key default gen_random_uuid(),
  categoria_global_id uuid not null references categorias_globales(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  puntos numeric(10,2) not null default 0,
  posicion int,
  updated_at timestamptz not null default now(),
  unique (categoria_global_id, profile_id)
);

-- Solicitud de excepción: un jugador de una categoría pide anotarse en el torneo de otra
-- (ej. juega en pareja con alguien de una categoría distinta a la suya).
create table if not exists solicitudes_categoria (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categorias(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  motivo text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  resuelto_por uuid references profiles(id) on delete set null,
  resuelto_en timestamptz,
  created_at timestamptz not null default now(),
  unique (torneo_categoria_id, profile_id)
);

create index if not exists idx_rankings_sede on rankings(sede_id);
create index if not exists idx_ranking_oficial_categoria on ranking_oficial(categoria_global_id);
create index if not exists idx_ranking_oficial_profile on ranking_oficial(profile_id);
create index if not exists idx_solicitudes_categoria_torneo_categoria on solicitudes_categoria(torneo_categoria_id);
create index if not exists idx_categorias_categoria_global on categorias(categoria_global_id);
create index if not exists idx_profiles_categoria_global on profiles(categoria_global_id);

-- RLS
alter table categorias_globales enable row level security;
alter table ranking_oficial enable row level security;
alter table solicitudes_categoria enable row level security;

create policy "categorias_globales_select_auth" on categorias_globales for select to authenticated using (true);

create policy "ranking_oficial_select_auth" on ranking_oficial for select to authenticated using (true);
create policy "ranking_oficial_write_club_admin" on ranking_oficial for all to authenticated
  using (exists (select 1 from club_admins where profile_id = auth.uid()))
  with check (exists (select 1 from club_admins where profile_id = auth.uid()));

create policy "solicitudes_categoria_select_propio_o_admin" on solicitudes_categoria for select to authenticated
  using (
    profile_id = auth.uid()
    or is_club_admin((select t.club_id from torneos t
                       join torneo_categorias tc on tc.torneo_id = t.id
                       where tc.id = solicitudes_categoria.torneo_categoria_id))
  );
create policy "solicitudes_categoria_insert_propio" on solicitudes_categoria for insert to authenticated
  with check (profile_id = auth.uid());
create policy "solicitudes_categoria_update_admin" on solicitudes_categoria for update to authenticated
  using (is_club_admin((select t.club_id from torneos t
                         join torneo_categorias tc on tc.torneo_id = t.id
                         where tc.id = solicitudes_categoria.torneo_categoria_id)));
