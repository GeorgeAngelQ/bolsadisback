import { registry } from '../../../openapiRegistry'

registry.registerPath({
  method: 'post',
  path: '/auth/accesibilidad',
  tags: ['Módulo 1: Acceso y Registro',
          'Accesibilidad'
        ],
  summary: 'Obtener la accesibilidad de la cuenta',
  description: 'Permite al administrador obtener la accesibilidad de una cuenta',
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