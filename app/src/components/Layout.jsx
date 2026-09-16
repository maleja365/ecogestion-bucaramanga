import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificacionesBell from './NotificacionesBell'

export default function Layout({ children }) {
  const { perfil, esAdministracion, esSuperAdmin, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  async function handleSalir() {
    await cerrarSesion()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
      isActive
        ? 'border-guayacan text-white'
        : 'border-transparent text-white/70 hover:text-white'
    }`

  const rolLabel = esSuperAdmin ? 'Super administración' : esAdministracion ? 'Administración de conjunto' : 'Residente'

  return (
    <div className="min-h-screen flex flex-col textura-papel overflow-x-hidden" style={{ backgroundColor: 'var(--color-fondo)' }}>
      {/* Cabecera institucional: barra sólida, no chrome de SaaS genérico */}
      <header style={{ backgroundColor: 'var(--color-bosque)' }}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo-emblema.png" alt="Ecosmart Residenciales" className="w-11 h-11 sm:w-12 sm:h-12 object-contain flex-shrink-0" />
              <div className="leading-tight min-w-0">
                <div className="font-display text-lg tracking-tight text-white truncate">Ecosmart</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/60 truncate">Residenciales</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <NotificacionesBell />
              <button
                onClick={handleSalir}
                className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-full transition-colors text-white/90 hover:text-white border border-white/25 hover:border-white/50 whitespace-nowrap"
              >
                Salir
              </button>
            </div>
          </div>
          {perfil && (
            <div className="hidden sm:block pb-2 -mt-1 text-xs font-mono text-white/50">
              {perfil.nombre_completo} · {rolLabel}
            </div>
          )}
        </div>

        {/* Una sola barra de navegación, para todos los tamaños de pantalla.
            Si no cabe, se desliza horizontalmente en vez de cortarse. */}
        <nav
          className="flex items-center gap-1 border-t border-white/10 overflow-x-auto px-3 sm:px-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="max-w-5xl mx-auto w-full flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Inicio</NavLink>
            <NavLink to="/incidentes" className={linkClass}>Incidentes</NavLink>
            <NavLink to="/campanas" className={linkClass}>Campañas</NavLink>
            {esAdministracion && <NavLink to="/residentes" className={linkClass}>Residentes</NavLink>}
            {esSuperAdmin && <NavLink to="/indicadores" className={linkClass}>Indicadores</NavLink>}
            {esSuperAdmin && <NavLink to="/admin" className={linkClass}>Panel</NavLink>}
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 overflow-x-hidden">{children}</main>
    </div>
  )
}