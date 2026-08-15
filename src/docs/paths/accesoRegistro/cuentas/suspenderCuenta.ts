import { registry } from '../../../openapiRegistry'

registry.registerPath({
  method: 'patch',
  path: '/auth/cuentas/{id}/suspender',
  tags: [
    'Módulo 1: Acceso y Registro',
    'Gestion de Cuentas',
  ],

  summary: 'Suspender cuenta',

  description:
    'Permite al administrador suspender una cuenta indicando el motivo de la suspensión.',

  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'ID de la cuenta que se desea suspender',
    },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['motivo'],
          properties: {
            motivo: {
              type: 'string',
              maxLength: 500,
              description: 'Motivo de la suspensión',
            },
          },
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
      description: 'Cuenta suspendida correctamente',
    },

    400: {
      description: 'Datos inválidos',
    },

    401: {
      description: 'No autenticado',
    },

    403: {
      description: 'No tiene permisos para suspender cuentas',
    },

    404: {
      description: 'Cuenta no encontrada',
    },
  },
})