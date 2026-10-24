import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { crearPerfilCandidatoSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema';
import { PerfilCandidatoCreado } from '@docs/schemas/perfil.responses';

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'post',
  ruta: '/candidatos/{idCandidato}/perfil',
  modulo: MODULO,
  seccion: 'Perfil profesional del candidato',
  resumen: 'Crear perfil de candidato',
  descripcion:
    'Crea el perfil y lo asocia a uno o más tipos de discapacidad (categorías CONADIS).\n\n' +
    'Devuelve la completitud inicial: 40 % por tipos de discapacidad, 20 % por nivel educativo, ' +
    '10 % por resumen profesional y 10 % por ajustes razonables. El máximo al crear es 80 %; el 20 % restante lo aporta el CV.',
  roles: ['candidato'],
  params: ids('idCandidato'),
  body: crearPerfilCandidatoSchema,
  exito: { 
    status: 201,
    descripcion: 'Perfil creado', 
    schema: conDatos(PerfilCandidatoCreado) 
  },
  errores: [404, 409, 422],
})