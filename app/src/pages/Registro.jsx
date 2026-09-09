import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import CampoContrasena from '../components/CampoContrasena'
import RequisitosContrasena, { contrasenaEsValida } from '../components/RequisitosContrasena'

export default function Registro() {
  const [tipoRegistro, setTipoRegistro] = useState('residente') // 'residente' | 'administracion'
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [conjuntoId, setConjuntoId] = useState('')
  const [conjuntos, setConjuntos] = useState([])
  const [codigoAdmin, setCodigoAdmin] = useState('')
  const [conjuntoValidado, setConjuntoValidado] = useState(null)
  const [validandoCodigo, setValidandoCodigo] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [registroExitoso, setRegistroExitoso] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('conjuntos_publico')
      .select('id, nombre')
      .then(({ data }) => {
        setConjuntos(data || [])
        if (data?.[0]) setConjuntoId(data[0].id)
      })
  }, [])

  async function validarCodigo(codigo) {
    setCodigoAdmin(codigo)
    setConjuntoValidado(null)
    if (codigo.length < 4) return
    setValidandoCodigo(true)
    const { data } = await supabase.rpc('validar_codigo_administracion', { codigo })
    setValidandoCodigo(false)
    if (data && data.length > 0) {
      setConjuntoValidado(data[0])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (tipoRegistro === 'administracion' && !conjuntoValidado) {
      setError('El código de administración no es válido. Verifica que esté bien escrito.')
      return
    }

    if (!/^[0-9]{6,12}$/.test(cedula)) {
      setError('Ingresa un número de cédula válido (solo números, entre 6 y 12 dígitos).')
      return
    }

    if (!contrasenaEsValida(password)) {
      setError('La contraseña no cumple los requisitos de seguridad.')
      return
    }

    setCargando(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombre,
          cedula: cedula,
          telefono: telefono,
          tipo_registro: tipoRegistro,
          conjunto_id: tipoRegistro === 'residente' ? conjuntoId || null : conjuntoValidado?.conjunto_id,
          codigo_admin: tipoRegistro === 'administracion' ? codigoAdmin : null,
        },
      },
    })

    setCargando(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      navigate('/')
    } else {
      setRegistroExitoso(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-4 textura-papel" style={{ backgroundColor: 'var(--color-fondo)' }}>
      {/* Logo institucional grande, igual que en Login, para mantener
          la misma identidad visual entre inicio de sesión y registro. */}
      <img
        src="/logo-emblema.png"
        alt="Ecosmart Residenciales"
        className="w-36 h-36 object-contain mb-1"
      />
      <span className="font-display text-2xl text-center" style={{ color: 'var(--color-bosque)' }}>
        Ecosmart Residenciales
      </span>

      <div className="w-full max-w-sm mt-2">
        {registroExitoso ? (
          <div className="bg-white rounded-xl border shadow-sm p-8 text-center" style={{ borderColor: 'var(--color-borde)' }}>
            <span className="w-4 h-4 badge-hoja inline-block mb-3" style={{ backgroundColor: 'var(--color-guayacan)' }} />
            <h1 className="font-display text-xl mb-2" style={{ color: 'var(--color-tinta)' }}>Revisa tu correo</h1>
            <p className="text-sm" style={{ color: 'var(--color-tinta-suave)' }}>
              Te enviamos un enlace de confirmación a <strong>{email}</strong>.
              Ábrelo para activar tu cuenta y luego regresa a iniciar sesión.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 rounded-full px-5 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-bosque)' }}
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: 'var(--color-borde)' }}>
          <h2 className="font-display text-lg mb-1" style={{ color: 'var(--color-tinta)' }}>Crear cuenta</h2>
          <p className="text-xs mb-2" style={{ color: 'var(--color-tinta-suave)' }}>
            {tipoRegistro === 'residente'
              ? 'Regístrate como residente de tu conjunto.'
              : 'Regístrate como administración con tu código de invitación.'}
          </p>

          <div className="flex mb-3 border" style={{ borderColor: 'var(--color-borde)' }}>
            <button
              type="button"
              onClick={() => setTipoRegistro('residente')}
              className="flex-1 text-xs font-medium py-1.5 transition-colors"
              style={
                tipoRegistro === 'residente'
                  ? { backgroundColor: 'var(--color-bosque)', color: 'white' }
                  : { color: 'var(--color-tinta-suave)', backgroundColor: 'white' }
              }
            >
              Soy residente
            </button>
            <button
              type="button"
              onClick={() => setTipoRegistro('administracion')}
              className="flex-1 text-xs font-medium py-1.5 transition-colors"
              style={
                tipoRegistro === 'administracion'
                  ? { backgroundColor: 'var(--color-bosque)', color: 'white' }
                  : { color: 'var(--color-tinta-suave)', backgroundColor: 'white' }
              }
            >
              Soy administración
            </button>
          </div>

          {error && (
            <div className="text-sm px-3 py-2 mb-3 border-l-4" style={{ backgroundColor: '#F6E7E1', color: 'var(--color-alerta)', borderColor: 'var(--color-alerta)' }}>
              {error}
            </div>
          )}

          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Nombre completo</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border px-3 py-1.5 mb-3 text-sm outline-none bg-white"
            style={{ borderColor: 'var(--color-borde)' }}
          />

          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Número de cédula</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={cedula}
            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
            className="w-full border px-3 py-1.5 mb-3 text-sm outline-none bg-white"
            style={{ borderColor: 'var(--color-borde)' }}
          />

          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Número de teléfono</label>
          <input
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border px-3 py-1.5 mb-3 text-sm outline-none bg-white"
            style={{ borderColor: 'var(--color-borde)' }}
          />

          {tipoRegistro === 'residente' ? (
            <>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Conjunto residencial</label>
              <select
                value={conjuntoId}
                onChange={(e) => setConjuntoId(e.target.value)}
                className="w-full border px-3 py-1.5 mb-3 text-sm outline-none bg-white"
                style={{ borderColor: 'var(--color-borde)' }}
              >
                {conjuntos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>
                Código de administración
              </label>
              <input
                required
                value={codigoAdmin}
                onChange={(e) => validarCodigo(e.target.value.toUpperCase())}
                placeholder="Te lo entrega la desarrolladora"
                className="w-full border px-3 py-1.5 mb-1 text-sm outline-none font-mono uppercase bg-white"
                style={{ borderColor: 'var(--color-borde)' }}
              />
              {(validandoCodigo || codigoAdmin) && (
                <p className="text-xs mb-3" style={{ color: conjuntoValidado ? 'var(--color-musgo)' : 'var(--color-tinta-suave)' }}>
                  {validandoCodigo
                    ? 'Verificando...'
                    : conjuntoValidado
                    ? `✓ Código válido — ${conjuntoValidado.conjunto_nombre}`
                    : 'Código no encontrado.'}
                </p>
              )}
              {!codigoAdmin && <div className="mb-3" />}
            </>
          )}

          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-1.5 mb-3 text-sm outline-none bg-white"
            style={{ borderColor: 'var(--color-borde)' }}
          />

          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-tinta-suave)' }}>Contraseña</label>
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
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-sm text-center mt-4" style={{ color: 'var(--color-tinta-suave)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--color-bosque)' }}>
              Ingresa
            </Link>
          </p>
        </form>
        )}
      </div>
    </div>
  )
}