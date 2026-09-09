import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    })
    setCargando(false)
    if (error) {
      setError(error.message)
      return
    }
    setEnviado(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-4 textura-papel" style={{ backgroundColor: 'var(--color-fondo)' }}>
      <img src="/logo-emblema.png" alt="Ecosmart Residenciales" className="w-36 h-36 object-contain mb-1" />
      <span className="font-display text-2xl text-center" style={{ color: 'var(--color-bosque)' }}>
        Ecosmart Residenciales
      </span>

      <div className="w-full max-w-sm mt-2">
        <div className="bg-white rounded-xl border shadow-sm p-8" style={{ borderColor: 'var(--color-borde)' }}>
          {enviado ? (
            <>
              <span className="w-4 h-4 badge-hoja inline-block mb-3" style={{ backgroundColor: 'var(--color-guayacan)' }} />
              <h1 className="font-display text-xl mb-2" style={{ color: 'var(--color-tinta)' }}>Revisa tu correo</h1>
              <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
                Te enviamos un enlace a <strong>{email}</strong> para que definas una nueva contraseña.
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="font-display text-xl mb-1" style={{ color: 'var(--color-tinta)' }}>Recuperar contraseña</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-tinta-suave)' }}>
                Te enviaremos un enlace a tu correo para que la restablezcas.
              </p>

              {error && (
                <div className="text-sm rounded-lg px-3 py-2 mb-4" style={{ backgroundColor: '#F6E7E1', color: 'var(--color-alerta)' }}>
                  {error}
                </div>
              )}

              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 mb-6 text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-borde)' }}
              />

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-full py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-bosque)' }}
              >
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          )}

          <p className="text-sm text-center mt-6" style={{ color: 'var(--color-tinta-suave)' }}>
            <Link to="/login" className="font-medium" style={{ color: 'var(--color-bosque)' }}>
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
