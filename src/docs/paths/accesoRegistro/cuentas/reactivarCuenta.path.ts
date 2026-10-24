import { documentar, RespuestaMensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'patch',
  ruta: '/auth/cuentas/{id}/reactivar',
  modulo: MODULO,
  seccion: 'Gestion de Cuentas',
  resumen: 'Reactivar cuenta',
  descripcion: 'Permite al administrador reactivar alguna cuenta con estado suspendido',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  exito: { 
    descripcion: 'Cuenta reactivada correctamente', 
    schema: RespuestaMensaje 
  },
  errores: [400, 401,403, 413, 422],
})