const REQUISITOS = [
  { clave: 'longitud', label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { clave: 'mayuscula', label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { clave: 'minuscula', label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { clave: 'numero', label: 'Un número', test: (p) => /[0-9]/.test(p) },
  { clave: 'especial', label: 'Un carácter especial (!@#$%...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function contrasenaEsValida(password) {
  return REQUISITOS.every((r) => r.test(password))
}

export default function RequisitosContrasena({ password }) {
  if (!password) return null
  return (
    <ul className="mb-4 -mt-2 space-y-0.5">
      {REQUISITOS.map((r) => {
        const cumple = r.test(password)
        return (
          <li
            key={r.clave}
            className="text-xs flex items-center gap-1.5"
            style={{ color: cumple ? 'var(--color-musgo)' : 'var(--color-tinta-suave)' }}
          >
            <span>{cumple ? '✓' : '·'}</span>
            {r.label}
          </li>
        )
      })}
    </ul>
  )
}
