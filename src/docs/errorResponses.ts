import { z } from 'zod'
import type { ResponseConfig } from '@asteasolutions/zod-to-openapi'
import { registry } from './openapiRegistry'
import { ErrorType } from '@shared/errors/ErrorType'

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    description: 'Mensaje legible para mostrar al usuario',
    example: 'Recurso no encontrado',
  }),
  code: z.nativeEnum(ErrorType).openapi({
    description: 'Código estable para que el frontend decida que hacer',
    example: ErrorType.NOT_FOUND
  }),
  detalles: z.array(z.object({
    campo: z.string(),
    mensaje: z.string()
  })).optional().openapi({
    description: 'Solo errores en la validación (400): un elemento por campo inválido. Los campos de URL/query llevan prefijo (params.id, query.page)'
  }),
  requestId: z.string().uuid().optional().openapi({
    description: 'Solo en errores 5xx: identificador para rastrear el fallo en los logs'
  }),
}).openapi('ErrorResponse')

registry.register('ErrorResponse', ErrorResponseSchema)



export const DESCRIPCION_POR_STATUS: Record<number, string> = {
  400: 'Datos de entrada inválidos',
  401: 'No autenticado: falta el token o es inválido/expirado',
  403: 'Autenticado, pero sin permisos para esta acción',
  404: 'Recurso no encontrado',
  409: 'Conflicto: el recurso ya existe',
  413: 'Cuerpo o archivo demasiado grande',
  415: 'Tipo de archivo no permitido',
  422: 'Regla de negocio violada',
  429: 'Demasiadas solicitudes',
  500: 'Error interno del servidor',
  503: 'Servicio temporalmente no disponible; reintentar',
}

export function errorResponses(...statuses: number[]): Record<number, ResponseConfig> {
  const respuestas: Record<number, ResponseConfig> = {}
  for (const status of statuses) {
    respuestas[status] = {
      description: DESCRIPCION_POR_STATUS[status] ?? 'Error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
  return respuestas
}