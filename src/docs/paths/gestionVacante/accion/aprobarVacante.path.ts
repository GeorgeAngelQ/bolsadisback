import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { aprobarVacanteSchema } from '@infrastructure/validators/gestionVacante/vacante.schema'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'patch',
  ruta: '/vacantes/{id}/aprobar',
  modulo: MODULO,
  seccion: 'Acción sobre vacante',
  resumen: 'Aprobar vacante',
  descripcion:
    'Aprueba una vacante `pendiente` y la deja disponible en el portal. Notifica a la empresa y a los candidatos ' +
    'con alertas compatibles.\n\n' +
    'Solo se aprueban vacantes en estado `pendiente`; en otro estado responde 422. ' +
    '`idUsuarioEmpresa` es el usuario de la empresa que recibe la notificación.',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  body: aprobarVacanteSchema,
  exito: { 
    descripcion: 'Vacante aprobada', 
    schema: mensaje('Vacante aprobada y publicada') 
  },
  errores: [404, 422],
})