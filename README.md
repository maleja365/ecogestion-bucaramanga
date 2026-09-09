# EcoGestión Bucaramanga

Plataforma digital para la gestión ambiental inteligente en conjuntos
residenciales de Bucaramanga y su área metropolitana.

Contiene los 3 módulos de la propuesta: registro de usuarios, reporte y
seguimiento de incidentes ambientales, y gestión de campañas ambientales.

## Estructura del proyecto

```
ecogestion/
├── sql/
│   └── schema.sql       ← esquema de base de datos para Supabase
└── app/                 ← aplicación React (frontend)
```

## Paso 1: Crear el proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta gratuita.
2. Crea un nuevo proyecto (elige la región más cercana, ej. São Paulo).
3. Ve a **SQL Editor** en el panel izquierdo.
4. Copia y pega todo el contenido de `sql/schema.sql` y ejecútalo.
   Esto crea las tablas de conjuntos, perfiles, incidentes y campañas,
   con las reglas de seguridad ya configuradas.
5. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public key`

## Paso 2: Configurar la aplicación

```bash
cd app
npm install
cp .env.example .env
```

Abre `.env` y pega tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 3: Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 — podrás registrarte, reportar incidentes y
crear/participar en campañas.

> Nota: para probar como "administración", regístrate normal y luego
> en Supabase (Table Editor > perfiles) cambia manualmente el campo
> `rol` de ese usuario a `administracion`.

## Paso 4: Desplegar (para el piloto)

1. Sube este proyecto a un repositorio de GitHub.
2. Ve a https://vercel.com, conecta tu repositorio.
3. En "Root Directory" selecciona la carpeta `app`.
4. Agrega las mismas variables de entorno (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`) en la configuración del proyecto en Vercel.
5. Despliega. Obtendrás un link público (ej. `ecogestion.vercel.app`)
   que puedes compartir con el conjunto residencial del piloto —
   funciona desde cualquier celular, sin instalar nada.

## Próximos pasos sugeridos

- Subir fotos de incidentes (Supabase Storage, gratis hasta 1GB).
- Notificaciones por correo cuando cambia el estado de un incidente.
- Panel de indicadores para administración (participación, incidentes
  resueltos por mes) — esto alimenta directamente tu objetivo 5 de
  evaluación del piloto.
