import { documentar,RespuestaMensaje } from "@docs/helpers/documentar"
import { motivoCuentaSchema } from "@infrastructure/validators/accesoRegistro/accesoRegistro.schema"
import { ids } from "@infrastructure/validators/common/common.schemas"

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'delete',
  ruta: '/auth/cuentas/{id}',
  modulo: MODULO,
  seccion: 'Gestión de Cuentas',
  resumen: 'Eliminar cuenta',
  descripcion: 'Elimina la cuenta indicada. Requiere el motivo de la eliminación.',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  body: motivoCuentaSchema,
  exito: { descripcion: 'Cuenta eliminada', schema: RespuestaMensaje },
  errores: [404, 422],
})