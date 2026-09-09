-- ============================================================
-- NOTIFICACIONES + FOTOS DE EVIDENCIA
-- ============================================================
-- Ejecutar en el SQL Editor, DESPUÉS de todos los scripts anteriores.
-- ============================================================

-- ------------------------------------------------------------
-- 1. NOTIFICACIONES
-- ------------------------------------------------------------
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id) not null,
  incidente_id uuid references incidentes(id) on delete cascade,
  titulo text not null,
  mensaje text not null,
  leida boolean default false,
  created_at timestamptz default now()
);

alter table notificaciones enable row level security;

create policy "ver propias notificaciones" on notificaciones
  for select using (usuario_id = auth.uid());

create policy "marcar propias notificaciones como leidas" on notificaciones
  for update using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- Función que genera la notificación automáticamente cuando cambia
-- el estado de un incidente (corre con privilegios elevados, así
-- no depende de que el residente tenga sesión activa en ese momento).
create or replace function public.notificar_cambio_estado_incidente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado is distinct from old.estado then
    insert into notificaciones (usuario_id, incidente_id, titulo, mensaje)
    values (
      new.usuario_id,
      new.id,
      case new.estado
        when 'en_revision' then 'Tu incidente está en revisión'
        when 'resuelto' then 'Tu incidente fue resuelto'
        else 'Actualización de tu incidente'
      end,
      case new.estado
        when 'en_revision' then 'La administración de tu conjunto está revisando: "' || new.titulo || '".'
        when 'resuelto' then 'La administración marcó como resuelto: "' || new.titulo || '".' ||
          coalesce(' Comentario: ' || new.respuesta_administracion, '')
        else 'El estado de "' || new.titulo || '" cambió.'
      end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists al_cambiar_estado_notificar on incidentes;
create trigger al_cambiar_estado_notificar
  after update on incidentes
  for each row execute function public.notificar_cambio_estado_incidente();

-- ------------------------------------------------------------
-- 2. ALMACENAMIENTO DE FOTOS DE EVIDENCIA
-- ------------------------------------------------------------
-- Bucket público de solo-lectura: cualquiera con el link ve la foto
-- (igual que una foto adjunta a un reporte), pero solo usuarios
-- autenticados pueden subir, y solo dentro de su propia carpeta
-- (identificada por su user id), lo que evita que alguien suba
-- o borre archivos de otra persona.
insert into storage.buckets (id, name, public)
values ('incidentes-fotos', 'incidentes-fotos', true)
on conflict (id) do nothing;

create policy "cualquiera puede ver fotos de incidentes" on storage.objects
  for select using (bucket_id = 'incidentes-fotos');

create policy "usuarios autenticados suben a su propia carpeta" on storage.objects
  for insert with check (
    bucket_id = 'incidentes-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "usuarios borran solo sus propias fotos" on storage.objects
  for delete using (
    bucket_id = 'incidentes-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- 3. LECTURA DE PARTICIPACIONES PARA INDICADORES
-- ------------------------------------------------------------
-- Faltaba: la administración no podía ver quiénes participan en las
-- campañas de su propio conjunto (solo cada residente veía la suya).
-- Esto es necesario para calcular el indicador de participación.
create policy "administracion ve participaciones de su conjunto" on participaciones_campana
  for select using (
    exists (
      select 1 from campanas c
      join perfiles p on p.id = auth.uid()
      where c.id = participaciones_campana.campana_id
      and p.rol = 'administracion'
      and p.conjunto_id = c.conjunto_id
    )
  );

create policy "super_admin ve todas las participaciones" on participaciones_campana
  for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  );
