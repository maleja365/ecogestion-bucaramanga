import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import CampoContrasena from '../components/CampoContrasena'
import BotonInstalarApp from '../components/BotonInstalarApp'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setCargando(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-fondo)' }}>
      <BotonInstalarApp />

      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo-emblema.png" alt="Ecosmart Residenciales" className="w-36 h-36 object-contain mb-1" />
          <span className="font-display text-2xl text-center" style={{ color: 'var(--color-bosque)' }}>
            Ecosmart Residenciales
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 border shadow-sm"
          style={{ borderColor: 'var(--color-borde)' }}
        >
          <h1 className="font-display text-xl mb-1" style={{ color: 'var(--color-tinta)' }}>Ingresar</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-tinta-suave)' }}>
            Accede con tu correo del conjunto residencial.
          </p>

          {error && (
            <div
              className="text-sm rounded-lg px-3 py-2 mb-4"
              style={{ backgroundColor: '#F6E7E1', color: 'var(--color-alerta)' }}
            >
              {error}
            </div>
          )}

          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 mb-4 text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-borde)' }}
          />

          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--color-tinta-suave)' }}>
              Contraseña
            </label>
            <Link to="/recuperar" className="text-xs font-medium" style={{ color: 'var(--color-bosque)' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="mb-6">
            <CampoContrasena value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-bosque)' }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--color-tinta-suave)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium" style={{ color: 'var(--color-bosque)' }}>
              Regístrate
            </Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  )
}