import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import EstadoBadge from '../components/EstadoBadge'

const CATEGORIAS = [
  { value: 'residuos_mal_separados', label: 'Residuos mal separados' },
  { value: 'contenedor_dañado', label: 'Contenedor dañado' },
  { value: 'acumulacion_basura', label: 'Acumulación de basura' },
  { value: 'falta_recoleccion', label: 'Falta de recolección' },
  { value: 'otro', label: 'Otro' },
]

export default function Incidentes() {
  const { perfil, esAdministracion } = useAuth()
  const [incidentes, setIncidentes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('otro')
  const [foto, setFoto] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  // Respuesta de administración: qué incidente se está respondiendo ahora mismo
  const [respondiendoId, setRespondiendoId] = useState(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')

  async function cargarIncidentes() {
    setCargando(true)
    const { data } = await supabase
      .from('incidentes')
      .select('*, perfiles(nombre_completo)')
      .order('created_at', { ascending: false })
    setIncidentes(data || [])
    setCargando(false)
  }

  useEffect(() => {
    if (perfil) cargarIncidentes()
  }, [perfil])

  async function subirFoto(incidenteId) {
    if (!foto) return null
    setSubiendoFoto(true)
    const extension = foto.name.split('.').pop()
    const ruta = `${perfil.id}/${incidenteId}.${extension}`
    const { error } = await supabase.storage.from('incidentes-fotos').upload(ruta, foto, { upsert: true })
    setSubiendoFoto(false)
    if (error) {
      console.error('Error subiendo foto:', error.message)
      return null
    }
    const { data } = supabase.storage.from('incidentes-fotos').getPublicUrl(ruta)
    return data.publicUrl
  }

  async function handleCrear(e) {
    e.preventDefault()
    setEnviando(true)

    const { data: nuevo, error } = await supabase
      .from('incidentes')
      .insert({
        usuario_id: perfil.id,
        conjunto_id: perfil.conjunto_id,
        titulo,
        descripcion,
        categoria,
      })
      .select()
      .single()

    if (!error && nuevo && foto) {
      const url = await subirFoto(nuevo.id)
      if (url) {
        await supabase.from('incidentes').update({ foto_url: url }).eq('id', nuevo.id)
      }
    }

    setTitulo('')
    setDescripcion('')
    setCategoria('otro')
    setFoto(null)
    setMostrarForm(false)
    setEnviando(false)
    cargarIncidentes()
  }

  async function cambiarEstado(id, estado, respuesta = null) {
    const payload = { estado, actualizado_at: new Date().toISOString() }
    if (respuesta !== null) payload.respuesta_administracion = respuesta
    await supabase.from('incidentes').update(payload).eq('id', id)
    setRespondiendoId(null)
    setTextoRespuesta('')
    cargarIncidentes()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl" style={{ color: 'var(--color-bosque)' }}>Incidentes ambientales</h1>
          <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
            Reporta y consulta el estado de los problemas en tu conjunto.
          </p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-full px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-guayacan)', color: 'var(--color-tinta)' }}
        >
          {mostrarForm ? 'Cancelar' : '+ Reportar'}
        </button>
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
              placeholder="Ej: Contenedor de la torre 3 desbordado"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-borde)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white"
              style={{ borderColor: 'var(--color-borde)' }}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Descripción</label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué pasó, dónde y desde cuándo."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-borde)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>
              Foto de evidencia (opcional)
            </label>
            <label
              htmlFor="foto-incidente"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium cursor-pointer border transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: 'var(--color-borde)', color: 'var(--color-tinta)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {foto ? 'Cambiar foto' : 'Subir foto'}
            </label>
            <input
              id="foto-incidente"
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              className="hidden"
            />
            {foto && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-musgo)' }}>✓ {foto.name}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={enviando || subiendoFoto}
            className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-bosque)' }}
          >
            {enviando || subiendoFoto ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </form>
      )}

      {cargando ? (
        <p className="text-sm font-mono" style={{ color: 'var(--color-tinta-suave)' }}>Cargando incidentes...</p>
      ) : incidentes.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
          Todavía no hay incidentes reportados en tu conjunto.
        </p>
      ) : (
        <div className="space-y-3">
          {incidentes.map((inc) => (
            <div key={inc.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--color-borde)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: 'var(--color-tinta)' }}>{inc.titulo}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-tinta-suave)' }}>{inc.descripcion}</p>
                  <p className="text-xs font-mono mt-2" style={{ color: 'var(--color-tinta-suave)' }}>
                    {inc.perfiles?.nombre_completo} · {new Date(inc.created_at).toLocaleDateString('es-CO')}
                  </p>
                  {inc.foto_url && (
                    <a href={inc.foto_url} target="_blank" rel="noreferrer" className="inline-block mt-3">
                      <img
                        src={inc.foto_url}
                        alt="Evidencia del incidente"
                        className="w-28 h-28 object-cover rounded-lg border"
                        style={{ borderColor: 'var(--color-borde)' }}
                      />
                    </a>
                  )}
                  {inc.respuesta_administracion && (
                    <div
                      className="mt-3 text-sm rounded-lg px-3 py-2"
                      style={{ backgroundColor: 'var(--color-guayacan-suave)', color: 'var(--color-tinta)' }}
                    >
                      <span className="font-medium">Respuesta de la administración: </span>
                      {inc.respuesta_administracion}
                    </div>
                  )}
                </div>
                <EstadoBadge estado={inc.estado} />
              </div>

              {esAdministracion && inc.estado !== 'resuelto' && (
                <div className="mt-4">
                  {respondiendoId === inc.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={textoRespuesta}
                        onChange={(e) => setTextoRespuesta(e.target.value)}
                        placeholder="Explica qué se hizo con este incidente (se le notifica al residente)..."
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: 'var(--color-borde)' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => cambiarEstado(inc.id, 'resuelto', textoRespuesta)}
                          className="text-xs font-medium rounded-full px-3 py-1.5 text-white"
                          style={{ backgroundColor: 'var(--color-musgo)' }}
                        >
                          Guardar y marcar resuelto
                        </button>
                        <button
                          onClick={() => { setRespondiendoId(null); setTextoRespuesta('') }}
                          className="text-xs font-medium rounded-full px-3 py-1.5 border"
                          style={{ borderColor: 'var(--color-borde)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {inc.estado === 'pendiente' && (
                        <button
                          onClick={() => cambiarEstado(inc.id, 'en_revision')}
                          className="text-xs font-medium rounded-full px-3 py-1.5 border"
                          style={{ borderColor: 'var(--color-borde)' }}
                        >
                          Marcar en revisión
                        </button>
                      )}
                      <button
                        onClick={() => { setRespondiendoId(inc.id); setTextoRespuesta(inc.respuesta_administracion || '') }}
                        className="text-xs font-medium rounded-full px-3 py-1.5 text-white"
                        style={{ backgroundColor: 'var(--color-musgo)' }}
                      >
                        Marcar resuelto...
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}