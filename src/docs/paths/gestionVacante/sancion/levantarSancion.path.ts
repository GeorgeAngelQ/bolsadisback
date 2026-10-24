import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'patch',
  ruta: '/sanciones/{id}/levantar',
  modulo: MODULO,
  seccion: 'Sanción a la empresa',
  resumen: 'Levantar sanción',
  descripcion:
    'Marca la sanción como levantada y registra la fecha de fin. La empresa puede volver a publicar vacantes ' +
    'si no le quedan otras sanciones activas.',
  roles: ['admin', 'superadmin'],
  params: ids('id'),
  exito: { 
    descripcion: 'Sanción levantada', 
    schema: mensaje('Sanción levantada correctamente') 
  },
  errores: [404],
})