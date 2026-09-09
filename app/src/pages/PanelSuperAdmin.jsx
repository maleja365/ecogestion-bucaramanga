import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function PanelSuperAdmin() {
  const { esSuperAdmin, cargando: cargandoAuth } = useAuth()
  const [conjuntos, setConjuntos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('Bucaramanga')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function cargarConjuntos() {
    setCargando(true)
    const { data, error } = await supabase
      .from('conjuntos_residenciales')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setConjuntos(data || [])
    setCargando(false)
  }

  useEffect(() => {
    cargarConjuntos()
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    const { error } = await supabase
      .from('conjuntos_residenciales')
      .insert({ nombre, direccion, ciudad })
    setEnviando(false)
    if (error) {
      setError(error.message)
      return
    }
    setNombre('')
    setDireccion('')
    cargarConjuntos()
  }

  if (!cargandoAuth && !esSuperAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-musgo)' }}>
          Solo super administrador
        </span>
        <h1 className="font-display text-2xl mt-1" style={{ color: 'var(--color-bosque)' }}>
          Panel de conjuntos residenciales
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-tinta-suave)' }}>
          Crea un conjunto y comparte su código de administración con la persona
          encargada de gestionarlo — solo con ese código podrá registrarse como administración.
        </p>
      </div>

      <form onSubmit={handleCrear} className="ficha p-6 mb-8 space-y-4" style={{ borderLeftColor: 'var(--color-guayacan)' }}>
        <h2 className="font-display text-lg" style={{ color: 'var(--color-tinta)' }}>Nuevo conjunto</h2>
        {error && (
          <div className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#F6E7E1', color: 'var(--color-alerta)' }}>
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Nombre del conjunto</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Conjunto Residencial Los Cerezos"
            className="w-full border px-3 py-2 text-sm outline-none bg-white"
            style={{ borderColor: 'var(--color-borde)' }}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Dirección</label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border px-3 py-2 text-sm outline-none bg-white"
              style={{ borderColor: 'var(--color-borde)' }}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Ciudad</label>
            <input
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full border px-3 py-2 text-sm outline-none bg-white"
              style={{ borderColor: 'var(--color-borde)' }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-bosque)' }}
        >
          {enviando ? 'Creando...' : 'Crear conjunto'}
        </button>
      </form>

      {cargando ? (
        <p className="text-sm font-mono" style={{ color: 'var(--color-tinta-suave)' }}>Cargando conjuntos...</p>
      ) : (
        <div className="space-y-3">
          {conjuntos.map((c) => (
            <div key={c.id} className="ficha p-5 flex items-center justify-between" style={{ borderLeftColor: 'var(--color-bosque)' }}>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-tinta)' }}>{c.nombre}</h3>
                <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>{c.direccion} · {c.ciudad}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-tinta-suave)' }}>Código de administración</p>
                <p
                  className="font-mono text-lg tracking-wider mt-1 px-3 py-1"
                  style={{ backgroundColor: 'var(--color-guayacan-suave)', color: 'var(--color-tinta)' }}
                >
                  {c.codigo_administracion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
