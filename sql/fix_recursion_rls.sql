-- ============================================================
-- CORRECCIÓN: recursión infinita en políticas de "perfiles"
-- ============================================================
-- Ejecutar en el SQL Editor. Es seguro correrlo aunque ya hayas
-- ejecutado aprobacion_residentes.sql o asignacion_administracion.sql
-- antes — este script limpia y deja las políticas correctas.
-- ============================================================

-- 1. Funciones "de confianza" que consultan el rol y conjunto del
-- usuario actual SIN volver a aplicar las políticas de "perfiles"
-- (evitan la recursión).
create or replace function public.mi_rol()
returns rol_usuario
language sql
security definer
stable
set search_path = public
as $$
  select rol from perfiles where id = auth.uid();
$$;

create or replace function public.mi_conjunto()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select conjunto_id from perfiles where id = auth.uid();
$$;

-- 2. Eliminar TODAS las versiones anteriores de estas políticas
-- (sin importar cuáles hayas llegado a ejecutar antes).
drop policy if exists "administracion ve residentes de su conjunto" on perfiles;
drop policy if exists "administracion aprueba residentes de su conjunto" on perfiles;
drop policy if exists "administracion ve residentes propios o sin asignar" on perfiles;
drop policy if exists "administracion asigna y aprueba residentes" on perfiles;
drop policy if exists "super_admin ve todos los perfiles" on perfiles;

-- 3. Recrearlas usando las funciones de arriba (esto es lo que
-- evita la recursión). El residente elige su conjunto al registrarse;
-- solo la administración de ESE conjunto puede verlo y aprobarlo.
create policy "administracion ve residentes de su conjunto" on perfiles
  for select using (
    perfiles.rol = 'residente'
    and public.mi_rol() = 'administracion'
    and perfiles.conjunto_id = public.mi_conjunto()
  );

create policy "administracion aprueba residentes de su conjunto" on perfiles
  for update using (
    perfiles.rol = 'residente'
    and public.mi_rol() = 'administracion'
    and perfiles.conjunto_id = public.mi_conjunto()
  )
  with check (rol = 'residente');

create policy "super_admin ve todos los perfiles" on perfiles
  for select using (public.mi_rol() = 'super_admin');
