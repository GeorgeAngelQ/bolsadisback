import { registry } from '../../../openapiRegistry'
import { asignarPermisosSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'put',
  path: '/auth/roles',
  tags: ['Módulo 1: Acceso y Registro',
          'Gestion de Roles'
        ],
  summary: 'Asignar permisos',

  description: 'Permite al administrador asignar permisos a los roles',
  request: {
    body: {
      content: {
        'application/json': {
          schema: asignarPermisosSchema
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
      description: 'Roles listados correctamente',
    },
    404: {
      description: 'Roles no encontrados',
    },
  },
})