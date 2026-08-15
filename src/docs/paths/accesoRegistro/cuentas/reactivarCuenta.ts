import { registry } from '../../../openapiRegistry'

registry.registerPath({
  method: 'patch',
  path: '/auth/cuentas/{id}/reactivar',
  tags: [
    'Módulo 1: Acceso y Registro',
    'Gestion de Cuentas',
  ],

  summary: 'Reactivar cuenta',

  description:
    'Permite al administrador reactivar una cuenta indicando el motivo de la reactivación.',
  
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'ID de la cuenta que se desea reactivar',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: 'Cuenta reactivada correctamente',
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