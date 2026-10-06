import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Campanas() {
  const { perfil, esAdministracion, esSuperAdmin } = useAuth()
  const [campanas, setCampanas] = useState([])
  const [misInscripciones, setMisInscripciones] = useState(new Set())
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verInscritosDe, setVerInscritosDe] = useState(null)

  async function cargarDatos() {
    setCargando(true)
    const { data: camps } = await supabase
      .from('campanas')
      .select('*, participaciones_campana(usuario_id, fecha_inscripcion, perfiles(nombre_completo, cedula)), conjuntos_residenciales(nombre)')
      .order('fecha_inicio', { ascending: true })
    setCampanas(camps || [])

    const { data: inscripciones } = await supabase
      .from('participaciones_campana')
      .select('campana_id')
      .eq('usuario_id', perfil.id)
    setMisInscripciones(new Set((inscripciones || []).map((i) => i.campana_id)))

    setCargando(false)
  }

  useEffect(() => {
    if (perfil) cargarDatos()
  }, [perfil])

  async function handleCrear(e) {
    e.preventDefault()
    setEnviando(true)
    await supabase.from('campanas').insert({
      conjunto_id: perfil.conjunto_id,
      creado_por: perfil.id,
      titulo,
      descripcion,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin || null,
    })
    setTitulo('')
    setDescripcion('')
    setFechaInicio('')
    setFechaFin('')
    setMostrarForm(false)
    setEnviando(false)
    cargarDatos()
  }

  async function inscribirse(campanaId) {
    await supabase.from('participaciones_campana').insert({
      campana_id: campanaId,
      usuario_id: perfil.id,
    })
    cargarDatos()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl" style={{ color: 'var(--color-bosque)' }}>Campañas ambientales</h1>
          <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
            Actividades organizadas por la administración de tu conjunto.
          </p>
        </div>
        {esAdministracion && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: 'var(--color-guayacan)', color: 'var(--color-tinta)' }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva campaña'}
          </button>
        )}
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="bg-white rounded-2xl p-6 border mb-8 space-y-4"
          style={{ borderColor: 'var(--color-borde)' }}
        >
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Título</label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Jornada de separación en la fuente"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-borde)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Descripción</label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-borde)' }}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Fecha inicio</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-borde)' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Fecha fin (opcional)</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
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
            {enviando ? 'Creando...' : 'Publicar campaña'}
          </button>
        </form>
      )}

      {cargando ? (
        <p className="text-sm font-mono" style={{ color: 'var(--color-tinta-suave)' }}>Cargando campañas...</p>
      ) : campanas.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
          Todavía no hay campañas publicadas en tu conjunto.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {(() => {
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)
            return campanas.map((c) => {
            const inscrito = misInscripciones.has(c.id)
            const inscritos = c.participaciones_campana || []
            const totalParticipantes = inscritos.length
            const finalizada = c.fecha_fin ? new Date(`${c.fecha_fin}T00:00:00`) < hoy : false
            return (
              <div key={c.id} className="bg-white rounded-2xl p-5 border flex flex-col" style={{ borderColor: 'var(--color-borde)' }}>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium" style={{ color: 'var(--color-tinta)' }}>{c.titulo}</h3>
                  {finalizada && (
                    <span
                      className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#E4E0D6', color: 'var(--color-tinta-suave)' }}
                    >
                      Finalizada
                    </span>
                  )}
                </div>
                {esSuperAdmin && c.conjuntos_residenciales?.nombre && (
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-guayacan)' }}>
                    {c.conjuntos_residenciales.nombre}
                  </p>
                )}
                <p className="text-sm mt-1 flex-1" style={{ color: 'var(--color-tinta-suave)' }}>{c.descripcion}</p>
                <p className="text-xs font-mono mt-3" style={{ color: 'var(--color-tinta-suave)' }}>
                  {new Date(c.fecha_inicio).toLocaleDateString('es-CO')}
                  {c.fecha_fin && ` — ${new Date(c.fecha_fin).toLocaleDateString('es-CO')}`}
                  {' · '}
                  {esAdministracion ? (
                    <button
                      onClick={() => setVerInscritosDe(verInscritosDe === c.id ? null : c.id)}
                      className="underline"
                      style={{ color: 'var(--color-guayacan)' }}
                    >
                      {totalParticipantes} inscritos
                    </button>
                  ) : (
                    `${totalParticipantes} inscritos`
                  )}
                </p>

                {esAdministracion && verInscritosDe === c.id && (
                  <div className="mt-2 rounded-lg p-3" style={{ backgroundColor: 'var(--color-fondo)' }}>
                    {inscritos.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--color-tinta-suave)' }}>Nadie se ha inscrito todavía.</p>
                    ) : (
                      <ul className="space-y-1">
                        {inscritos.map((i) => (
                          <li key={i.usuario_id} className="text-xs flex justify-between" style={{ color: 'var(--color-tinta)' }}>
                            <span>
                              CC {i.perfiles?.cedula || 'no registrada'} ·{' '}
                              <span style={{ textTransform: 'capitalize' }}>
                                {i.perfiles?.nombre_completo || 'Residente'}
                              </span>
                            </span>
                            <span style={{ color: 'var(--color-tinta-suave)' }}>
                              {new Date(i.fecha_inscripcion).toLocaleDateString('es-CO')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {!esAdministracion && !esSuperAdmin && (
                  <button
                    onClick={() => inscribirse(c.id)}
                    disabled={inscrito || finalizada}
                    className="mt-4 rounded-full px-4 py-2 text-sm font-medium self-start disabled:opacity-60"
                    style={
                      inscrito
                        ? { backgroundColor: '#DCE9DE', color: '#2C5E3A' }
                        : finalizada
                        ? { backgroundColor: '#E4E0D6', color: 'var(--color-tinta-suave)' }
                        : { backgroundColor: 'var(--color-bosque)', color: 'white' }
                    }
                  >
                    {inscrito ? 'Ya estás inscrito' : finalizada ? 'Campaña finalizada' : 'Participar'}
                  </button>
                )}
              </div>
            )
          })
          })()}
        </div>
      )}
    </div>
  )
}