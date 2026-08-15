import { registry } from '../../../openapiRegistry'
import { crearRolSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/roles',
  tags: ['Módulo 1: Acceso y Registro',
          'Gestion de Roles'
        ],
  summary: 'Crear roles y permisos',
  description: 'Permite al administrador crear nuevos roles y asignarles permisos',
  request: {
    body: {
      content: {
        'application/json': {
          schema: crearRolSchema
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
      description: 'Rol creado correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})