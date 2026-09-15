import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function NotificacionesBell() {
  const { usuario } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)
  const navigate = useNavigate()

  async function cargar() {
    if (!usuario) return
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15)
    setNotificaciones(data || [])
  }

  useEffect(() => {
    cargar()
    // Refresca cada 30s — suficiente para un piloto, sin depender de websockets.
    const intervalo = setInterval(cargar, 30000)
    return () => clearInterval(intervalo)
  }, [usuario])

  useEffect(() => {
    function alClicFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  async function marcarLeidaYAbrir(n) {
    if (!n.leida) {
      await supabase.from('notificaciones').update({ leida: true }).eq('id', n.id)
      setNotificaciones((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)))
    }
    setAbierto(false)
    navigate(n.incidente_id ? '/incidentes' : '/campanas')
  }

  async function marcarTodasLeidas() {
    const idsNoLeidas = notificaciones.filter((n) => !n.leida).map((n) => n.id)
    if (idsNoLeidas.length === 0) return
    await supabase.from('notificaciones').update({ leida: true }).in('id', idsNoLeidas)
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  if (!usuario) return null

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative p-2 rounded-full hover:bg-black/5"
        aria-label="Notificaciones"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-tinta)' }}>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {noLeidas > 0 && (
          <span
            className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-alerta)' }}
          >
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div
         className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-80 max-w-[calc(100vw-1rem)] max-h-96 overflow-y-auto bg-white rounded-2xl border shadow-lg z-50"
          style={{ borderColor: 'var(--color-borde)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-borde)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--color-tinta)' }}>Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={marcarTodasLeidas} className="text-xs font-medium" style={{ color: 'var(--color-bosque)' }}>
                Marcar todas leídas
              </button>
            )}
          </div>
          {notificaciones.length === 0 ? (
            <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--color-tinta-suave)' }}>
              No tienes notificaciones todavía.
            </p>
          ) : (
            notificaciones.map((n) => (
              <button
                key={n.id}
                onClick={() => marcarLeidaYAbrir(n)}
                className="w-full text-left px-4 py-3 border-b last:border-0 hover:bg-black/[0.02]"
                style={{ borderColor: 'var(--color-borde)', backgroundColor: n.leida ? 'white' : 'var(--color-guayacan-suave)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-tinta)' }}>{n.titulo}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-tinta-suave)' }}>{n.mensaje}</p>
                <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--color-tinta-suave)' }}>
                  {new Date(n.created_at).toLocaleString('es-CO')}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
