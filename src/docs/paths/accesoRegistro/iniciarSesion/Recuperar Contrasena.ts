import { registry } from '../../../openapiRegistry'
import { solicitarRecuperacionSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/recuperar-contrasena',
  tags: ['Módulo 1: Acceso y Registro',
          'Autenticación'
        ],
  summary: 'Recuperar contraseña',
  description: 'Permite a un usuario recuperar su contraseña',
  request: {
    body: {
      content: {
        'application/json': {
          schema:  solicitarRecuperacionSchema
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Si el correo existe, recibirás instrucciones de recuperación',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})