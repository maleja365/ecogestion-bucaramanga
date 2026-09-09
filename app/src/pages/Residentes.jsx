import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Residentes() {
  const { esAdministracion, esSuperAdmin } = useAuth()
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
    await supabase.from('perfiles').update({ aprobado: true }).eq('id', id)
    cargarResidentes()
  }

  async function rechazar(id) {
    // "Rechazar" no borra la cuenta (no tenemos permisos de admin de Auth
    // desde el frontend); simplemente la deja sin aprobar y visible aquí
    // para que la administración decida si contactar a la persona.
    await supabase.from('perfiles').update({ aprobado: false }).eq('id', id)
    cargarResidentes()
  }

  const pendientes = residentes.filter((r) => !r.aprobado)
  const aprobados = residentes.filter((r) => r.aprobado)

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
                <div key={r.id} className="ficha p-4 flex items-center justify-between" style={{ borderLeftColor: 'var(--color-alerta)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-tinta)' }}>{r.nombre_completo}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-tinta-suave)' }}>
                      C.C. {r.cedula || 'Sin registrar'}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--color-tinta-suave)' }}>
                      Registrado el {new Date(r.created_at).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
          <div className="space-y-2">
            {aprobados.map((r) => (
              <div key={r.id} className="ficha p-3 flex items-center justify-between" style={{ borderLeftColor: 'var(--color-musgo)' }}>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-tinta)' }}>{r.nombre_completo}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-tinta-suave)' }}>C.C. {r.cedula || 'Sin registrar'}</p>
                </div>
                <button
                  onClick={() => rechazar(r.id)}
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-alerta)' }}
                >
                  Revocar acceso
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}