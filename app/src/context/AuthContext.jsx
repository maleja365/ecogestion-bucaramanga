import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  async function cargarPerfil(userId) {
    const { data: p } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (p?.conjunto_id) {
      // Se consulta la vista pública (sin el código de administración)
      // para evitar que un residente vea el código de su propio conjunto.
      const { data: conjunto } = await supabase
        .from('conjuntos_publico')
        .select('nombre')
        .eq('id', p.conjunto_id)
        .single()
      setPerfil({ ...p, conjunto_nombre: conjunto?.nombre })
    } else {
      setPerfil(p)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) cargarPerfil(session.user.id)
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) {
          cargarPerfil(session.user.id)
        } else {
          setPerfil(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  const value = {
    usuario: session?.user ?? null,
    perfil,
    cargando,
    esAdministracion: perfil?.rol === 'administracion',
    esSuperAdmin: perfil?.rol === 'super_admin',
    pendienteAprobacion: perfil?.rol === 'residente' && perfil?.aprobado === false,
    recargarPerfil: () => session?.user && cargarPerfil(session.user.id),
    cerrarSesion,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
