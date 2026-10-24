import { loginSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'
import { documentar, RespuestaDatos } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'post',
  ruta: '/auth/login',
  modulo: MODULO,
  seccion: 'Autenticación',
  resumen: 'Iniciar sesión',
  descripcion: 'Permite al usuario autenticarse en la plataforma empleando sus credenciales',
  publico: true,
  body: loginSchema,
  exito: { 
    descripcion: 'Usuario autenticado correctamente', 
    schema: RespuestaDatos
  },
  errores: [400, 422],
})