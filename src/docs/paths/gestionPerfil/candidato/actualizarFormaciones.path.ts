import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { actualizarFormacionesSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'patch',
  ruta: '/candidatos/{idCandidato}/perfil/formaciones',
  modulo: MODULO,
  seccion: 'Perfil profesional del candidato',
  resumen: 'Crear o actualizar formación académica',
  descripcion:
    'Las formaciones **sin `id`** se crean. Las que traen `id` de una formación del perfil se actualizan.\n\n' +
    'No elimina las formaciones que no se envían, y un `id` que no pertenece al perfil se ignora sin error.',
  roles: ['candidato'],
  params: ids('idCandidato'),
  body: actualizarFormacionesSchema,
  exito: { 
    descripcion: 'Formaciones actualizadas', 
    schema: mensaje('Formaciones actualizadas') 
  },
  errores: [404],
})