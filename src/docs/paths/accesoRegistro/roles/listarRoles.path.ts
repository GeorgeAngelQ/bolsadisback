import { registry } from '../../../openapiRegistry'

registry.registerPath({
  method: 'get',
  path: '/auth/roles',
  tags: ['Módulo 1: Acceso y Registro',
          'Gestion de Roles'
        ],
  summary: 'Listar roles',
  description: 'Permite al administrador listar los roles disponibles',
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