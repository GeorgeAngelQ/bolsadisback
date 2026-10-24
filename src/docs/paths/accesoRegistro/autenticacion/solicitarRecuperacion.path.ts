import { solicitarRecuperacionSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'
import { documentar, RespuestaMensaje } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'post',
  ruta: '/auth/recuperar-contrasena',
  modulo: MODULO,
  seccion: 'Autenticación',
  resumen: 'Solicitar recuperación de contraseña',
  descripcion: 'Permite al usuario recibir instrucciones por correo electrónico para recuperar su contraseña',
  publico: true,
  body: solicitarRecuperacionSchema,
  exito: { 
    descripcion: 'Recibiste instrucciones de recuperación al correo electrónico registrado', 
    schema: RespuestaMensaje
  },
  errores: [400, 422],
})