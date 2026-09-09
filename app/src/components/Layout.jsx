import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BotonInstalarApp from './BotonInstalarApp'
import NotificacionesBell from './NotificacionesBell'

export default function Layout({ children }) {
  const { perfil, esAdministracion, esSuperAdmin, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  async function handleSalir() {
    await cerrarSesion()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
      isActive
        ? 'border-guayacan text-white'
        : 'border-transparent text-white/70 hover:text-white'
    }`

  const rolLabel = esSuperAdmin ? 'Super administración' : esAdministracion ? 'Administración de conjunto' : 'Residente'

  return (
    <div className="min-h-screen flex flex-col textura-papel" style={{ backgroundColor: 'var(--color-fondo)' }}>
      {/* Cabecera institucional: barra sólida, no chrome de SaaS genérico */}
      <header style={{ backgroundColor: 'var(--color-bosque)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <img src="/logo-emblema.png" alt="Ecosmart Residenciales" className="w-9 h-9 object-contain" />
              <div className="leading-tight">
                <div className="font-display text-base tracking-tight text-white">Ecosmart</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">Residenciales</div>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>Inicio</NavLink>
              <NavLink to="/incidentes" className={linkClass}>Incidentes</NavLink>
              <NavLink to="/campanas" className={linkClass}>Campañas</NavLink>
              {(esAdministracion || esSuperAdmin) && <NavLink to="/residentes" className={linkClass}>Residentes</NavLink>}
              {(esAdministracion || esSuperAdmin) && <NavLink to="/indicadores" className={linkClass}>Indicadores</NavLink>}
              {esSuperAdmin && <NavLink to="/admin" className={linkClass}>Panel</NavLink>}
            </nav>
            <div className="flex items-center gap-3">
              <NotificacionesBell />
              <button
                onClick={handleSalir}
                className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors text-white/90 hover:text-white border border-white/25 hover:border-white/50"
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
        <nav className="sm:hidden flex justify-around border-t border-white/10">
          <NavLink to="/" end className={linkClass}>Inicio</NavLink>
          <NavLink to="/incidentes" className={linkClass}>Incidentes</NavLink>
          <NavLink to="/campanas" className={linkClass}>Campañas</NavLink>
          {(esAdministracion || esSuperAdmin) && <NavLink to="/residentes" className={linkClass}>Residentes</NavLink>}
          {(esAdministracion || esSuperAdmin) && <NavLink to="/indicadores" className={linkClass}>Indicadores</NavLink>}
          {esSuperAdmin && <NavLink to="/admin" className={linkClass}>Panel</NavLink>}
        </nav>
      </header>
      <BotonInstalarApp />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  )
}