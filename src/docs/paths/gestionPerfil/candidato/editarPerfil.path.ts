import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { editarPerfilCandidatoSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema';

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'put',
  ruta: '/candidatos/{idCandidato}/perfil',
  modulo: MODULO,
  seccion: 'Perfil profesional del candidato',
  resumen: 'Editar datos base del perfil',
  descripcion: 'Actualiza el resumen profesional y el nivel educativo. Solo se modifican los campos enviados',
  roles: ['candidato'],
  params: ids('idCandidato'),
  body: editarPerfilCandidatoSchema,
  exito: { 
    descripcion: 'Perfil actualizado', 
    schema: mensaje('Perfil actualizado correctamente') 
  },
  errores: [404],
})