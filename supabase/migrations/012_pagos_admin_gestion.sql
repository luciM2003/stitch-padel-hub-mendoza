-- Faltaba: el admin del club necesita poder aprobar transferencias pendientes (UPDATE, no
-- existía ninguna policy de update en absoluto) y cargar un pago manual para efectivo cobrado
-- en el club (INSERT, antes solo el propio jugador podía insertar su pago).
create policy "pagos_update_admin" on pagos for update to authenticated
  using (is_club_admin((select t.club_id from torneos t
                         join torneo_categorias tc on tc.torneo_id = t.id
                         join inscripciones i on i.torneo_categoria_id = tc.id
                         join inscripcion_jugadores ij on ij.inscripcion_id = i.id
                         where ij.id = pagos.inscripcion_jugador_id)));

create policy "pagos_insert_admin" on pagos for insert to authenticated
  with check (is_club_admin((select t.club_id from torneos t
                              join torneo_categorias tc on tc.torneo_id = t.id
                              join inscripciones i on i.torneo_categoria_id = tc.id
                              join inscripcion_jugadores ij on ij.inscripcion_id = i.id
                              where ij.id = pagos.inscripcion_jugador_id)));
