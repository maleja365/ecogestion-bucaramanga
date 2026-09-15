import { useEffect, useState } from 'react'

export default function BotonInstalarApp() {
  const [promptEvento, setPromptEvento] = useState(null)
  const [descartado, setDescartado] = useState(false)
  const [yaInstalada, setYaInstalada] = useState(false)

  useEffect(() => {
    function alDetectarInstalable(e) {
      e.preventDefault()
      setPromptEvento(e)
    }

    window.addEventListener('beforeinstallprompt', alDetectarInstalable)

    if (sessionStorage.getItem('ecosmart_banner_instalar_cerrado') === '1') {
      setDescartado(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', alDetectarInstalable)
    }
  }, [])

  if (!promptEvento || descartado) return null

  async function instalar() {
    if (yaInstalada) return
    promptEvento.prompt()
    await promptEvento.userChoice
    setYaInstalada(true)
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
          disabled={yaInstalada}
          className="text-sm font-medium px-4 py-2 rounded-full text-white flex-shrink-0 whitespace-nowrap disabled:opacity-70"
          style={{ backgroundColor: 'var(--color-bosque)' }}
        >
          {yaInstalada ? '¡Listo! Ya instalada' : 'Instalar app'}
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