import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Inicio() {
  const { perfil, esSuperAdmin } = useAuth()
  const [stats, setStats] = useState({ pendientes: 0, resueltos: 0, campanasActivas: 0 })

  useEffect(() => {
    if (!perfil) return
    async function cargar() {
      const { count: pendientes } = await supabase
        .from('incidentes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
      const { count: resueltos } = await supabase
        .from('incidentes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'resuelto')
      const { count: campanasActivas } = await supabase
        .from('campanas')
        .select('*', { count: 'exact', head: true })
        .eq('activa', true)
      setStats({ pendientes: pendientes ?? 0, resueltos: resueltos ?? 0, campanasActivas: campanasActivas ?? 0 })
    }
    cargar()
  }, [perfil])

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl" style={{ color: 'var(--color-bosque)' }}>
          Hola, {perfil?.nombre_completo?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-2 max-w-md" style={{ color: 'var(--color-tinta-suave)' }}>
          {esSuperAdmin ? (
            <>Esto es lo que pasa en <strong style={{ color: 'var(--color-tinta)' }}>los conjuntos de Bucaramanga y su área metropolitana</strong>.</>
          ) : (
            <>Esto es lo que pasa en <strong style={{ color: 'var(--color-tinta)' }}>{perfil?.conjunto_nombre || 'tu conjunto'}</strong>.
            Reporta lo que ves y participa en las campañas para que la separación de residuos funcione de verdad.</>
          )}
        </p>
      </div>

      {/* Un solo elemento con la silueta de hoja — el dato que más pide acción */}
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 mb-8 items-stretch">
        <div
          className="silueta-hoja-grande p-7 flex flex-col justify-between"
          style={{ backgroundColor: stats.pendientes > 0 ? 'var(--color-alerta)' : 'var(--color-bosque)' }}
        >
          <span className="text-xs font-mono text-white/70">Requiere atención</span>
          <div>
            <p className="font-display text-6xl text-white leading-none">{stats.pendientes}</p>
            <p className="text-sm mt-2 text-white/85">
              {stats.pendientes === 1 ? 'incidente pendiente por revisar' : 'incidentes pendientes por revisar'}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-0 divide-y" style={{ borderColor: 'var(--color-borde)' }}>
          <div className="flex items-baseline justify-between py-4">
            <span className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>Incidentes resueltos</span>
            <span className="font-display text-3xl" style={{ color: 'var(--color-musgo)' }}>{stats.resueltos}</span>
          </div>
          <div className="flex items-baseline justify-between py-4">
            <span className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>Campañas activas</span>
            <span className="font-display text-3xl" style={{ color: 'var(--color-guayacan)' }}>{stats.campanasActivas}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!esSuperAdmin && (
          <Link
            to="/incidentes"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-bosque)' }}
          >
            Reportar un incidente
          </Link>
        )}
        <Link
          to="/campanas"
          className="rounded-full px-5 py-2.5 text-sm font-medium border"
          style={{ borderColor: 'var(--color-borde)', color: 'var(--color-tinta)' }}
        >
          Ver campañas
        </Link>
      </div>
    </div>
  )
}