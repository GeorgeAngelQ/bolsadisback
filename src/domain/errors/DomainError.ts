import { AppError, AppErrorOptions } from "@shared/errors/AppError"
import { ErrorType } from "@shared/errors/ErrorType"

export class DomainError extends AppError {
  constructor(
    message: string,
    options: AppErrorOptions = {},
    type: ErrorType = ErrorType.DOMAIN
  ) {
    super(type, message, options)
    this.name = 'DomainError'
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string | number) {
    super(
      `${entity} con id ${id} no encontrado`,
      { context: {entity, id} },
      ErrorType.NOT_FOUND
    )
    this.name = 'EntityNotFoundError'
  }
}

export class BusinessRuleViolationError extends DomainError {

  readonly rule: string

  constructor(rule: string, message: string) {
    super(
      `[${rule}] ${message}`,
      { context: {rule} },
      ErrorType.BUSINESS_RULE
    )
    this.name = 'BusinessRuleViolationError'
    this.rule = rule
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(entity: string, field: string, options: AppErrorOptions = {}) {
    super(
      `${entity} ya existe con ese ${field}`,
      { ...options, context: { entity, field, ...options.context } },
      ErrorType.DUPLICATE
    )
    this.name = 'DuplicateEntityError'
  }
}

export class InvalidEntityStateError extends DomainError {
  constructor(entity: string, action: string) {
    super(
      `${entity} no permite la acción: ${action} en su estado actual`,
      { context: {entity, action} },
      ErrorType.INVALID_STATE
    )
    this.name = 'InvalidEntityStateError'
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'No tienes acceso a este recurso') {
    super(
      message, 
      {}, 
      ErrorType.UNAUTHORIZED
    )
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(
      message,
      {},
      ErrorType.FORBIDDEN
    )
    this.name = 'ForbiddenError'
  }
}