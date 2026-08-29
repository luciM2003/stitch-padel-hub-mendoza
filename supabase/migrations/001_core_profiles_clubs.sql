-- Perfiles (1:1 con auth.users), clubes y administradores de club

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'player' check (role in ('player', 'club_admin')),
  nombre text,
  telefono text,
  avatar_url text,
  nivel numeric(3,1),
  created_at timestamptz not null default now()
);

create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists club_admins (
  club_id uuid not null references clubs(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (club_id, profile_id)
);

-- Crea automáticamente una fila en profiles cuando alguien se registra en auth.users
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Función helper reusada por las políticas RLS de otras migraciones
create or replace function is_club_admin(target_club_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from club_admins
    where club_id = target_club_id and profile_id = auth.uid()
  );
$$;
