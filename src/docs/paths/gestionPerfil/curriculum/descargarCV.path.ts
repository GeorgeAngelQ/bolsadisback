import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { CvDescarga } from '@docs/schemas/perfil.responses'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'get',
  ruta: '/candidatos/{idCandidato}/cv/descargar',
  modulo: MODULO,
  seccion: 'CV del candidato',
  resumen: 'Obtener enlace de descarga del CV',
  descripcion: 'No devuelve el archivo: devuelve la URL desde la que descargarlo',
  roles: ['candidato'],
  params: ids('idCandidato'),
  exito: { 
    descripcion: 'URL de descarga', 
    schema: conDatos(CvDescarga)
  },
  errores: [404],
})