import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { CvGenerado } from '@docs/schemas/perfil.responses'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'post',
  ruta: '/candidatos/{idCandidato}/cv/generar',
  modulo: MODULO,
  seccion: 'CV del candidato',
  resumen: 'Generar CV automático',
  descripcion:
    'Genera un CV en PDF a partir del perfil y lo guarda como CV vigente.\n\n' +
    'Requiere que el perfil tenga al menos 40 % de completitud. Suma 20 puntos al porcentaje de completitud (tope 100).',
  roles: ['candidato'],
  params: ids('idCandidato'),
  exito: { 
    descripcion: 'CV generado', 
    schema: conDatos(CvGenerado) 
  },
  errores: [404, 422],
})