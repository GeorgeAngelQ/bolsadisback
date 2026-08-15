import { registry } from '../../../openapiRegistry'

registry.registerPath({
  method: 'post',
  path: '/auth/accesibilidad',
  tags: ['Módulo 1: Acceso y Registro',
          'Accesibilidad'
        ],
  summary: 'Restablecer preferencias de accesibilidad de la cuenta',
  description: 'Permite al administrador restablecer las preferencias de accesibilidad de una cuenta',
  security: [
    {
      bearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: 'Preferencias de accesibilidad restablecidas correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})