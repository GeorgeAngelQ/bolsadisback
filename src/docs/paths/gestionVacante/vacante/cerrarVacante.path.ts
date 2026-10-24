import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'patch',
  ruta: '/empresas/{idEmpresa}/vacantes/{id}/cerrar',
  modulo: MODULO,
  seccion: 'Vacante',
  resumen: 'Cerrar vacante',
  descripcion:
    'Cierra la vacante: deja de recibir nuevas postulaciones. Las postulaciones existentes continúan su proceso.\n\n' +
    'Una vacante ya cerrada responde 422. La vacante debe pertenecer a la empresa de la URL.',
  roles: ['empresa'],
  params: ids('idEmpresa', 'id'),
  exito: { 
    descripcion: 'Vacante cerrada', 
    schema: mensaje('Vacante cerrada correctamente') 
  },
  errores: [404, 422],
})