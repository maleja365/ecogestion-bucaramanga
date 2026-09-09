import { createContext, useContext, useEffect, useState } from 'react'

const InstalarAppContext = createContext(null)

export function InstalarAppProvider({ children }) {
  const [promptEvento, setPromptEvento] = useState(null)
  const [instalada, setInstalada] = useState(false)

  useEffect(() => {
    function alDetectarInstalable(e) {
      e.preventDefault()
      setPromptEvento(e)
    }
    function alInstalar() {
      setInstalada(true)
      setPromptEvento(null)
    }

    window.addEventListener('beforeinstallprompt', alDetectarInstalable)
    window.addEventListener('appinstalled', alInstalar)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalada(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', alDetectarInstalable)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  async function instalar() {
    if (!promptEvento) return
    promptEvento.prompt()
    // Ya NO se limpia el evento aquí: si la persona cancela el cuadro
    // del navegador, el botón debe seguir apareciendo para que pueda
    // intentarlo de nuevo cuando quiera. Solo desaparece con
    // 'appinstalled' (instalación real) más abajo.
    await promptEvento.userChoice
  }

  const value = {
    puedeInstalar: !!promptEvento && !instalada,
    instalar,
  }

  return <InstalarAppContext.Provider value={value}>{children}</InstalarAppContext.Provider>
}

export function useInstalarApp() {
  return useContext(InstalarAppContext)
}