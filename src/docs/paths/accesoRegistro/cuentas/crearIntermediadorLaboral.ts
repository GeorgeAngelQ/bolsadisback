import { registry } from '../../../openapiRegistry'
import { crearIntermediadorSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/cuentas/intermediadores',
  tags: ['Módulo 1: Acceso y Registro',
          'Gestion de Cuentas'
        ],
  summary: 'Crear cuenta de Intermediador Laboral',
  description: 'Permite al administrador crear una cuenta de Intermediador Laboral',
  request: {
    body: {
      content: {
        'application/json': {
          schema:  crearIntermediadorSchema
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: 'Cuenta de Intermediador Laboral creada correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})