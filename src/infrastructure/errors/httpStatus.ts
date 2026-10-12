import { ErrorType } from "@shared/errors/ErrorType"

export const HTTP_STATUS: Record<ErrorType, number> = {
  [ErrorType.VALIDATION]: 400,
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.DUPLICATE]: 409,
  [ErrorType.BUSINESS_RULE]: 422,
  [ErrorType.INVALID_STATE]: 422,
  [ErrorType.DOMAIN]: 400,
  [ErrorType.PAYLOAD_TOO_LARGE]: 413,
  [ErrorType.UNSUPPORTED_MEDIA_TYPE]: 415,
  [ErrorType.SERVICE_UNAVAILABLE]: 503,
  [ErrorType.DATABASE]: 500,
  [ErrorType.INTERNAL]: 500,
}

export const PUBLIC_MESSAGE_5XX: Partial<Record<ErrorType, string>> = {
  [ErrorType.SERVICE_UNAVAILABLE]: 'Servicio temporalmente no disponible. Intenta nuevamente en unos segundos',
  [ErrorType.DATABASE]: 'Error al procesar la solicitud',
  [ErrorType.INTERNAL]: 'Error interno del servidor'
}