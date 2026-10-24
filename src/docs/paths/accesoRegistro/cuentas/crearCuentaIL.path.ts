import { documentar, RespuestaDatos } from '@docs/helpers/documentar'
import { crearIntermediadorSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'post',
  ruta: '/auth/cuentas/intermediadores',
  modulo: MODULO,
  seccion: 'Gestión de Cuentas',
  resumen: 'Crear cuenta de Intermediador Laboral',
  descripcion: 'Permite al administrador crear una cuenta de Intermediador Laboral',
  roles: ['admin', 'superadmin'],
  body: crearIntermediadorSchema,
  exito: { 
    descripcion: 'Cuenta de Intermediador Laboral creada correctamente', 
    schema: RespuestaDatos 
  },
  errores: [400, 401,403, 413, 422],
})