import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { certificadoCampos } from '@infrastructure/validators/gestionPerfil/perfil.schema'
import { CertificadoRegistrado } from '@docs/schemas/perfil.responses'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'post',
  ruta: '/candidatos/{idCandidato}/certificados',
  modulo: MODULO,
  seccion: 'Certificado de discapacidad del candidato',
  resumen: 'Registrar certificado de discapacidad',
  descripcion:
    'Registra el carné como `multipart/form-data`. El archivo es opcional. La entidad emisora se fija en CONADIS ' +
    'y el certificado queda **sin verificar** hasta que lo revise un administrador.\n\n' +
    'Si el perfil ya tenía un certificado, se actualiza con estos datos (también responde 201). ' +
    'Tipos de archivo aceptados: PDF, DOC, DOCX, PNG y JPEG, hasta 10 MB.',
  roles: ['candidato'],
  params: ids('idCandidato'),
  multipart: {
    archivo: {
      campo: 'archivo',
      descripcion: 'Escaneo o foto del carné (opcional)',
      requerido: false
    },
    campos: certificadoCampos
  },
  exito: { 
    status: 201,
    descripcion: 'Certificado registrado', 
    schema: conDatos(CertificadoRegistrado) 
  },
  errores: [404, 409],
})