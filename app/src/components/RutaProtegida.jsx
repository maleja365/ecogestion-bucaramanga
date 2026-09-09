import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children }) {
  const { usuario, cargando, perfil, pendienteAprobacion, recargarPerfil, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
        Cargando...
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (perfil && pendienteAprobacion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 textura-papel" style={{ backgroundColor: 'var(--color-fondo)' }}>
        <div className="w-full max-w-sm ficha p-8 text-center" style={{ borderLeftColor: 'var(--color-guayacan)' }}>
          <span className="w-4 h-4 badge-hoja inline-block mb-3" style={{ backgroundColor: 'var(--color-guayacan)' }} />
          <h1 className="font-display text-xl mb-2" style={{ color: 'var(--color-tinta)' }}>
            Tu registro está pendiente
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
            La administración de tu conjunto necesita confirmar que resides ahí antes
            de darte acceso. Esto normalmente toma poco tiempo.
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <button
              onClick={recargarPerfil}
              className="rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-bosque)' }}
            >
              Ya me aprobaron, revisar
            </button>
            <button
              onClick={async () => { await cerrarSesion(); navigate('/login') }}
              className="rounded-full px-4 py-2 text-sm font-medium border"
              style={{ borderColor: 'var(--color-borde)', color: 'var(--color-tinta)' }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
