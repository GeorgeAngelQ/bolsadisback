import { registry } from '../../../openapiRegistry'
import { guardarPreferenciasSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/accesibilidad',
  tags: ['Módulo 1: Acceso y Registro',
          'Accesibilidad'
        ],
  summary: 'Guardar preferencias de accesibilidad',
  description: 'Permite al usuario guardar sus preferencias de accesibilidad',
  request: {
    body: {
      content: {
        'application/json': {
          schema:  guardarPreferenciasSchema
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
      description: 'Preferencias de accesibilidad guardadas correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})