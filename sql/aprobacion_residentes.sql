-- ============================================================
-- APROBACIÓN DE RESIDENTES POR LA ADMINISTRACIÓN DE SU CONJUNTO
-- ============================================================
-- Ejecutar en el SQL Editor, DESPUÉS de roles_avanzados.sql
-- ============================================================

-- 1. Nuevo campo: un residente empieza sin aprobar; administración
-- y super_admin quedan aprobados automáticamente (ya se validaron
-- por código).
alter table perfiles add column if not exists aprobado boolean not null default false;
update perfiles set aprobado = true where rol in ('administracion', 'super_admin');

-- 2. El trigger de registro ahora también fija el estado de aprobación.
create or replace function public.crear_perfil_automatico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  conjunto_validado uuid;
  quiere_ser_admin boolean;
  codigo_ingresado text;
  conjunto_solicitado uuid;
begin
  quiere_ser_admin := (new.raw_user_meta_data->>'tipo_registro') = 'administracion';
  codigo_ingresado := new.raw_user_meta_data->>'codigo_admin';
  conjunto_solicitado := (new.raw_user_meta_data->>'conjunto_id')::uuid;

  if quiere_ser_admin and codigo_ingresado is not null then
    select id into conjunto_validado
    from conjuntos_residenciales
    where codigo_administracion = codigo_ingresado;
  end if;

  if conjunto_validado is not null then
    insert into public.perfiles (id, nombre_completo, rol, conjunto_id, aprobado)
    values (new.id, coalesce(new.raw_user_meta_data->>'nombre_completo', new.email), 'administracion', conjunto_validado, true);
  else
    insert into public.perfiles (id, nombre_completo, rol, conjunto_id, aprobado)
    values (new.id, coalesce(new.raw_user_meta_data->>'nombre_completo', new.email), 'residente', conjunto_solicitado, false);
  end if;

  return new;
end;
$$;

-- 3. La administración del conjunto puede ver a los residentes de
-- SU conjunto (para poder aprobarlos), aunque no estén aprobados.
create policy "administracion ve residentes de su conjunto" on perfiles
  for select using (
    exists (
      select 1 from perfiles p
      where p.id = auth.uid() and p.rol = 'administracion' and p.conjunto_id = perfiles.conjunto_id
    )
  );

-- 4. La administración puede aprobar (o rechazar) residentes de su
-- conjunto, pero el "with check" impide que pueda cambiarles el rol
-- a algo distinto de residente — así no puede autoescalarse privilegios
-- a nadie por esta vía.
create policy "administracion aprueba residentes de su conjunto" on perfiles
  for update using (
    exists (
      select 1 from perfiles p
      where p.id = auth.uid() and p.rol = 'administracion' and p.conjunto_id = perfiles.conjunto_id
    )
    and perfiles.rol = 'residente'
  )
  with check (rol = 'residente');

-- 5. Solo residentes YA aprobados pueden ver o crear incidentes/campañas
-- de su conjunto. Reemplazamos las políticas anteriores.
drop policy if exists "ver incidentes del propio conjunto" on incidentes;
create policy "ver incidentes del propio conjunto" on incidentes
  for select using (
    exists (
      select 1 from perfiles
      where id = auth.uid() and conjunto_id = incidentes.conjunto_id and aprobado = true
    )
  );

drop policy if exists "crear incidentes propios" on incidentes;
create policy "crear incidentes propios" on incidentes
  for insert with check (
    usuario_id = auth.uid()
    and exists (select 1 from perfiles where id = auth.uid() and aprobado = true)
  );

drop policy if exists "ver campanas del propio conjunto" on campanas;
create policy "ver campanas del propio conjunto" on campanas
  for select using (
    exists (
      select 1 from perfiles
      where id = auth.uid() and conjunto_id = campanas.conjunto_id and aprobado = true
    )
  );

drop policy if exists "inscribirse a campanas" on participaciones_campana;
create policy "inscribirse a campanas" on participaciones_campana
  for insert with check (
    usuario_id = auth.uid()
    and exists (select 1 from perfiles where id = auth.uid() and aprobado = true)
  );
