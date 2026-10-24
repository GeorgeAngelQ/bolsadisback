import { asignarPermisosSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema';
import { documentar, RespuestaDatos } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'put',
  ruta: '/auth/roles/{id}/permisos',
  modulo: MODULO,
  seccion: 'Gestión de Roles',
  resumen: 'Asignar permisos',
  descripcion: 'Permite al administrador asignar un permiso diferente a otra cuenta',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  body: asignarPermisosSchema,
  exito: { 
    descripcion: 'Permisos asignados correctamente a la cuenta', 
    schema: RespuestaDatos 
  },
  errores: [400, 401,403, 413, 422],
})