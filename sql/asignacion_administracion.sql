-- ============================================================
-- ASIGNACIÓN DE CONJUNTO POR LA ADMINISTRACIÓN AL APROBAR
-- ============================================================
-- Ejecutar en el SQL Editor, DESPUÉS de aprobacion_residentes.sql
--
-- Ahora el residente NO elige su conjunto al registrarse; queda
-- sin conjunto asignado (conjunto_id = null) hasta que alguna
-- administración lo apruebe y, al hacerlo, lo asigna a su propio
-- conjunto.
-- ============================================================

drop policy if exists "administracion ve residentes de su conjunto" on perfiles;
drop policy if exists "administracion aprueba residentes de su conjunto" on perfiles;

-- La administración ve: residentes sin conjunto (pendientes por
-- reclamar) y residentes que ya pertenecen a su propio conjunto.
create policy "administracion ve residentes propios o sin asignar" on perfiles
  for select using (
    perfiles.rol = 'residente'
    and exists (select 1 from perfiles p where p.id = auth.uid() and p.rol = 'administracion')
    and (
      perfiles.conjunto_id is null
      or perfiles.conjunto_id = (select conjunto_id from perfiles p where p.id = auth.uid())
    )
  );

-- Al aprobar, la administración asigna el residente a SU conjunto.
-- El "with check" impide que lo asigne a otro conjunto distinto
-- al suyo, o que le cambie el rol.
create policy "administracion asigna y aprueba residentes" on perfiles
  for update using (
    perfiles.rol = 'residente'
    and exists (select 1 from perfiles p where p.id = auth.uid() and p.rol = 'administracion')
    and (
      perfiles.conjunto_id is null
      or perfiles.conjunto_id = (select conjunto_id from perfiles p where p.id = auth.uid())
    )
  )
  with check (
    rol = 'residente'
    and conjunto_id = (select conjunto_id from perfiles p where p.id = auth.uid())
  );
