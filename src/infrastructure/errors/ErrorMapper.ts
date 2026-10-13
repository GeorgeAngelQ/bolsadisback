import { AppError, FieldError } from "@shared/errors/AppError";
import { HTTP_STATUS, PUBLIC_MESSAGE_5XX } from "./httpStatus";
import { ErrorType } from "@shared/errors/ErrorType";
import { ZodError } from "zod";
import { MulterError } from "multer";

export interface ApiErrorBody {
  error: string,
  code: string,
  detalles?: FieldError[],
  requestId?: string,
  debug?: Record<string, unknown>
}

export interface MappedError {
  status: number,
  body: ApiErrorBody
}


const isDebug = () => process.env.DEBUG_MODE === 'true'

export function mapError(err: unknown): MappedError {
  const mapped = resolve(err)
  if (isDebug()) mapped.body.debug = buildDebug(err)
  return mapped

}

function resolve(err: unknown): MappedError {
  // Errores más comunes de dominio, validacion y BD
  if (err instanceof AppError) {
    const status = HTTP_STATUS[err.type]
    const body: ApiErrorBody = {
      error: status >= 500 ? (PUBLIC_MESSAGE_5XX[err.type] ?? PUBLIC_MESSAGE_5XX[ErrorType.INTERNAL]!) :  err.message,
      code: err.type
    }
    if (err.fields.length > 0) body.detalles = err.fields
    return { status, body }
  }

  // Errores de request Zod  - No extiende de mapped, debe mostrar todos los campos que fallan en la validacion
  if (err instanceof ZodError){
    return {
      status: HTTP_STATUS[ErrorType.VALIDATION],
      body: {
        error: 'Datos de entrada inválidos',
        code: ErrorType.VALIDATION,
        detalles: err.issues.map( i => ({
          campo: i.path.join('.'),
          mensaje: i.message
        }))
      }
    }
  }

  // Errores de subida de archivos con Multer, maneja tamaño max y archivo no esperado
  if (err instanceof MulterError){
    if (err.code === 'LIMIT_FILE_SIZE') {
      return {
        status: HTTP_STATUS[ErrorType.PAYLOAD_TOO_LARGE],
        body: {
          error: 'El archivo excede el tamaño máximo permitido',
          code: ErrorType.PAYLOAD_TOO_LARGE
        }
      }
    }

    return {
      status: HTTP_STATUS[ErrorType.VALIDATION],
      body: {
        error: 'Archivo inválido o campo de archivo inesperado',
        code: ErrorType.VALIDATION
      }
    }
  }

  // Errores del body de Express
  const parserType = (err as {type?:string} | null)?.type
  if (parserType === 'entity.parse.failed') {
    return {
      status: HTTP_STATUS[ErrorType.VALIDATION],
      body: {
        error: 'El cuerpo de la solicitud no es un JSON válido',
        code: ErrorType.VALIDATION
      }
    }
  }
  if (parserType === 'entity.too.large'){
    return {
      status: HTTP_STATUS[ErrorType.PAYLOAD_TOO_LARGE],
      body: {
        error: 'El cuerpo de la solicitud excede el tamaño permitido',
        code: ErrorType.PAYLOAD_TOO_LARGE
      }
    }
  }

  // Error inesperado
  return {
    status: HTTP_STATUS[ErrorType.INTERNAL],
    body: {
      error: PUBLIC_MESSAGE_5XX[ErrorType.INTERNAL]!,
      code: ErrorType.INTERNAL
    }
  }
}
function buildDebug(err: unknown): Record<string, unknown> {
  if (!(err instanceof Error)) return { valor: String(err)}
  const cause = err instanceof AppError ? err.cause : undefined
  return {
    exception: err.name,
    message: err.message,
    context: err instanceof AppError ? err.context : undefined,
    cause: cause instanceof Error ? `${cause.name}: ${cause.message}`: undefined,
    stack: err.stack?.split('\n').slice(0,6)
  }
}