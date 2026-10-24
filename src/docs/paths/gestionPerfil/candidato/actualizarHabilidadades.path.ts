import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { actualizarHabilidadesSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'patch',
  ruta: '/candidatos/{idCandidato}/perfil/habilidades',
  modulo: MODULO,
  seccion: 'Perfil profesional del candidato',
  resumen: 'Reemplazar habilidades',
  descripcion: 
    '**Reemplaza** el conjunto completo: elimina las habilidades actuales y guarda las enviadas. ' +
    'Enviar una lista vacía deja el perfil sin habilidades.',
  roles: ['candidato'],
  params: ids('idCandidato'),
  body: actualizarHabilidadesSchema,
  exito: { 
    descripcion: 'Habilidades actualizadas', 
    schema: mensaje('Habilidades actualizadas') 
  },
  errores: [404],
})