import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Residentes() {
  const { esAdministracion, cargando: cargandoAuth } = useAuth()
  const [residentes, setResidentes] = useState([])
  const [cargando, setCargando] = useState(true)

  async function cargarResidentes() {
    setCargando(true)
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('rol', 'residente')
      .order('created_at', { ascending: false })
    setResidentes(data || [])
    setCargando(false)
  }

  useEffect(() => {
    cargarResidentes()
  }, [])

  async function aprobar(id) {
    await supabase.from('perfiles').update({ aprobado: true, rechazado: false }).eq('id', id)
    cargarResidentes()
  }

  async function noAdmitir(id) {
    if (!confirm('¿Confirmas que esta persona no pertenece a tu conjunto? Quedará bloqueada permanentemente.')) return
    await supabase.from('perfiles').update({ rechazado: true, aprobado: false }).eq('id', id)
    cargarResidentes()
  }

  async function deshacerRechazo(id) {
    await supabase.from('perfiles').update({ rechazado: false }).eq('id', id)
    cargarResidentes()
  }

  async function revocarAcceso(id) {
    await supabase.from('perfiles').update({ aprobado: false }).eq('id', id)
    cargarResidentes()
  }

  const pendientes = residentes.filter((r) => !r.aprobado && !r.rechazado)
  const aprobados = residentes.filter((r) => r.aprobado)
  const rechazados = residentes.filter((r) => r.rechazado)

  if (!cargandoAuth && !esAdministracion) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-bosque)' }}>Residentes</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-tinta-suave)' }}>
          Aprueba a las personas que realmente viven en tu conjunto antes de darles acceso.
        </p>
      </div>

      {cargando ? (
        <p className="text-sm font-mono" style={{ color: 'var(--color-tinta-suave)' }}>Cargando...</p>
      ) : (
        <>
          <h2 className="font-display text-lg mb-3" style={{ color: 'var(--color-tinta)' }}>
            Pendientes de aprobación {pendientes.length > 0 && `(${pendientes.length})`}
          </h2>
          {pendientes.length === 0 ? (
            <p className="text-sm mb-8" style={{ color: 'var(--color-tinta-suave)' }}>No hay registros pendientes.</p>
          ) : (
            <div className="space-y-3 mb-10">
              {pendientes.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: 'var(--color-borde)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-tinta)' }}>
                      CC {r.cedula || 'no registrada'} ·{' '}
                      <span style={{ textTransform: 'capitalize' }}>{r.nombre_completo}</span>
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--color-tinta-suave)' }}>
                      Registrado el {new Date(r.created_at).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => noAdmitir(r.id)}
                      className="text-xs font-medium rounded-full px-3 py-1.5 border"
                      style={{ borderColor: 'var(--color-alerta)', color: 'var(--color-alerta)' }}
                    >
                      No admitir
                    </button>
                    <button
                      onClick={() => aprobar(r.id)}
                      className="text-xs font-medium rounded-full px-3 py-1.5 text-white"
                      style={{ backgroundColor: 'var(--color-musgo)' }}
                    >
                      Aprobar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-display text-lg mb-3" style={{ color: 'var(--color-tinta)' }}>
            Residentes aprobados ({aprobados.length})
          </h2>
          {aprobados.length === 0 ? (
            <p className="text-sm mb-8" style={{ color: 'var(--color-tinta-suave)' }}>Todavía no hay residentes aprobados.</p>
          ) : (
            <div className="space-y-2 mb-10">
              {aprobados.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-3 border flex items-center justify-between" style={{ borderColor: 'var(--color-borde)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-tinta)' }}>
                    CC {r.cedula || 'no registrada'} ·{' '}
                    <span style={{ textTransform: 'capitalize' }}>{r.nombre_completo}</span>
                  </p>
                  <button
                    onClick={() => revocarAcceso(r.id)}
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-alerta)' }}
                  >
                    Revocar acceso
                  </button>
                </div>
              ))}
            </div>
          )}

          {rechazados.length > 0 && (
            <>
              <h2 className="font-display text-lg mb-3" style={{ color: 'var(--color-tinta)' }}>
                No admitidos ({rechazados.length})
              </h2>
              <div className="space-y-2">
                {rechazados.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-3 border flex items-center justify-between" style={{ borderColor: 'var(--color-borde)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
                      CC {r.cedula || 'no registrada'} ·{' '}
                      <span style={{ textTransform: 'capitalize' }}>{r.nombre_completo}</span>
                    </p>
                    <button
                      onClick={() => deshacerRechazo(r.id)}
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-guayacan)' }}
                    >
                      Fue un error, deshacer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}