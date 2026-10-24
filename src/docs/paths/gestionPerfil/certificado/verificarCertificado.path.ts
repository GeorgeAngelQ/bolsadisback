import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'post',
  ruta: '/perfiles/{idPerfil}/certificados/verificar',
  modulo: MODULO,
  seccion: 'Certificado de discapacidad del candidato',
  resumen: 'Verificar certificado de discapacidad',
  descripcion:
    'Marca el certificado del perfil como verificado.\n\n' +
    '`idPerfil` es el id del **perfil** (no el del candidato ni el del certificado). ' +
    'No se puede verificar un certificado vencido.',
  roles: ['admin', 'superadmin'],
  params: ids('idPerfil'),
  exito: { 
    descripcion: 'Certificado verificado', 
    schema: mensaje('Certificado verificado correctamente') 
  },
  errores: [404, 422],
})