import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import CampoContrasena from '../components/CampoContrasena'
import RequisitosContrasena, { contrasenaEsValida } from '../components/RequisitosContrasena'

export default function RestablecerContrasena() {
  const [listo, setListo] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setListo(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setListo(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!contrasenaEsValida(password)) {
      setError('La contraseña no cumple los requisitos de seguridad.')
      return
    }
    setCargando(true)
    const { error } = await supabase.auth.updateUser({ password })
    setCargando(false)
    if (error) {
      setError(error.message)
      return
    }
    setExito(true)
    setTimeout(() => navigate('/login'), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col items-center justify-center py-10 px-4" style={{ backgroundColor: 'var(--color-bosque)' }}>
        <img src="/logo-emblema.png" alt="Ecosmart Residenciales" className="w-20 h-20 object-contain" />
        <h1 className="font-display text-2xl text-white text-center mt-3">Ecosmart Residenciales</h1>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-12 textura-papel" style={{ backgroundColor: 'var(--color-fondo)' }}>
        <div className="w-full max-w-sm ficha p-8" style={{ borderLeftColor: 'var(--color-musgo)' }}>
          {!listo ? (
            <p className="text-sm text-center font-mono" style={{ color: 'var(--color-tinta-suave)' }}>
              Verificando el enlace...
            </p>
          ) : exito ? (
            <>
              <span className="w-4 h-4 badge-hoja inline-block mb-3" style={{ backgroundColor: 'var(--color-guayacan)' }} />
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--color-tinta)' }}>Contraseña actualizada</h2>
              <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>Te llevamos a iniciar sesión...</p>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-display text-xl mb-1" style={{ color: 'var(--color-tinta)' }}>Nueva contraseña</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-tinta-suave)' }}>
                Elige una contraseña segura para tu cuenta.
              </p>

              {error && (
                <div className="text-sm px-3 py-2 mb-4 border-l-4" style={{ backgroundColor: '#F6E7E1', color: 'var(--color-alerta)', borderColor: 'var(--color-alerta)' }}>
                  {error}
                </div>
              )}

              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Nueva contraseña</label>
              <div className="mb-2">
                <CampoContrasena value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              <RequisitosContrasena password={password} />

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-full py-2.5 text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-bosque)' }}
              >
                {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
