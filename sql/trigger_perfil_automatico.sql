-- ============================================================
-- TRIGGER: creación automática de perfil al registrarse
-- ============================================================
-- Soluciona el problema de RLS al crear el perfil desde el
-- frontend antes de confirmar el correo. Este trigger corre
-- del lado del servidor con permisos elevados (security definer),
-- así que no depende de que el usuario tenga sesión activa.
-- ============================================================

-- 1. Función que se ejecuta automáticamente
create or replace function public.crear_perfil_automatico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre_completo, rol, conjunto_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre_completo', new.email),
    'residente',
    (new.raw_user_meta_data->>'conjunto_id')::uuid
  );
  return new;
end;
$$;

-- 2. Trigger que dispara la función cuando se crea un usuario nuevo
create trigger al_registrarse_crear_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil_automatico();

-- 3. Ya no se necesita que el frontend inserte en "perfiles" directamente,
-- así que ajustamos la política de inserción para que solo el trigger
-- (que corre como superusuario) pueda hacerlo. Esto es más seguro.
drop policy if exists "crear perfil al registrarse" on perfiles;
