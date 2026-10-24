import { documentar } from "@docs/helpers/documentar"
import { tokenParamsSchema } from "@infrastructure/validators/accesoRegistro/accesoRegistro.schema"
import { RespuestaDatos } from "@docs/helpers/documentar"

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'get',
  ruta: '/auth/recuperar-contrasena/{token}',
  modulo: MODULO,
  seccion: 'Recuperar Contraseña',
  resumen: 'Validar token de recuperación',
  descripcion: 'Comprueba que el token recibido por correo siga vigente antes de mostrar el formulario de nueva contraseña.',
  publico: true,
  params: tokenParamsSchema,
  exito: { 
    descripcion: 'Token válido', 
    schema: RespuestaDatos 
  },
  errores: [404, 422],
})