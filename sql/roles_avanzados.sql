-- ============================================================
-- ROLES AVANZADOS: super_admin + registro de administración
-- por código de invitación
-- ============================================================
-- IMPORTANTE: este archivo se corre en DOS PASOS SEPARADOS,
-- porque Postgres no permite usar un valor de enum nuevo en la
-- misma ejecución donde se crea.
--
-- PASO 1: selecciona SOLO la siguiente línea, y dale Run:

alter type rol_usuario add value if not exists 'super_admin';

-- PASO 2: ahora selecciona TODO LO DE ABAJO (desde el comentario
-- "PASO 2" hacia el final del archivo) y dale Run por separado.
-- ============================================================
-- conoce y entrega a la persona que va a administrar ese conjunto.
alter table conjuntos_residenciales
  add column if not exists codigo_administracion text unique
  default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

-- 3. Vista pública SIN el código, para el formulario de registro
-- de residentes (así nadie ve los códigos por la consola del navegador).
create or replace view conjuntos_publico as
  select id, nombre, ciudad
  from conjuntos_residenciales;

grant select on conjuntos_publico to anon, authenticated;

-- 4. Restringir el acceso a la tabla real: solo super_admin puede
-- leer/crear conjuntos directamente (incluye ver los códigos).
drop policy if exists "ver conjuntos" on conjuntos_residenciales;
create policy "super_admin ve todos los conjuntos" on conjuntos_residenciales
  for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  );
create policy "super_admin crea conjuntos" on conjuntos_residenciales
  for insert with check (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  );

-- 5. Función que valida un código de administración ANTES de
-- registrarse (para mostrarle un error claro al usuario en el
-- formulario, sin exponer la tabla completa).
create or replace function public.validar_codigo_administracion(codigo text)
returns table(conjunto_id uuid, conjunto_nombre text)
language sql
security definer
set search_path = public
as $$
  select id, nombre from conjuntos_residenciales
  where codigo_administracion = codigo;
$$;

grant execute on function public.validar_codigo_administracion(text) to anon, authenticated;

-- 6. Reemplazar el trigger de creación de perfil: ahora también
-- valida el código si alguien se intenta registrar como administración.
-- Esta es la autoridad real (el paso 5 es solo para la UI); si el
-- código no coincide, la cuenta igual se crea, pero como residente.
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
    insert into public.perfiles (id, nombre_completo, rol, conjunto_id)
    values (new.id, coalesce(new.raw_user_meta_data->>'nombre_completo', new.email), 'administracion', conjunto_validado);
  else
    insert into public.perfiles (id, nombre_completo, rol, conjunto_id)
    values (new.id, coalesce(new.raw_user_meta_data->>'nombre_completo', new.email), 'residente', conjunto_solicitado);
  end if;

  return new;
end;
$$;

-- 7. super_admin necesita ver y actuar sobre TODO, sin importar el
-- conjunto (incidentes, campañas, perfiles de todos los conjuntos).
create policy "super_admin ve todos los incidentes" on incidentes
  for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  );
create policy "super_admin ve todas las campanas" on campanas
  for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  );
create policy "super_admin ve todos los perfiles" on perfiles
  for select using (
    exists (select 1 from perfiles p where p.id = auth.uid() and p.rol = 'super_admin')
  );

-- ============================================================
-- CÓMO CONVERTIRTE EN SUPER ADMIN (hazlo una sola vez, tú misma):
-- 1. Regístrate normal en la app como cualquier residente.
-- 2. Ve a Table Editor > perfiles, busca tu usuario.
-- 3. Cambia manualmente el campo "rol" a: super_admin
-- ============================================================
