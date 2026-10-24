import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { actualizarExperienciasSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'patch',
  ruta: '/candidatos/{idCandidato}/perfil/experiencias',
  modulo: MODULO,
  seccion: 'Perfil profesional del candidato',
  resumen: 'Crear o actualizar experiencias laborales',
  descripcion: 
    'Las experiencias **sin `id`** se crean. Las que traen `id` de una experiencia del perfil se actualizan.\n\n' +
    'No elimina las experiencias que no se envían, y un `id` que no pertenece al perfil se ignora sin error.',
  roles: ['candidato'],
  params: ids('idCandidato'),
  body: actualizarExperienciasSchema,
  exito: { 
    descripcion: 'Experiencia laboral actualizada', 
    schema: mensaje('Experiencia laboral actualizada') 
  },
  errores: [404],
})