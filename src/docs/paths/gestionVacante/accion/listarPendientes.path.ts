import { z } from 'zod'
import { conDatos, documentar } from '@docs/helpers/documentar'
import { VacantePendiente } from '@docs/schemas/vacante.responses'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'get',
  ruta: '/vacantes/pendientes',
  modulo: MODULO,
  seccion: 'Acción sobre vacante',
  resumen: 'Listar vacantes pendientes de revisión',
  descripcion:
    'Devuelve las vacantes en estado `pendiente` con las horas transcurridas desde su publicación. ' +
    '`superaPlazo` es `true` cuando pasaron 48 horas o más. La lista no está paginada.',
  roles: ['admin', 'superadmin'],
  exito: { 
    descripcion: 'Listado de vacantes pendientes', 
    schema: conDatos(z.array(VacantePendiente)) 
  }
})