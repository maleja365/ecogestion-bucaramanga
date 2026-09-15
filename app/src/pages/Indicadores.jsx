import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from 'recharts'

function descargarCSV(nombreArchivo, filas) {
  if (!filas.length) return
  const encabezados = Object.keys(filas[0])
  const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [
    encabezados.join(','),
    ...filas.map((f) => encabezados.map((h) => escapar(f[h])).join(',')),
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}

const NOMBRES_CATEGORIA = {
  residuos_mal_separados: 'Residuos mal separados',
  contenedor_dañado: 'Contenedor dañado',
  acumulacion_basura: 'Acumulación de basura',
  falta_recoleccion: 'Falta de recolección',
  otro: 'Otro',
}

export default function Indicadores() {
  const { esSuperAdmin, cargando: cargandoAuth } = useAuth()
  const [incidentes, setIncidentes] = useState([])
  const [residentes, setResidentes] = useState([])
  const [participaciones, setParticipaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const { data: inc } = await supabase.from('incidentes').select('*')
      const { data: res } = await supabase.from('perfiles').select('*').eq('rol', 'residente')
      const { data: part } = await supabase.from('participaciones_campana').select('*')
      setIncidentes(inc || [])
      setResidentes(res || [])
      setParticipaciones(part || [])
      setCargando(false)
    }
    cargar()
  }, [])

  if (!cargandoAuth && !esSuperAdmin) {
    return <Navigate to="/" replace />
  }

  // --- Métricas agregadas ---
  const totalIncidentes = incidentes.length
  const resueltos = incidentes.filter((i) => i.estado === 'resuelto')
  const pctResueltos = totalIncidentes ? Math.round((resueltos.length / totalIncidentes) * 100) : 0

  const tiemposResolucion = resueltos
    .filter((i) => i.actualizado_at && i.created_at)
    .map((i) => (new Date(i.actualizado_at) - new Date(i.created_at)) / (1000 * 60 * 60))
  const promedioHoras = tiemposResolucion.length
    ? Math.round(tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length)
    : null

  const residentesAprobados = residentes.filter((r) => r.aprobado)
  const idsConParticipacion = new Set(participaciones.map((p) => p.usuario_id))
  const residentesParticipantes = residentesAprobados.filter((r) => idsConParticipacion.has(r.id))
  const pctParticipacion = residentesAprobados.length
    ? Math.round((residentesParticipantes.length / residentesAprobados.length) * 100)
    : 0

  // --- Incidentes por categoría ---
  const porCategoria = Object.entries(
    incidentes.reduce((acc, i) => {
      acc[i.categoria] = (acc[i.categoria] || 0) + 1
      return acc
    }, {})
  ).map(([categoria, cantidad]) => ({ categoria: NOMBRES_CATEGORIA[categoria] || categoria, cantidad }))

  // --- Incidentes reportados por semana (últimas 8 semanas con datos) ---
  function claveSemana(fecha) {
    const d = new Date(fecha)
    const inicioAno = new Date(d.getFullYear(), 0, 1)
    const semana = Math.ceil(((d - inicioAno) / 86400000 + inicioAno.getDay() + 1) / 7)
    return `S${semana}`
  }
  const porSemanaMap = incidentes.reduce((acc, i) => {
    const k = claveSemana(i.created_at)
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
  const porSemana = Object.entries(porSemanaMap).map(([semana, cantidad]) => ({ semana, cantidad }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-bosque)' }}>Indicadores del piloto</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-tinta-suave)' }}>
          Rendimiento de la plataforma y participación de los residentes, para evaluar el piloto.
        </p>
      </div>

      {cargando ? (
        <p className="text-sm font-mono" style={{ color: 'var(--color-tinta-suave)' }}>Cargando indicadores...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <p className="font-display text-3xl" style={{ color: 'var(--color-tinta)' }}>{totalIncidentes}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-tinta-suave)' }}>Incidentes totales</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <p className="font-display text-3xl" style={{ color: 'var(--color-musgo)' }}>{pctResueltos}%</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-tinta-suave)' }}>Resueltos</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <p className="font-display text-3xl" style={{ color: 'var(--color-guayacan)' }}>
                {promedioHoras !== null ? `${promedioHoras}h` : '—'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-tinta-suave)' }}>Tiempo promedio de resolución</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <p className="font-display text-3xl" style={{ color: 'var(--color-bosque)' }}>{pctParticipacion}%</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-tinta-suave)' }}>Residentes que participan en campañas</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-tinta)' }}>Incidentes reportados por semana</h3>
              {porSemana.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>Sin datos suficientes todavía.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={porSemana}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-borde)" />
                    <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="cantidad" stroke="var(--color-bosque)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--color-tinta)' }}>Incidentes por categoría</h3>
              {porCategoria.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>Sin datos suficientes todavía.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={porCategoria} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-borde)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="categoria" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="var(--color-guayacan)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-tinta)' }}>Exportar datos</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--color-tinta-suave)' }}>
              Para anexar al informe de evaluación del piloto.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => descargarCSV('incidentes.csv', incidentes.map((i) => ({
                  titulo: i.titulo, categoria: i.categoria, estado: i.estado,
                  creado: i.created_at, actualizado: i.actualizado_at,
                  respuesta_administracion: i.respuesta_administracion,
                })))}
                className="text-xs font-medium rounded-full px-4 py-2 border"
                style={{ borderColor: 'var(--color-borde)' }}
              >
                Exportar incidentes (CSV)
              </button>
              <button
                onClick={() => descargarCSV('participacion_campanas.csv', participaciones.map((p) => ({
                  usuario_id: p.usuario_id, campana_id: p.campana_id, fecha_inscripcion: p.fecha_inscripcion,
                })))}
                className="text-xs font-medium rounded-full px-4 py-2 border"
                style={{ borderColor: 'var(--color-borde)' }}
              >
                Exportar participación en campañas (CSV)
              </button>
              <button
                onClick={() => descargarCSV('residentes.csv', residentes.map((r) => ({
                  nombre: r.nombre_completo, aprobado: r.aprobado, registrado: r.created_at,
                })))}
                className="text-xs font-medium rounded-full px-4 py-2 border"
                style={{ borderColor: 'var(--color-borde)' }}
              >
                Exportar residentes (CSV)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
