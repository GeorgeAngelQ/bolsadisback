import { AppError, AppErrorOptions } from "./AppError"
import { ErrorType } from "./ErrorType"

export class ValidationError extends AppError {
  constructor(
    message: string,
    options: AppErrorOptions = {},
    type: ErrorType = ErrorType.VALIDATION
  ) {
    super(type, message, options)
    this.name = 'ValidationError'
  }
}

export class InvalidFileTypeError extends ValidationError {
  constructor(mimeType: string, permitidos: string[]) {
    super(
      `Tipo de archivo no permitido: ${mimeType}. Formatos aceptados: ${permitidos.join(', ')}`,
      { context: {mimeType, permitidos} },
      ErrorType.UNSUPPORTED_MEDIA_TYPE
    )
    this.name = 'InvalidFileTypeError'
  }
}

export class FileTooLargeError extends ValidationError {
  constructor(maxSizeMB: number) {
    super(
      `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`,
      { context: {maxSizeMB} },
      ErrorType.PAYLOAD_TOO_LARGE
  )
    this.name = 'FileTooLargeError'
  }
}