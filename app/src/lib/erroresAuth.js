// Traduce los mensajes de error que devuelve Supabase Auth (siempre en inglés)
// a mensajes en español, más claros para el usuario final.
export function traducirErrorAuth(mensaje) {
  if (!mensaje) return 'Ocurrió un error inesperado. Intenta de nuevo.'

  const m = mensaje.toLowerCase()

  if (m.includes('user already registered') || m.includes('already registered')) {
    return 'Ya existe una cuenta registrada con este correo electrónico.'
  }
  if (m.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (m.includes('email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.'
  }
  if (m.includes('error sending confirmation email')) {
    return 'No se pudo enviar el correo de confirmación. Intenta de nuevo en unos minutos.'
  }
  if (m.includes('error sending recovery email')) {
    return 'No se pudo enviar el correo de recuperación. Intenta de nuevo en unos minutos.'
  }
  if (m.includes('email rate limit exceeded')) {
    return 'Se han enviado demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo.'
  }
  if (m.includes('for security purposes') && m.includes('seconds')) {
    return 'Por seguridad, debes esperar unos segundos antes de volver a intentarlo.'
  }
  if (m.includes('password should be at least')) {
    return 'La contraseña es demasiado corta.'
  }
  if (m.includes('unable to validate email address') || m.includes('invalid format')) {
    return 'El correo electrónico no tiene un formato válido.'
  }
  if (m.includes('signup requires a valid password')) {
    return 'Debes ingresar una contraseña válida.'
  }
  if (m.includes('token has expired') || m.includes('invalid token')) {
    return 'El enlace ya expiró o no es válido. Solicita uno nuevo.'
  }
  if (m.includes('new password should be different')) {
    return 'La nueva contraseña debe ser distinta a la anterior.'
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Problema de conexión. Revisa tu internet e intenta de nuevo.'
  }

  // Si no reconocemos el mensaje, mostramos algo genérico en vez del texto en inglés
  return 'Ocurrió un error. Intenta de nuevo en unos minutos.'
}
