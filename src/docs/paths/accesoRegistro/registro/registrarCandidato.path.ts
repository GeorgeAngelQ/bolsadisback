import { registry } from '../../../openapiRegistry'
import { registrarCandidatoSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/candidatos/registro',
  tags: ['Módulo 1: Acceso y Registro',
          'Registro'
        ],
  summary: 'Registrar candidato',
  description: 'Permite a un usuario autenticarse en la plataforma',
  request: {
    body: {
      content: {
        'application/json': {
          schema:  registrarCandidatoSchema
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Candidato registrado correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})