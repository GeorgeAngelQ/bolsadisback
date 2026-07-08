export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string | number) {
    super(`${entity} con id ${id} no encontrado`)
    this.name = 'EntityNotFoundError'
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, message: string) {
    super(`[${rule}] ${message}`)
    this.name = 'BusinessRuleViolationError'
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(entity: string, field: string) {
    super(`${entity} ya existe con ese ${field}`)
    this.name = 'DuplicateEntityError'
  }
}

export class InvalidEntityStateError extends DomainError {
  constructor(entity: string, action: string) {
    super(`${entity} no permite la acción: ${action} en su estado actual`)
    this.name = 'InvalidEntityStateError'
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'No tienes acceso a este recurso') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
