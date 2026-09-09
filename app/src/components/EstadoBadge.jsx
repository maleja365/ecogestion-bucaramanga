const ESTILOS = {
  pendiente: { bg: '#F3DFA4', text: '#7A5A0E', label: 'Pendiente' },
  en_revision: { bg: '#DCE6DF', text: 'var(--color-bosque)', label: 'En revisión' },
  resuelto: { bg: '#DCE9DE', text: '#2C5E3A', label: 'Resuelto' },
}

export default function EstadoBadge({ estado }) {
  const s = ESTILOS[estado] || ESTILOS.pendiente
  return (
    <span
      className="badge-hoja inline-flex items-center px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}
