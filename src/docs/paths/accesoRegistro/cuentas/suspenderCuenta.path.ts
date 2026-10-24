import { documentar, RespuestaMensaje } from '@docs/helpers/documentar'
import { motivoCuentaSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'
import { ids } from '@infrastructure/validators/common/common.schemas'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'patch',
  ruta: '/auth/cuentas/{id}/suspender',
  modulo: MODULO,
  seccion: 'Gestion de Cuentas',
  resumen: 'Suspender cuenta',
  descripcion: 'Permite al administrador suspender una cuenta indicando el motivo de la suspensión.',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  body: motivoCuentaSchema,
  exito: { 
    descripcion: 'Cuenta suspendida correctamente', 
    schema: RespuestaMensaje 
  },
  errores: [400, 401,403, 413, 422],
})