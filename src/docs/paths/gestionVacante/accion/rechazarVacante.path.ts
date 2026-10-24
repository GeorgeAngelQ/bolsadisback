import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { rechazarVacanteSchema } from '@infrastructure/validators/gestionVacante/vacante.schema'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'patch',
  ruta: '/vacantes/{id}/rechazar',
  modulo: MODULO,
  seccion: 'Acción sobre vacante',
  resumen: 'Rechazar vacante',
  descripcion:
    'Rechaza una vacante `pendiente` indicando el motivo y notifica a la empresa. ' +
    'La empresa puede corregirla: al editarla vuelve a `pendiente`.\n\n' +
    'Solo se rechazan vacantes en estado `pendiente`; en otro estado responde 422.',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  body: rechazarVacanteSchema,
  exito: { 
    descripcion: 'Vacante rechazada', 
    schema: mensaje('Vacante rechazada. Empresa notificada')
  },
  errores: [404, 422],
})