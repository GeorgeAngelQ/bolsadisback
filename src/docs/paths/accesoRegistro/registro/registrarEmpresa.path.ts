import { registry } from '../../../openapiRegistry'
import { registrarEmpresaSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/empresas/registro',
  tags: ['Módulo 1: Acceso y Registro',
          'Registro'
        ],
  summary: 'Registrar empresa',
  description: 'Permite a un usuario con rol de empresa autenticarse en la plataforma',
  request: {
    body: {
      content: {
        'application/json': {
          schema:  registrarEmpresaSchema
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Empresa registrada correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})