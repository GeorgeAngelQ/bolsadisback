import { registry } from '../../../openapiRegistry'
import { loginSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Módulo 1: Acceso y Registro',
          'Autenticación'
        ],
  summary: 'Iniciar sesión',
  description: 'Permite a un usuario ingresar a la plataforma',
  request: {
    body: {
      content: {
        'application/json': {
          schema:  loginSchema
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Usuario autenticado correctamente',
    },
    400: {
      description: 'Datos inválidos',
    },
  },
})