import { useEffect, useState } from 'react'

export default function BotonInstalarApp() {
  const [promptEvento, setPromptEvento] = useState(null)
  const [instalada, setInstalada] = useState(false)
  const [descartado, setDescartado] = useState(false)

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

    // Si ya se abrió como app instalada (modo standalone), no mostrar el banner.
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalada(true)
    }

    // El descarte se recuerda solo durante la sesión del navegador, no
    // para siempre, así el banner vuelve a aparecer en visitas futuras.
    if (sessionStorage.getItem('ecosmart_banner_instalar_cerrado') === '1') {
      setDescartado(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', alDetectarInstalable)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  if (!promptEvento || instalada || descartado) return null

  async function instalar() {
    promptEvento.prompt()
    await promptEvento.userChoice
    setPromptEvento(null)
  }

  function descartar() {
    sessionStorage.setItem('ecosmart_banner_instalar_cerrado', '1')
    setDescartado(true)
  }

  return (
    <div
      className="w-full border-b"
      style={{ backgroundColor: 'var(--color-guayacan-suave)', borderColor: 'var(--color-borde)' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <img
          src="/logo-emblema.png"
          alt="Ecosmart Residenciales"
          className="w-11 h-11 object-contain flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--color-tinta)' }}>
            Instala Ecosmart Residenciales
          </p>
          <p className="text-xs leading-tight truncate" style={{ color: 'var(--color-tinta-suave)' }}>
            Acceso más rápido desde tu pantalla de inicio, incluso sin conexión.
          </p>
        </div>
        <button
          onClick={instalar}
          className="text-sm font-medium px-4 py-2 rounded-full text-white flex-shrink-0 whitespace-nowrap"
          style={{ backgroundColor: 'var(--color-bosque)' }}
        >
          Instalar app
        </button>
        <button
          onClick={descartar}
          aria-label="Cerrar aviso de instalación"
          className="text-xl leading-none flex-shrink-0 px-1 pb-0.5"
          style={{ color: 'var(--color-tinta-suave)' }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
