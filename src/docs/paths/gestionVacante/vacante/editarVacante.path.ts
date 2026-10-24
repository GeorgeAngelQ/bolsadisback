import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { editarVacanteSchema } from '@infrastructure/validators/gestionVacante/vacante.schema';

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'put',
  ruta: '/empresas/{idEmpresa}/vacantes/{id}',
  modulo: MODULO,
  seccion: 'Vacante',
  resumen: 'Editar vacante',
  descripcion:
    'Actualiza los campos enviados y **devuelve la vacante a `pendiente`** para una nueva aprobación.\n\n' +
    '- Solo se pueden editar vacantes en estado `borrador`, `pendiente` o `rechazada`. Una vacante `aprobada` o `cerrada` responde 422.\n' +
    '- Si se envía `idsTiposDiscapacidad`, reemplaza los tipos asociados.\n' +
    '- Si se envía `ajustesDisponibles`, **reemplaza todos** los ajustes y los deja sin verificar.\n' +
    '- La vacante debe pertenecer a la empresa de la URL; si no, responde 422.',
  roles: ['empresa'],
  params: ids('idEmpresa', 'id'),
  body: editarVacanteSchema,
  exito: { 
    descripcion: 'Vacante actualizada', 
    schema: mensaje('Vacante actualizada y enviada a revisión') 
  },
  errores: [404, 422],
})