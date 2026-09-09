-- ============================================================
-- ESQUEMA DE BASE DE DATOS
-- Plataforma digital para la gestión ambiental inteligente
-- en conjuntos residenciales de Bucaramanga y su área metropolitana
-- ============================================================
-- Motor: PostgreSQL (Supabase)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. CONJUNTOS RESIDENCIALES
-- Un conjunto es donde se ejecuta el piloto (puede haber varios
-- en el futuro, aunque el piloto solo use uno).
-- ------------------------------------------------------------
create table conjuntos_residenciales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  ciudad text default 'Bucaramanga',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. PERFILES (extiende auth.users de Supabase)
-- Supabase Auth ya maneja login/registro con email y contraseña.
-- Esta tabla guarda los datos adicionales: rol y a qué conjunto
-- pertenece cada persona.
-- ------------------------------------------------------------
create type rol_usuario as enum ('residente', 'administracion');

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  rol rol_usuario not null default 'residente',
  conjunto_id uuid references conjuntos_residenciales(id),
  telefono text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 3. INCIDENTES AMBIENTALES (módulo de reporte y seguimiento)
-- Corresponde al objetivo específico 3: "reporte y seguimiento
-- de incidentes ambientales"
-- ------------------------------------------------------------
create type estado_incidente as enum ('pendiente', 'en_revision', 'resuelto');
create type categoria_incidente as enum (
  'residuos_mal_separados',
  'contenedor_dañado',
  'acumulacion_basura',
  'falta_recoleccion',
  'otro'
);

create table incidentes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id) not null,
  conjunto_id uuid references conjuntos_residenciales(id) not null,
  titulo text not null,
  descripcion text not null,
  categoria categoria_incidente default 'otro',
  foto_url text,
  estado estado_incidente default 'pendiente',
  respuesta_administracion text,
  created_at timestamptz default now(),
  actualizado_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 4. CAMPAÑAS AMBIENTALES (módulo de gestión de campañas)
-- ------------------------------------------------------------
create table campanas (
  id uuid primary key default gen_random_uuid(),
  conjunto_id uuid references conjuntos_residenciales(id) not null,
  creado_por uuid references perfiles(id) not null,
  titulo text not null,
  descripcion text not null,
  fecha_inicio date not null,
  fecha_fin date,
  activa boolean default true,
  created_at timestamptz default now()
);

-- Tabla intermedia: qué residentes se inscriben a qué campaña
-- (esto es lo que te permite medir el indicador de "participación
-- de los residentes en campañas ambientales" de tus resultados esperados)
create table participaciones_campana (
  id uuid primary key default gen_random_uuid(),
  campana_id uuid references campanas(id) on delete cascade not null,
  usuario_id uuid references perfiles(id) not null,
  fecha_inscripcion timestamptz default now(),
  unique (campana_id, usuario_id)
);

-- ------------------------------------------------------------
-- 5. SEGURIDAD (Row Level Security)
-- Cada residente solo ve/edita lo de su propio conjunto.
-- La administración puede gestionar todo lo de su conjunto.
-- ------------------------------------------------------------
alter table perfiles enable row level security;
alter table incidentes enable row level security;
alter table campanas enable row level security;
alter table participaciones_campana enable row level security;

-- Perfiles: cada quien ve y edita su propio perfil
create policy "ver propio perfil" on perfiles
  for select using (auth.uid() = id);
create policy "editar propio perfil" on perfiles
  for update using (auth.uid() = id);
create policy "crear perfil al registrarse" on perfiles
  for insert with check (auth.uid() = id);

-- Incidentes: los residentes ven y crean incidentes de su conjunto;
-- solo la administración puede cambiar el estado (usando función abajo)
create policy "ver incidentes del propio conjunto" on incidentes
  for select using (
    conjunto_id in (select conjunto_id from perfiles where id = auth.uid())
  );
create policy "crear incidentes propios" on incidentes
  for insert with check (usuario_id = auth.uid());
create policy "administracion actualiza incidentes" on incidentes
  for update using (
    exists (
      select 1 from perfiles
      where id = auth.uid() and rol = 'administracion'
      and conjunto_id = incidentes.conjunto_id
    )
  );

-- Campañas: visibles para todo el conjunto, solo administración crea
create policy "ver campanas del propio conjunto" on campanas
  for select using (
    conjunto_id in (select conjunto_id from perfiles where id = auth.uid())
  );
create policy "administracion crea campanas" on campanas
  for insert with check (
    exists (
      select 1 from perfiles
      where id = auth.uid() and rol = 'administracion'
    )
  );

-- Participaciones: cada residente inscribe/ve su propia participación
create policy "ver propias participaciones" on participaciones_campana
  for select using (usuario_id = auth.uid());
create policy "inscribirse a campanas" on participaciones_campana
  for insert with check (usuario_id = auth.uid());

-- ------------------------------------------------------------
-- 6. DATOS DE PRUEBA (opcional, para desarrollo)
-- ------------------------------------------------------------
insert into conjuntos_residenciales (nombre, direccion, ciudad)
values ('Conjunto Piloto', 'Por definir según el piloto', 'Bucaramanga');
