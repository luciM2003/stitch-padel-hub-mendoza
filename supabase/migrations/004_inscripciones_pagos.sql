-- Inscripciones por pareja, con pago dividido por jugador

create table if not exists inscripciones (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categorias(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'en_espera', 'cancelada')),
  origen text not null default 'pareja' check (origen in ('pareja', 'buscar_companero')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists inscripcion_jugadores (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null references inscripciones(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  es_titular boolean not null default false,
  estado_pago text not null default 'pendiente' check (estado_pago in ('pendiente', 'pagado', 'reembolsado')),
  created_at timestamptz not null default now(),
  unique (inscripcion_id, profile_id)
);

create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  inscripcion_jugador_id uuid not null references inscripcion_jugadores(id) on delete cascade,
  monto numeric(10,2) not null,
  comision_monto numeric(10,2) not null default 0,
  metodo text not null check (metodo in ('mercadopago', 'transferencia')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado', 'reembolsado')),
  mp_payment_id text,
  comprobante_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inscripciones_torneo_categoria on inscripciones(torneo_categoria_id);
create index if not exists idx_inscripcion_jugadores_inscripcion on inscripcion_jugadores(inscripcion_id);
create index if not exists idx_inscripcion_jugadores_profile on inscripcion_jugadores(profile_id);
create index if not exists idx_pagos_inscripcion_jugador on pagos(inscripcion_jugador_id);
