import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import CampoContrasena from '../components/CampoContrasena'
import RequisitosContrasena, { contrasenaEsValida } from '../components/RequisitosContrasena'

export default function RestablecerContrasena() {
  const [listo, setListo] = useState(false)
  const [linkExpirado, setLinkExpirado] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase pone el error directamente en el hash de la URL cuando el
    // link de recuperación ya expiró o ya fue usado, ej:
    // #error=access_denied&error_code=otp_expired&error_description=...
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const codigo = params.get('error_code')
      if (codigo === 'otp_expired') {
        setLinkExpirado(true)
      } else {
        setLinkExpirado(true) // cualquier otro error también lo tratamos como link inválido
      }
      return
    }

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-4 textura-papel" style={{ backgroundColor: 'var(--color-fondo)' }}>
      <img
        src="/logo-emblema.png"
        alt="Ecosmart Residenciales"
        className="w-36 h-36 object-contain mb-1"
      />
      <span className="font-display text-2xl text-center" style={{ color: 'var(--color-bosque)' }}>
        Ecosmart Residenciales
      </span>

      <div className="w-full max-w-sm mt-2">
        <div className="bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: 'var(--color-borde)' }}>
          {linkExpirado ? (
            <div className="text-center">
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--color-tinta)' }}>Enlace vencido</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-tinta-suave)' }}>
                Este enlace de recuperación ya expiró o ya fue usado antes.
                Vuelve a iniciar sesión y solicita uno nuevo.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-full px-5 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-bosque)' }}
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : !listo ? (
            <p className="text-sm text-center font-mono" style={{ color: 'var(--color-tinta-suave)' }}>
              Verificando el enlace...
            </p>
          ) : exito ? (
            <div className="text-center">
              <span className="w-4 h-4 badge-hoja inline-block mb-3" style={{ backgroundColor: 'var(--color-guayacan)' }} />
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--color-tinta)' }}>Contraseña actualizada</h2>
              <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>Te llevamos a iniciar sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-display text-lg mb-1" style={{ color: 'var(--color-tinta)' }}>Nueva contraseña</h2>
              <p className="text-xs mb-4" style={{ color: 'var(--color-tinta-suave)' }}>
                Elige una contraseña segura para tu cuenta.
              </p>

              {error && (
                <div className="text-sm px-3 py-2 mb-3 border-l-4" style={{ backgroundColor: '#F6E7E1', color: 'var(--color-alerta)', borderColor: 'var(--color-alerta)' }}>
                  {error}
                </div>
              )}

              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Nueva contraseña</label>
              <div className="mb-1">
                <CampoContrasena value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              <RequisitosContrasena password={password} />

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-full py-2 mt-1 text-sm font-medium text-white disabled:opacity-60"
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