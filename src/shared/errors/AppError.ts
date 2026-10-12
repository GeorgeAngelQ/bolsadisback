import { ErrorType } from './ErrorType'

export interface FieldError {
  campo: string
  mensaje: string
}

export interface AppErrorOptions {
  // Datos para debug 
  context?: Record<string, unknown>
  // Errores por campo
  fields?: FieldError[]
  // Causa del error
  cause?: unknown
}

export class AppError extends Error {
  readonly type: ErrorType
  readonly context: Record<string, unknown>
  readonly fields: FieldError[]
  readonly cause?: unknown

  constructor(type: ErrorType, message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.context = options.context ?? {}
    this.fields = options.fields ?? []
    this.cause = options.cause
  }
}