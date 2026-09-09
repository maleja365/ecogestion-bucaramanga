-- ============================================================
-- GUARDAR EL TELÉFONO CAPTURADO EN EL FORMULARIO DE REGISTRO
-- ============================================================
-- La columna "telefono" ya existe en la tabla "perfiles" (schema.sql),
-- pero el trigger que crea el perfil automáticamente no la estaba
-- llenando. Este archivo reemplaza el trigger para que también
-- guarde el teléfono que ahora se pide en el formulario de registro.
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Ejecutar DESPUÉS de: roles_avanzados.sql y aprobacion_residentes.sql
-- ============================================================

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
    insert into public.perfiles (id, nombre_completo, telefono, rol, conjunto_id, aprobado)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'nombre_completo', new.email),
      new.raw_user_meta_data->>'telefono',
      'administracion',
      conjunto_validado,
      true
    );
  else
    insert into public.perfiles (id, nombre_completo, telefono, rol, conjunto_id, aprobado)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'nombre_completo', new.email),
      new.raw_user_meta_data->>'telefono',
      'residente',
      conjunto_solicitado,
      false
    );
  end if;

  return new;
end;
$$;
