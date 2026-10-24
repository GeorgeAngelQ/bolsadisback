import { documentar, RespuestaMensaje } from '@docs/helpers/documentar'
import { actualizarContrasenaSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'patch',
  ruta: '/auth/recuperar-contrasena',
  modulo: MODULO,
  seccion: 'Recuperar Contraseña',
  resumen: 'Establecer nueva contraseña',
  descripcion: 'Cambia la contraseña usando el token de recuperación. La nueva contraseña debe tener entre 8 y 72 caracteres.',
  publico: true,
  body: actualizarContrasenaSchema,
  exito: { 
    descripcion: 'Contraseña actualizada', 
    schema: RespuestaMensaje 
  },
  errores: [404, 422],
})
