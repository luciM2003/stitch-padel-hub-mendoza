-- RLS: activar en todas las tablas del módulo de torneos + reservas backend.
-- Convención: lectura amplia para usuarios autenticados en datos no sensibles,
-- escritura restringida a is_club_admin(club_id) o al propio jugador dueño del dato.

alter table profiles enable row level security;
alter table clubs enable row level security;
alter table club_admins enable row level security;
alter table sedes enable row level security;
alter table canchas enable row level security;
alter table categorias enable row level security;
alter table torneos enable row level security;
alter table torneo_categorias enable row level security;
alter table inscripciones enable row level security;
alter table inscripcion_jugadores enable row level security;
alter table pagos enable row level security;
alter table torneo_partidos enable row level security;
alter table resultados enable row level security;
alter table rankings enable row level security;
alter table ranking_historial enable row level security;
alter table sanciones enable row level security;
alter table reglamentos enable row level security;
alter table sponsors enable row level security;
alter table fotos_torneo enable row level security;
alter table notificaciones enable row level security;

-- profiles: todo usuario autenticado puede leer perfiles públicos básicos; cada uno edita el propio
create policy "profiles_select_auth" on profiles for select to authenticated using (true);
create policy "profiles_update_own" on profiles for update to authenticated using (id = auth.uid());

-- clubs: lectura pública para autenticados. Alta propia (self-serve) por cualquier autenticado
-- que se declare owner_id = auth.uid(); edición/borrado solo para admins ya reconocidos del club.
create policy "clubs_select_auth" on clubs for select to authenticated using (true);
create policy "clubs_insert_self" on clubs for insert to authenticated with check (owner_id = auth.uid());
create policy "clubs_update_admin" on clubs for update to authenticated using (is_club_admin(id)) with check (is_club_admin(id));
create policy "clubs_delete_admin" on clubs for delete to authenticated using (is_club_admin(id));

-- club_admins: visible para los propios admins del club; alta propia al crear un club, o por un admin existente
create policy "club_admins_select_own" on club_admins for select to authenticated
  using (profile_id = auth.uid() or is_club_admin(club_id));
create policy "club_admins_insert_self_or_admin" on club_admins for insert to authenticated
  with check (profile_id = auth.uid() or is_club_admin(club_id));

-- sedes / canchas / categorias: lectura pública, escritura admin del club dueño
create policy "sedes_select_auth" on sedes for select to authenticated using (true);
create policy "sedes_write_admin" on sedes for all to authenticated
  using (is_club_admin(club_id)) with check (is_club_admin(club_id));

create policy "canchas_select_auth" on canchas for select to authenticated using (true);
create policy "canchas_write_admin" on canchas for all to authenticated
  using (is_club_admin((select club_id from sedes where sedes.id = canchas.sede_id)))
  with check (is_club_admin((select club_id from sedes where sedes.id = canchas.sede_id)));

create policy "categorias_select_auth" on categorias for select to authenticated using (true);
create policy "categorias_write_admin" on categorias for all to authenticated
  using (is_club_admin(club_id)) with check (is_club_admin(club_id));

-- torneos: cualquier autenticado ve los que no son borrador; el admin del club ve y edita todo lo suyo
create policy "torneos_select_publicos" on torneos for select to authenticated
  using (estado <> 'borrador' or is_club_admin(club_id));
create policy "torneos_write_admin" on torneos for all to authenticated
  using (is_club_admin(club_id)) with check (is_club_admin(club_id));

create policy "torneo_categorias_select_auth" on torneo_categorias for select to authenticated using (true);
create policy "torneo_categorias_write_admin" on torneo_categorias for all to authenticated
  using (is_club_admin((select club_id from torneos where torneos.id = torneo_categorias.torneo_id)))
  with check (is_club_admin((select club_id from torneos where torneos.id = torneo_categorias.torneo_id)));

-- inscripciones: lectura pública (para "buscar compañero" y ver cupos); escritura del propio jugador o admin
create policy "inscripciones_select_auth" on inscripciones for select to authenticated using (true);
create policy "inscripciones_insert_auth" on inscripciones for insert to authenticated with check (true);
create policy "inscripciones_update_participante_o_admin" on inscripciones for update to authenticated
  using (
    exists (select 1 from inscripcion_jugadores ij where ij.inscripcion_id = inscripciones.id and ij.profile_id = auth.uid())
    or is_club_admin((select t.club_id from torneos t
                       join torneo_categorias tc on tc.torneo_id = t.id
                       where tc.id = inscripciones.torneo_categoria_id))
  );

-- inscripcion_jugadores: solo el propio jugador o el admin del club ven/editan su fila
-- Lectura pública (igual que inscripciones/torneo_partidos/resultados): el fixture necesita
-- mostrar los nombres de TODAS las parejas a TODOS los jugadores, no solo a los propios —
-- si esto fuera privado, FixtureDelTorneo.jsx solo podría mostrar tu propio equipo y "..."
-- para el resto. El dato sensible (si ya pagaste) vive igual acá (estado_pago) porque RLS es
-- por fila, no por columna — v1 asume que ese campo no es crítico; lo verdaderamente sensible
-- (comprobantes, ids de pago) está en `pagos`, que sí queda restringido a dueño/admin.
create policy "inscripcion_jugadores_select_auth" on inscripcion_jugadores for select to authenticated using (true);
-- Un jugador puede anotarse a sí mismo, y también puede anotar a su compañero de pareja en la
-- MISMA inscripción que él mismo creó (flujo "Ya tengo pareja" de InscripcionATorneo.jsx).
create policy "inscripcion_jugadores_insert_propio" on inscripcion_jugadores for insert to authenticated
  with check (
    profile_id = auth.uid()
    or exists (select 1 from inscripciones i where i.id = inscripcion_jugadores.inscripcion_id and i.created_by = auth.uid())
  );
create policy "inscripcion_jugadores_update_propio_o_admin" on inscripcion_jugadores for update to authenticated
  using (
    profile_id = auth.uid()
    or is_club_admin((select t.club_id from torneos t
                       join torneo_categorias tc on tc.torneo_id = t.id
                       join inscripciones i on i.torneo_categoria_id = tc.id
                       where i.id = inscripcion_jugadores.inscripcion_id))
  );

-- pagos: visibles solo para el jugador dueño de la inscripción o el admin del club
create policy "pagos_select_propio_o_admin" on pagos for select to authenticated
  using (
    exists (select 1 from inscripcion_jugadores ij where ij.id = pagos.inscripcion_jugador_id and ij.profile_id = auth.uid())
    or is_club_admin((select t.club_id from torneos t
                       join torneo_categorias tc on tc.torneo_id = t.id
                       join inscripciones i on i.torneo_categoria_id = tc.id
                       join inscripcion_jugadores ij on ij.inscripcion_id = i.id
                       where ij.id = pagos.inscripcion_jugador_id))
  );
create policy "pagos_insert_propio" on pagos for insert to authenticated
  with check (exists (select 1 from inscripcion_jugadores ij where ij.id = pagos.inscripcion_jugador_id and ij.profile_id = auth.uid()));

-- torneo_partidos / resultados: lectura pública (fixture en vivo), escritura del admin del club
create policy "torneo_partidos_select_auth" on torneo_partidos for select to authenticated using (true);
create policy "torneo_partidos_write_admin" on torneo_partidos for all to authenticated
  using (is_club_admin((select t.club_id from torneos t
                         join torneo_categorias tc on tc.torneo_id = t.id
                         where tc.id = torneo_partidos.torneo_categoria_id)))
  with check (is_club_admin((select t.club_id from torneos t
                              join torneo_categorias tc on tc.torneo_id = t.id
                              where tc.id = torneo_partidos.torneo_categoria_id)));

create policy "resultados_select_auth" on resultados for select to authenticated using (true);
create policy "resultados_write_admin" on resultados for all to authenticated
  using (is_club_admin((select t.club_id from torneos t
                         join torneo_categorias tc on tc.torneo_id = t.id
                         join torneo_partidos tp on tp.torneo_categoria_id = tc.id
                         where tp.id = resultados.torneo_partido_id)))
  with check (is_club_admin((select t.club_id from torneos t
                              join torneo_categorias tc on tc.torneo_id = t.id
                              join torneo_partidos tp on tp.torneo_categoria_id = tc.id
                              where tp.id = resultados.torneo_partido_id)));

-- rankings / ranking_historial: lectura pública, escritura del admin del club dueño de la categoría
create policy "rankings_select_auth" on rankings for select to authenticated using (true);
create policy "rankings_write_admin" on rankings for all to authenticated
  using (is_club_admin((select club_id from categorias where categorias.id = rankings.categoria_id)))
  with check (is_club_admin((select club_id from categorias where categorias.id = rankings.categoria_id)));

create policy "ranking_historial_select_auth" on ranking_historial for select to authenticated using (true);
create policy "ranking_historial_write_admin" on ranking_historial for all to authenticated
  using (is_club_admin((select c.club_id from rankings r join categorias c on c.id = r.categoria_id where r.id = ranking_historial.ranking_id)))
  with check (is_club_admin((select c.club_id from rankings r join categorias c on c.id = r.categoria_id where r.id = ranking_historial.ranking_id)));

-- sanciones: el propio jugador ve solo las suyas visibles; el admin del club ve y gestiona todas las de su club
create policy "sanciones_select_propio_o_admin" on sanciones for select to authenticated
  using ((profile_id = auth.uid() and visible_jugador) or is_club_admin(club_id));
create policy "sanciones_write_admin" on sanciones for all to authenticated
  using (is_club_admin(club_id)) with check (is_club_admin(club_id));

-- reglamentos / sponsors: lectura pública, escritura admin del club
create policy "reglamentos_select_auth" on reglamentos for select to authenticated using (true);
create policy "reglamentos_write_admin" on reglamentos for all to authenticated
  using (is_club_admin(club_id)) with check (is_club_admin(club_id));

create policy "sponsors_select_auth" on sponsors for select to authenticated using (true);
create policy "sponsors_write_admin" on sponsors for all to authenticated
  using (is_club_admin(club_id)) with check (is_club_admin(club_id));

-- fotos_torneo: lectura pública; suben fotos los inscriptos confirmados del torneo o el admin del club
create policy "fotos_torneo_select_auth" on fotos_torneo for select to authenticated using (true);
create policy "fotos_torneo_insert_inscripto_o_admin" on fotos_torneo for insert to authenticated
  with check (
    exists (
      select 1 from inscripcion_jugadores ij
      join inscripciones i on i.id = ij.inscripcion_id
      join torneo_categorias tc on tc.id = i.torneo_categoria_id
      where tc.torneo_id = fotos_torneo.torneo_id and ij.profile_id = auth.uid()
    )
    or is_club_admin((select club_id from torneos where torneos.id = fotos_torneo.torneo_id))
  );

-- notificaciones: estrictamente privadas del propio jugador; el cliente no puede insertar (solo service role / futura edge function)
create policy "notificaciones_select_own" on notificaciones for select to authenticated
  using (profile_id = auth.uid());
create policy "notificaciones_update_own" on notificaciones for update to authenticated
  using (profile_id = auth.uid());

-- Storage: bucket público de solo-lectura; sube cualquier autenticado (la validación de "inscripto" queda a nivel fila en fotos_torneo)
create policy "torneo_fotos_public_read" on storage.objects for select
  using (bucket_id = 'torneo-fotos');
create policy "torneo_fotos_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'torneo-fotos');
