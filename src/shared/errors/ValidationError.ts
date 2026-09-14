export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class InvalidFileTypeError extends ValidationError {
  constructor(mimeType: string, permitidos: string[]) {
    super(`Tipo de archivo no permitido: ${mimeType}. Formatos aceptados: ${permitidos.join(', ')}`)
    this.name = 'InvalidFileTypeError'
  }
}

export class FileTooLargeError extends ValidationError {
  constructor(maxSizeMB: number) {
    super(`El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`)
    this.name = 'FileTooLargeError'
  }
}